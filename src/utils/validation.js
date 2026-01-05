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

module.exports = {
  validateSignUpData,
};
