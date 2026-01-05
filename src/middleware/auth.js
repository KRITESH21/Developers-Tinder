const jwt = require("jsonwebtoken");
const {User} = require("../models/user");

const userAuth = async (req,res,next) => {
const cookies = req.cookies;
try {
  const { token } = cookies;
  if (!token) {
    throw new Error("Token not authenticated");
  }
  // Validating the token
  const decodedToken = await jwt.verify(token, "SECRET_KEY", {expiresIn: '7d'});
  //decodedToken has the _id of the user
  const { _id } = decodedToken;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
req.user = user;
next();
} catch (error) {
  res.status(500).send("Error fetching profile " + error.message);
}
}

module.exports = userAuth;
