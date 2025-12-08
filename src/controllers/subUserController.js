import { generateToken } from "../config/jwt.js";
import { generateOTP, sendVerificationOTP } from "../helpers/otpHelper.js";
import subUserModel from "../models/subUserModel.js";

//  USER SIGNUP
export const subUserSignup = async (req, res) => {
  try {
    const { fullName, email, password, role, allowedTabs } = req.body;

    if (!fullName || !email || !password || !allowedTabs) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const existingUser = await subUserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity

    // Create new user
    const newUser = await subUserModel.create({
      fullName,
      email,
      password,
      role: role || 'user',
      allowedTabs,
      isActive: false,
      otp,
      otpExpiresAt,
    });

    await sendVerificationOTP(email, otp);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        allowedTabs: newUser.allowedTabs
      },
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error creating user', error: error.message });
  }
};

//  User Login
export const subUserlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await subUserModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    // Block inactive users
    if (!user.isActive) {
      return res.status(403).json({
        msg: 'Your account is not verified. Please verify your account or contact us.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    // Continue with your existing login logic
    const { accessToken, refreshToken, expiresIn } = generateToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginHistory.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });


    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      expiresIn,
      user: {
        _id: user._id,
        fullname: user.fullName,
        email: user.email,
        role: user.role,
        allowedTabs: user.allowedTabs
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ msg: 'Server error during login', error: error.message });
  }
};



// SUB USER OTP VERIFY
export const verifySubUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required." });

    const user = await subUserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email." });

    if (user.isActive)
      return res.status(400).json({ message: "Account already verified." });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP." });

    if (new Date() > new Date(user.otpExpiresAt))
      return res.status(400).json({ message: "OTP expired." });

    // Activate account
    user.isActive = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


// SUB USER RESEND OTP
export const resendSubUserOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required." });

    const user = await subUserModel.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Account not found." });

    if (user.isActive)
      return res.status(400).json({ message: "Account already verified." });

    // Prevent spamming (60 sec limit)
    if (user.otpExpiresAt) {
      const lastOtpTime =
        new Date(user.otpExpiresAt).getTime() - 5 * 60 * 1000;
      if (Date.now() - lastOtpTime < 60 * 1000) {
        return res.status(429).json({
          message: "Please wait 60 seconds before requesting another OTP.",
        });
      }
    }

    const newOtp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendVerificationOTP(email, newOtp);

    res
      .status(200)
      .json({ success: true, message: "New OTP sent successfully." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


// -------------------------------------
// UPDATE / EDIT SUB USER
// -------------------------------------
export const editSubUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, allowedTabs, password, isActive } = req.body;

    const user = await subUserModel.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "Sub User not found" });
    }

    // Update fullname
    if (fullName) user.fullName = fullName;

    // Update role safely
    if (role) user.role = role;

    // Update allowedTabs if array
    if (Array.isArray(allowedTabs)) {
      user.allowedTabs = allowedTabs;
    }

    // Update active/inactive
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    // Update password (hashed automatically by pre-save hook)
    if (password) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user,
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


// -------------------------------------
// DELETE SUB USER
// -------------------------------------
export const deleteSubUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await subUserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ msg: "Sub User not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Sub User deleted successfully",
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
