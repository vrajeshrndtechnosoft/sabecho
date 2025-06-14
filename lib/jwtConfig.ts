export interface JwtConfig {
  secret: string;
  expiresIn: string;
  algorithm: string;
}

const jwtConfig: JwtConfig = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: '7d', // Set expiration time for JWT tokens (e.g., '1h' for 1 hour)
  algorithm: 'HS256', // Algorithm used for signing/verifying tokens
};

export default jwtConfig;