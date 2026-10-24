import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Regression tests for the OTP abuse limits.
 *
 * Previously `send-otp` had no rate limit at all (so anyone could trigger
 * unlimited paid SMS) and `verify-otp` had no attempt counter (so the 6 digit
 * code could be brute-forced).
 */

const prismaMock = {
  otpCode: {
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const sendOtpSmsMock = vi.fn();
const smsFailureMessageMock = vi.fn(
  () => 'ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید',
);
vi.mock('@/lib/sms', () => ({
  sendOtpSms: sendOtpSmsMock,
  smsFailureMessage: smsFailureMessageMock,
}));

const cookieSet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet }),
}));

const signMock = vi.fn(async () => 'signed-token');
vi.mock('jose', () => ({
  SignJWT: class {
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return signMock(); }
  },
}));

const { POST: sendOtp } = await import('./send-otp/route');
const { POST: verifyOtp } = await import('./verify-otp/route');
const { hashPassword } = await import('@/lib/password');

const PHONE = '09123456789';

/** Codes are stored hashed, so the fixture must hold the hash, not the code. */
const HASHED_CODE = await hashPassword('123456');

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.otpCode.count.mockResolvedValue(0);
  prismaMock.otpCode.updateMany.mockResolvedValue({ count: 0 });
  prismaMock.otpCode.create.mockImplementation(async ({ data }: any) => ({
    id: 'otp_1',
    ...data,
    attempts: 0,
    consumed: false,
  }));
  prismaMock.otpCode.update.mockResolvedValue({});
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.upsert.mockResolvedValue({ id: 'user_1', phoneNumber: PHONE, tokenVersion: 0 });
  sendOtpSmsMock.mockResolvedValue(undefined);
  smsFailureMessageMock.mockReturnValue('ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید');
});

describe('send-otp rate limiting', () => {
  it('rejects a phone number that has exhausted its send quota', async () => {
    prismaMock.otpCode.count.mockResolvedValue(3);

    const res = await sendOtp(
      new Request('http://x/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE }),
      })
    );

    expect(res.status).toBe(429);
    expect(sendOtpSmsMock).not.toHaveBeenCalled();
  });

  it('sends the SMS when under the quota', async () => {
    prismaMock.otpCode.count.mockResolvedValue(0);

    const res = await sendOtp(
      new Request('http://x/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE }),
      })
    );

    expect(res.status).toBe(200);
    expect(sendOtpSmsMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid phone number before touching the database', async () => {
    const res = await sendOtp(
      new Request('http://x/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '12345' }),
      })
    );

    expect(res.status).toBe(400);
    expect(prismaMock.otpCode.create).not.toHaveBeenCalled();
  });

  it('burns the code when the SMS could not be delivered', async () => {
    sendOtpSmsMock.mockRejectedValue(new Error('sms gateway down'));

    const res = await sendOtp(
      new Request('http://x/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE }),
      })
    );

    expect(res.status).toBe(502);
    // The record must be marked consumed so it cannot be used.
    expect(prismaMock.otpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'otp_1' },
        data: { consumed: true },
      })
    );
  });

  it('answers with the provider-specific message', async () => {
    smsFailureMessageMock.mockReturnValueOnce('پیامک ارسال نشد: تنظیمات سرویس پیامک روی سرور کامل نیست.');
    sendOtpSmsMock.mockRejectedValue(new Error('not configured'));

    const res = await sendOtp(
      new Request('http://x/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE }),
      })
    );

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain('تنظیمات سرویس پیامک');
  });
});

describe('verify-otp attempt limiting', () => {
  const makeOtp = (overrides: Record<string, unknown> = {}) => ({
    id: 'otp_1',
    phoneNumber: PHONE,
    code: HASHED_CODE,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    consumed: false,
    attempts: 0,
    createdAt: new Date(),
    ...overrides,
  });

  it('rejects a wrong code', async () => {
    prismaMock.otpCode.findFirst.mockResolvedValue(makeOtp());

    const res = await verifyOtp(
      new Request('http://x/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE, code: '999999' }),
      })
    );

    expect(res.status).toBe(401);
    // The failed attempt is counted.
    expect(prismaMock.otpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ attempts: 1 }) })
    );
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it('burns the code once the attempt budget is spent', async () => {
    prismaMock.otpCode.findFirst.mockResolvedValue(makeOtp({ attempts: 5 }));

    const res = await verifyOtp(
      new Request('http://x/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE, code: '123456' }),
      })
    );

    // Even the *correct* code is refused once the budget is gone.
    expect(res.status).toBe(429);
    expect(cookieSet).not.toHaveBeenCalled();
    expect(prismaMock.otpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { consumed: true } })
    );
  });

  it('accepts the correct code and issues a session cookie', async () => {
    prismaMock.otpCode.findFirst.mockResolvedValue(makeOtp());

    const res = await verifyOtp(
      new Request('http://x/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE, code: '123456' }),
      })
    );

    expect(res.status).toBe(200);
    expect(cookieSet).toHaveBeenCalledWith(
      'session',
      'signed-token',
      expect.objectContaining({ httpOnly: true, path: '/' })
    );
  });

  it('rejects a malformed code without consuming an attempt', async () => {
    prismaMock.otpCode.findFirst.mockResolvedValue(makeOtp());

    const res = await verifyOtp(
      new Request('http://x/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE, code: 'abcdef' }),
      })
    );

    expect(res.status).toBe(401);
    expect(prismaMock.otpCode.update).not.toHaveBeenCalled();
  });

  it('rejects an expired code', async () => {
    prismaMock.otpCode.findFirst.mockResolvedValue(
      makeOtp({ expiresAt: new Date(Date.now() - 1000) })
    );

    const res = await verifyOtp(
      new Request('http://x/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE, code: '123456' }),
      })
    );

    expect(res.status).toBe(401);
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it('refuses to sign in a deactivated account and issues no session', async () => {
    prismaMock.otpCode.findFirst.mockResolvedValue(makeOtp());
    prismaMock.user.findUnique.mockResolvedValue({ isActive: false });

    const res = await verifyOtp(
      new Request('http://x/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: PHONE, code: '123456' }),
      })
    );

    expect(res.status).toBe(403);
    expect(cookieSet).not.toHaveBeenCalled();
    // A blocked sign-in must not leave an "active" timestamp behind.
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });
});
