// import jwt from 'jsonwebtoken';

// export const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user._id,
//       email: user.email,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || '30d' },
//   );
// };

// export const verifyToken = (token) => {
//   return jwt.verify(token, process.env.JWT_SECRET);
// };

import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};
