const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 30,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if(!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if(!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        const allowedGenders = ["male", "female", "other"];
        if (!allowedGenders.includes(value.toLowerCase())) {
          throw new Error("Gender must be male, female, or other");
        }
      },
    },
    about: {
      type: String,
      default: " I am a new user.",
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length>5) {
          throw new Error("A user can have a maximum of 5 skills");
        }
      }
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJwt = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "SECRET_KEY", {expiresIn: '7d'});
  return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
  return isPasswordValid;
}

const User = mongoose.model("User", userSchema);
module.exports = {User};
