// Validation at backend level. Already applied it in DB level using mongoose schema

const validator = require("validator");

const validateSignUpData = async (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("All the fields are required");
  } else if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Weak password");
  }
};

const validateEditProfileData = async (req) => {
  const allowedEditFields = ["about", "skills", "firstName", "lastName", "gender", "about"];
  const isEditAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));
  return isEditAllowed;
}

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};