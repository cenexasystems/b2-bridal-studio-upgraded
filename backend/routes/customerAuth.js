const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Centralized utility to send transactional emails via Brevo HTTP API
async function sendEmail({ to, toName, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SMTP_USER || process.env.EMAIL_USER;

  if (!apiKey) {
    console.warn('[Email Service] Warning: BREVO_API_KEY environment variable is not configured. Email will not be sent.');
    throw new Error('BREVO_API_KEY environment variable is missing.');
  }

  const payload = {
    sender: {
      name: "B2 Bridal Studio",
      email: senderEmail || "no-reply@b2bridalstudio.com"
    },
    to: [
      {
        email: to,
        name: toName || to
      }
    ],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Email Service] Brevo HTTP API error response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(`Brevo API returned status ${response.status}: ${JSON.stringify(responseData)}`);
    }

    console.log(`[Email Service] Email sent successfully to ${to}. Message ID: ${responseData.messageId}`);
    return { success: true, messageId: responseData.messageId };

  } catch (error) {
    console.error('[Email Service] Detailed API error logging:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Startup logs to check Brevo HTTP API environment variables
if (process.env.BREVO_API_KEY) {
  console.log('[Email Service] Brevo HTTP API integration initialized. Ready to send emails.');
} else {
  console.warn('[Email Service] Warning: BREVO_API_KEY environment variable is not set.');
}

// 🔹 REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, dob } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      phone,
      password: hashed
    };

    if (dob) {
      userData.dob = dob;
    }

    const user = new Customer(userData);

    await user.save();

    res.json({
      message: "Registered",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Wrong password" });
    }

    user.lastLoginDate = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login success",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob
      },
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 GOOGLE AUTH
router.post('/google-auth', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await Customer.findOne({ googleId });

    if (!user) {
      user = await Customer.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (!user.authProvider || user.authProvider === 'local') {
          user.authProvider = user.password ? 'local' : 'google';
        }
        await user.save();
      } else {
        // Create new customer with Google data
        user = new Customer({
          name,
          email,
          googleId,
          authProvider: 'google'
        });
        await user.save();
      }
    }

    user.lastLoginDate = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google authentication successful',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob
      },
      token
    });

  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// 🔹 FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Customer.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Prepare reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Georgia', serif; background-color: #1a1a1a; color: #f5f5f5; padding: 40px; border: 2px solid #c9a84c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c9a84c; font-size: 28px; margin: 0; letter-spacing: 2px;">B2 BRIDAL STUDIO</h1>
          <div style="width: 60px; height: 2px; background-color: #c9a84c; margin: 15px auto;"></div>
        </div>
        
        <h2 style="color: #c9a84c; font-size: 20px; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p style="color: #d4d4d4; line-height: 1.8; font-size: 15px;">Dear ${user.name || 'Valued Customer'},</p>
        
        <p style="color: #d4d4d4; line-height: 1.8; font-size: 15px;">
          We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong style="color: #c9a84c;">1 hour</strong>.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="background-color: #c9a84c; color: #1a1a1a; padding: 14px 40px; text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: 1px; border-radius: 4px; display: inline-block;">
            RESET PASSWORD
          </a>
        </div>
        
        <p style="color: #888; font-size: 13px; line-height: 1.6;">
          If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <div style="border-top: 1px solid #333; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} B2 Bridal Studio. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        toName: user.name,
        subject: 'Password Reset - B2 Bridal Studio',
        htmlContent
      });
      console.log(`[Forgot Password] Reset email request completed successfully for: ${email}`);
    } catch (mailError) {
      console.error('[Forgot Password] Send HTTP mail error:', mailError.message);
      throw new Error(`Failed to send password reset email: ${mailError.message}`);
    }

    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });

  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// 🔹 RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Hash the received token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login with your new password.' });

  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// 🔹 SEND EMAIL OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({ error: "Name, email, and phone number are required" });
    }

    // Basic format validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }

    // Generate a 6-digit OTP
    const otpVal = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP using bcryptjs
    const otpHash = await bcrypt.hash(otpVal, 10);
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Find or create customer
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Update existing customer's details and set OTP
      customer.name = name;
      customer.phone = phone;
      if (dob) customer.dob = dob;
      customer.otp = otpHash;
      customer.otpExpires = otpExpires;
      customer.authProvider = customer.authProvider || 'email-otp';
      await customer.save();
    } else {
      // Create new customer
      const userData = {
        name,
        email,
        phone,
        otp: otpHash,
        otpExpires,
        authProvider: 'email-otp',
        isVerified: false
      };
      if (dob) userData.dob = dob;
      
      customer = new Customer(userData);
      await customer.save();
    }

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Georgia', serif; background-color: #1a1a1a; color: #f5f5f5; padding: 40px; border: 2px solid #c9a84c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c9a84c; font-size: 28px; margin: 0; letter-spacing: 2px;">B2 BRIDAL STUDIO</h1>
          <div style="width: 60px; height: 2px; background-color: #c9a84c; margin: 15px auto;"></div>
        </div>
        
        <h2 style="color: #c9a84c; font-size: 20px; text-align: center; margin-bottom: 20px;">Email Verification OTP</h2>
        
        <p style="color: #d4d4d4; line-height: 1.8; font-size: 15px;">Dear ${name || 'Valued Customer'},</p>
        
        <p style="color: #d4d4d4; line-height: 1.8; font-size: 15px;">
          Thank you for choosing B2 Bridal Studio. Please use the following One-Time Password (OTP) to complete your login/registration process. This OTP is valid for <strong style="color: #c9a84c;">5 minutes</strong>.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <span style="background-color: rgba(201, 168, 76, 0.15); color: #c9a84c; border: 1px dashed #c9a84c; padding: 12px 30px; font-size: 28px; font-weight: bold; letter-spacing: 6px; border-radius: 4px; display: inline-block;">
            ${otpVal}
          </span>
        </div>
        
        <p style="color: #888; font-size: 13px; line-height: 1.6;">
          If you did not request this OTP, please ignore this email or contact support if you have concerns.
        </p>
        
        <div style="border-top: 1px solid #333; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} B2 Bridal Studio. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        toName: name,
        subject: 'Your One-Time Password (OTP) - B2 Bridal Studio',
        htmlContent
      });
      console.log(`[OTP] OTP email request completed successfully for: ${email}`);
    } catch (mailError) {
      console.error('[OTP] Send HTTP OTP error:', mailError.message);
      throw new Error(`Failed to send OTP email: ${mailError.message}`);
    }

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

// 🔹 VERIFY EMAIL OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if OTP is expired
    if (!customer.otpExpires || Date.now() > customer.otpExpires) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // Verify OTP hash
    const match = await bcrypt.compare(otp, customer.otp);
    if (!match) {
      return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
    }

    // OTP is valid! Activate session immediately
    customer.isVerified = true;
    customer.otp = undefined;
    customer.otpExpires = undefined;
    await customer.save();

    customer.lastLoginDate = new Date();
    await customer.save();

    const token = jwt.sign(
      { id: customer._id, email: customer.email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Authentication successful",
      user: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        dob: customer.dob
      },
      token
    });

  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// 📥 GET ALL CUSTOMERS (Secure - Owner only)
const { verifyToken, verifyRole } = require('../middleware/auth');
router.get('/list', verifyToken, verifyRole(['owner']), async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE CUSTOMER STATUS (Secure - Owner only)
router.patch('/:id/status', verifyToken, verifyRole(['owner']), async (req, res) => {
  try {
    const { accountStatus } = req.body;
    if (!['Active', 'Suspended'].includes(accountStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;