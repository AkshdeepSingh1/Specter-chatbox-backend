const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const router = express.Router();
const nodemailer = require('nodemailer');
const user = require("../models/User");

//////////////////////creating a new user
router.post("/createuser", async (req, resp) => {
  try {
    // Check if user already exists
    let existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return resp.status(400).json({ error: "sorry the email already exists", status: false });
    }

    // Hash the password
    const codedpass = await bcrypt.hash(req.body.password, 10);
    
    // Generate MFA code
    const mfaCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Create new user
    let newUser = new user({
      username: req.body.username,
      email: req.body.email,
      password: codedpass,
      isEmailVerified: false,
      mfaCode,
      mfaCodeExpires: Date.now() + 600000, // 10 minutes
    });
    

    // Save the user
    newUser = await newUser.save();

    // Send MFA code via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVICE_EMAILID,
        pass: process.env.EMAIL_SERVICE_PASSWORD,
      },
    });

    const mailOptions = { 
      to: newUser.email,
      from: "specterchatapplication@gmail.com",
      subject: "SPECTER: Verify Your Email",
      text: `Your verification code is ${mfaCode}. It will expire in 10 minutes.`,
    };

    console.log("Mail options: ", mailOptions);

    try {
      transporter.sendMail(mailOptions);
      resp.json({
        message: "Verification code sent to your email",
        status: true,
      });
    } catch (err) {
      console.error("Error sending verification email: ", err);
      resp.status(500).send({ error: "Error sending verification email", status: false });
    }

    newUser = newUser.toObject();
    delete newUser.password;
    delete newUser.mfaCode;
    delete newUser.mfaCodeExpires;
    delete newUser.isEmailVerified;
  } catch (err) {
    console.error("Internal Server Error: ", err);
    resp.status(500).send({ err: "Internal Server Error", status: false });
  }
});


// Endpoint to verify MFA code
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const User = await user.findOne({ email });
    if (!User) {
      return res.status(400).json({ error: 'Invalid email or verification code', status: false });
    }
    console.log('User', User)
    console.log('mfaCode', otp)
    if (User.mfaCode !== otp || User.mfaCodeExpires < Date.now()) {
      await User.deleteOne({ email }); 
      return res.status(400).json({ error: 'Invalid or expired verification code', status: false });
    }

    User.isEmailVerified = true;
    User.mfaCode = undefined;
    User.mfaCodeExpires = undefined;
    await User.save();

    res.json({ newUser: User, status: true });
  } catch (err) {
    await User.deleteOne({ email }); 
    console.log(err)
    res.status(500).send({ error: 'Internal Server Error', status: false });
  }
});



//////////////////////Logging in a new user
router.post("/login", async (req, resp) => {
  //Finding if the user exists in the database or not

  try {
    let existingUser = await user.findOne({ email: req.body.email });
    if (existingUser && existingUser.isEmailVerified === false) {
      await User.deleteOne({ email: email });
      return res.status(400).json({ error: "Please check your email or password", status: false });
    }
    if (!existingUser) {
      return resp
        .status(400)
        .json({ error: "Please check your email or password", status: false });
    }
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return resp
        .status(400)
        .json({ error: "Please check your email or password", status: false });
    }
    existingUser = existingUser.toObject();
    delete existingUser.password;
    delete existingUser.mfaCode;
    delete existingUser.mfaCodeExpires;
    delete existingUser.isEmailVerified;

    console.log(existingUser);
    resp.json({ existingUser, status: true });
  } catch (err) {
    console.log(err)
    resp.status(500).send({ err: "Internal Server Error", status: false });
  }
  //.then(user => resp.json(user)).catch(err=> resp.json({error: "please enter a unique value for email"}));
});

//////////Setting avatar of the specific User.

router.post("/setAvatar/:id", async (req, resp) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await user.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage: avatarImage,
    });
    console.log(userData);
    return resp.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (err) {
    resp.status(500).send({ err: err, status: false });
  }
});

//////////////////////fetching all users form the database

router.get("/allusers/:id", async (req, resp) => {
  try {
    const users = await user
      .find({ _id: { $ne: req.params.id } })
      .select(["email", "username", "avatarImage", "_id"]);
    resp.json(users);
  } catch (err) {
    resp.status(500).send({ err: err, status: false });
  }
});

//////////////////////////
module.exports = router;
