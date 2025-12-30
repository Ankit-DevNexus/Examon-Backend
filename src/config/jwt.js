import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const accessTokenExpiry = 24 * 60 * 60; // 1 day
  const refreshTokenExpiry = 30 * 24 * 60 * 60; // 30 days

  // console.log("user", user);
  
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: accessTokenExpiry }
  );

  // console.log("user", accessToken);


  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: refreshTokenExpiry }
  );

  return { accessToken, refreshToken, expiresIn: accessTokenExpiry };
};
