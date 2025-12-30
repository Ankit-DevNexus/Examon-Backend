import { generateToken } from '../config/jwt.js';
import subUserModel from '../models/subUserModel.js';
import userModel from '../models/userModel.js';

export const adminSignup = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    const newUser = await userModel.create({
      fullname,
      email,
      password,
      role: role || 'admin',
      isActive: true,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error creating user', error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    // console.log("user", user);
    
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // ROLE CHECK
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Generate access & refresh tokens
    const { accessToken, refreshToken } = generateToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginHistory.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await user.save();

    // Store refresh token in secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const userData = user.toObject();
    delete userData.password;

    const safeUser = {
      _id: userData._id,
      fullname: userData.fullname,
      email: userData.email,
      role: userData.role,
    }

    res.status(200).json({
      message: 'Admin login successful',
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      msg: 'Server error during login',
      error: error.message,
    });
  }
};


export const getProfile = async (req, res) => {
  try {
    const { _id, role } = req.user;

    let user;

    if (role === 'admin' || role === 'user') {
      user = await userModel
        .findById(_id)
        .select('_id fullname email role');
    } else if (role === 'subUser') {
      user = await subUserModel
        .findById(_id)
        .select('_id fullName email role allowedTabs');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// export const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ msg: 'Email and password are required' });
//     }

//     const user = await userModel.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'User not found' });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

//     // Generate access & refresh tokens (PASS ONLY user._id)
//     const { accessToken, refreshToken } = generateToken(user._id);

//     user.refreshToken = refreshToken;
//     user.lastLogin = new Date();
//     user.loginHistory.push({
//       loginAt: user.lastLogin,
//       ip: req.ip,
//       userAgent: req.headers['user-agent'],
//     });

//     await user.save();

//     // Store refresh token in secure cookie
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 30 * 24 * 60 * 60 * 1000,
//     });

//     const userData = user.toObject();
//     delete userData.password;

//     res.status(200).json({
//       message: 'Login successful',
//       accessToken,
//       user: userData,
//     });
//   } catch (error) {
//     res.status(500).json({ msg: 'Server error during login', error: error.message });
//   }
// };

// export const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ msg: 'Email and password are required' });
//     }

//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'User not found' });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ msg: 'Invalid credentials' });
//     }

//     const token = generateToken(user);

//     user.lastLogin = new Date();
//     user.loginHistory.push({
//       loginAt: user.lastLogin,
//       ip: req.ip,
//       userAgent: req.headers['user-agent'],
//     });

//     await user.save();

//     const userData = user.toObject();
//     delete userData.password;

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: userData,
//     });
//   } catch (error) {
//     res.status(500).json({ msg: 'Server error during login', error: error.message });
//   }
// };
