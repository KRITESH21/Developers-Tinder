const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const {User} = require("../models/user");
const { validateSignUpData } = require('../utils/validation');


authRouter.post("/signup", async (req, res) => {
  // Signup logic here
  const { firstName, lastName, email, gender, about, skills, password } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  // const user = new User(req.body); Not a good way
  const user = new User({
    firstName,
    lastName,
    email,
    gender,
    about,
    skills,
    password: hashedPassword,
  });
  try {
    validateSignUpData(req);
    await user.save();
    res.send("User signed up");
  } catch (error) {
    res.status(500).send("Error signing up user");
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    // console.log(user);
    if (!user) {
      throw new Error("User not found");
    }
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // Create a JWT token
      const token = await user.getJwt();
      // Add the token in the cookie
      res.cookie("token", token);
      res.send("User logged in successfully");
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    res.status(500).send("Error logging in user " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now())});
  res.send("User logged out successfully");
})

module.exports = authRouter;