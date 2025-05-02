import jwt from "jsonwebtoken";

interface JWTPayload {
  userId?: string;
  email?: string;
}

const JWT_SECRET = import.meta.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "1d";

export const generateJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyJWT = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid token", { cause: error });
  }
};

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};
