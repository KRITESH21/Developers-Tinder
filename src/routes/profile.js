const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middleware/auth");
const {validateEditProfileData} = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(500).send("Error fetching profile " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid fields in edit profile");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((field) => {
      loggedInUser[field] = req.body[field];
    });
    await loggedInUser.save();
    // res.send("Profile updated successfully");
    res.json({ message: "Profile updated successfully", user: loggedInUser });
  } catch (error) {
    res.status(500).send("Error updating profile " + error.message);
  }
});

module.exports = profileRouter;
