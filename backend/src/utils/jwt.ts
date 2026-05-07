import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '8h';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '24h';

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Generate access token (JWT)
 * @param payload - User data to encode in token
 * @returns JWT access token string
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
      issuer: 'doc-patient-api',
      audience: 'doc-patient-app',
    } as jwt.SignOptions
  );
};

/**
 * Generate refresh token
 * @param payload - User data to encode in token
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRATION,
      issuer: 'doc-patient-api',
      audience: 'doc-patient-app',
    } as jwt.SignOptions
  );
};

/**
 * Verify and decode access token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'doc-patient-api',
      audience: 'doc-patient-app',
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('[JWT] Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('[JWT] Invalid token:', error.message);
    } else {
      console.error('[JWT] Token verification error:', error);
    }
    return null;
  }
};

/**
 * Verify and decode refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'doc-patient-api',
      audience: 'doc-patient-app',
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('[JWT] Refresh token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('[JWT] Invalid refresh token:', error.message);
    } else {
      console.error('[JWT] Refresh token verification error:', error);
    }
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer token123")
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
