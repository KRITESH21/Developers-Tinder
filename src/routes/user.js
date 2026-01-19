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

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        limit = limit >50 ? 50 : limit; // max limit 50
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select('fromUserId toUserId');

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach(request => {
            hideUsersFromFeed.add(request.fromUserId.toString());
            hideUsersFromFeed.add(request.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $ne: loggedInUser._id } },
                { _id: { $nin: Array.from(hideUsersFromFeed) } }
            ]
        }).select('firstName lastName age gender about skills').skip(skip).limit(limit);

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }

});

module.exports = userRouter;
