import { jwtVerify, JWTPayload } from 'jose';

export function getEncodedSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const encodedSecret = getEncodedSecret();
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
