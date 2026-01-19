const express = require("express");
const requestRouter = express.Router();
const userAuth = require("../middleware/auth");
const { User } = require("../models/user");
const { ConnectionRequest } = require("../models/connectionRequest");

userRouter.post("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.get("user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    }).populate(
      "fromUserId toUserId",
      "firstName lastName age gender about skills",
    );

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
    });

    res.status(200).json({ connections: connectionRequests });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = userRouter;
