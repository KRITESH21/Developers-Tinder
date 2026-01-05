const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation");
const bcrypt = require("bcrypt");

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

app.use(express.json());

// Adding data to the database
app.post("/signup", async (req, res) => {
  // Signup logic here
  const { firstName, lastName, email, gender, about, skills, password } = req.body;
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    res.send("User logged in successfully");
  } catch (error) {
    res.status(500).send("Error logging in user "+ error.message);
  }
});

// Fetching data from the database

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

// Fetching data from the database by email

app.get("/userByEmail", async (req, res) => {
  try {
    const email = await User.find({ email: "kritesh21march@gmail.com" });
    console.log(email);
    res.send(email);
  } catch (err) {
    res.status(500).send("Error fetching user by email");
  }
});

// Deleting data from the database

app.delete("/delete", async (req, res) => {
  const id = req.body.id;
  try {
    await User.findByIdAndDelete(id);
    res.send("User deleted");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

// Updating the data from the database

app.patch("/update/:id", async (req, res) => {
  const id = req.params?.id;
  const data = req.body;
  try {
    // API level validations
    const ALLOWED_UPDATES = ["password", "about", "skills"];
    const isUpdateAllowed = Object.keys(data).every((e) =>
      ALLOWED_UPDATES.includes(e)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    await User.findByIdAndUpdate(id, data, { runValidators: true });
    res.send("User updated");
  } catch (err) {
    res.status(500).send("Error updating user " + err.message);
  }
});
