const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const {User} = require("./models/user");
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

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
