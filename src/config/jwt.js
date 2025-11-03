import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const accessTokenExpiry = 15 * 60; // 15 minutes
  const refreshTokenExpiry = 30 * 24 * 60 * 60; // 30 days

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: accessTokenExpiry });

  const refreshToken = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: refreshTokenExpiry,
  });

  return { accessToken, refreshToken, expiresIn: accessTokenExpiry };
};
