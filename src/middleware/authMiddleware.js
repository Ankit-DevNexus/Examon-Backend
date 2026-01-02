import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import subUserModel from '../models/subUserModel.js';

export const Authenticate = async (req, res, next) => {
  try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({ message: 'No token, authorization denied' });
    // }

    // const token = authHeader.split(' ')[1];

    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("DECODED TOKEN:", decoded);

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    let user;
    // console.log('decoded.role', decoded.role);

    if (decoded.role === 'admin' || decoded.role === 'user') {
      user = await userModel.findById(decoded.id).lean();
    } else if (decoded.role === 'subUser') {
      user = await subUserModel.findById(decoded.id).lean();
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access token expired or invalid' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
