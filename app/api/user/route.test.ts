import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Regression tests for the access-control hole in /api/user.
 *
 * The route used to identify the caller by a `phoneNumber` supplied in the
 * request, so anybody could read or overwrite any user's health record. It
 * must now derive the caller from the session cookie only.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  otpCode: {
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  dailyLog: {
    upsert: vi.fn(),
  },
  foodLog: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  food: {
    findMany: vi.fn(),
  },
  questionnaireAnswer: {
    upsert: vi.fn(),
  },
  /** The global health-score weights an admin controls. */
  appSetting: {
    findMany: vi.fn(async () => []),
  },
  /** Run the callback with the mock itself as the transaction client. */
  $transaction: vi.fn(async (fn: (tx: any) => Promise<unknown>) => fn(prismaMock)),
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const cookieStore = { get: vi.fn() };

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}));

const verifyTokenMock = vi.fn();
vi.mock('@/lib/auth', () => ({ verifyToken: verifyTokenMock }));

const { GET, POST } = await import('./route');

/**
 * What the session check inside `getSessionUserId` needs to see (isActive,
 * tokenVersion) plus a complete profile for the route's own lookup. Both
 * queries hit the same `user.findUnique` mock.
 */
const activeUser = {
  id: 'user_from_session',
  phoneNumber: '09123456789',
  fullName: 'Victim',
  gender: 'MALE',
  activityLevel: 'LIGHT',
  nutritionGoal: 'WEIGHT_LOSS',
  painRegions: null,
  questionnaire: null,
  dailyLogs: [],
  isActive: true,
  tokenVersion: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.get.mockReturnValue(undefined);
  verifyTokenMock.mockResolvedValue(null);
  prismaMock.user.findUnique.mockResolvedValue(activeUser);
});

describe('/api/user access control', () => {
  it('rejects GET when there is no session cookie', async () => {
    const res = await GET();

    expect(res.status).toBe(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects GET when the token is invalid', async () => {
    cookieStore.get.mockReturnValue({ value: 'not-a-real-token' });
    verifyTokenMock.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects GET when the token has no user id', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ some: 'payload' });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('looks the user up by the session id, not by a phone number', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'user_from_session' });
    prismaMock.user.findUnique.mockResolvedValue(activeUser);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user_from_session' } })
    );
    // The phone number of another user must not be able to select the record.
    expect(body.id).toBe('user_from_session');
  });

  it('rejects POST when there is no session cookie', async () => {
    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '09123456789', fullName: 'ATTACKER' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('never lets a client write the role or the id', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'user_from_session' });
    prismaMock.user.upsert.mockResolvedValue({ id: 'user_from_session' });

    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '09123456789',
        role: 'ADMIN',
        id: 'some_other_user',
        fullName: 'Legit Update',
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);

    const call = prismaMock.user.upsert.mock.calls[0]![0] as any;
    expect(call.where).toEqual({ id: 'user_from_session' });
    expect(call.update).not.toHaveProperty('role');
    expect(call.update).not.toHaveProperty('id');
    expect(call.update).not.toHaveProperty('phoneNumber');
    expect(call.update.fullName).toBe('Legit Update');
  });

  it('treats a sync with nothing to write as a no-op, not an error', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'user_from_session' });
    prismaMock.user.findUnique.mockResolvedValue(activeUser);

    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // A brand new user only has a phone number, which the server already
      // knows. That must not be reported as a client error.
      body: JSON.stringify({ phoneNumber: '09123456789' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('rejects an invalid value for a validated field', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'user_from_session' });

    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: 9999 }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('maps the client lower-case gender onto the Prisma enum', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'user_from_session' });
    prismaMock.user.upsert.mockResolvedValue({ id: 'user_from_session' });

    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: 'female', activityLevel: 'moderate' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const call = prismaMock.user.upsert.mock.calls[0]![0] as any;
    expect(call.update.gender).toBe('FEMALE');
    expect(call.update.activityLevel).toBe('MODERATE');
  });
});

/**
 * The client syncs the *whole* profile, and the profile it holds came from
 * the server, where the fields a user has not filled in yet are `null`.
 *
 * Treating those as invalid made every save fail until the user had filled
 * in every single field - a new user could not save their profile at all.
 */
describe('/api/user null fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'user_from_session' });
    prismaMock.user.findUnique.mockResolvedValue(activeUser);
    prismaMock.user.upsert.mockResolvedValue({ id: 'user_from_session' });
  });

  const nullFields = [
    'fullName', 'age', 'gender', 'height', 'weight',
    'activityLevel', 'jobTitle', 'underlyingDiseases',
    'medications', 'nutritionGoal',
  ];

  for (const field of nullFields) {
    it(`accepts "${field}" being null - it means "clear it"`, async () => {
      const req = new Request('http://x/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: null }),
      });

      const res = await POST(req);

      expect(res.status).toBe(200);
      const call = prismaMock.user.upsert.mock.calls[0]![0] as any;
      expect(call.update).toHaveProperty(field);
    });
  }

  it('accepts the whole profile the server hands back', async () => {
    const serverProfile = {
      id: 'user_from_session',
      phoneNumber: '09123456789',
      fullName: null,
      age: null,
      gender: null,
      height: null,
      weight: null,
      activityLevel: null,
      jobTitle: null,
      underlyingDiseases: null,
      medications: null,
      termsAccepted: false,
      currentWizardStep: 0,
      nutritionGoal: null,
      painRegions: null,
      painZones: [],
      questionnaire: null,
      questionnaireAnswers: null,
      dailyLogs: [],
    };

    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverProfile),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
  });

  it('still rejects a value that is neither null nor valid', async () => {
    const req = new Request('http://x/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 42 }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });
});
