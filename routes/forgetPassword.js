const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Request Password Reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "User with this email does not exist", status: false });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with the token
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVICE_EMAILID,
        pass: process.env.EMAIL_SERVICE_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: 'specterchatapplication@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:3001/forgetPassword?token=${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('error', err)
        return res.status(500).send({ error: 'Error sending email', status: false });
      }
      res.json({ message: 'Password reset link sent to your email', status: true });
    });
  } catch (err) {
    console.log('error', err)
    res.status(500).send({ error: 'Internal Server Error', status: false });
  }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      // Find the user by the reset token and validate
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Check if the token is not expired
      });
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired password reset token', status: false });
      }
  
      // Update the user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = ''; // Clear the reset token
      user.resetPasswordExpires = null; // Clear the expiry
  
      await user.save();
  
      res.json({ message: 'Password reset successful', status: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', status: false });
    }
  });

module.exports = router;
