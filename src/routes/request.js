const express = require("express");
const requestRouter = express.Router();
const userAuth = require("../middleware/auth");
const { User } = require("../models/user");
const { connectionRequest } = require("../models/connectionRequest");
requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(`Connection request sent by ${user.firstName}`);
});

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status; // 'interested' or 'ignored'

      // case 1: validate status
      const allowedStatuses = ["interested", "ignored"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      // case 2: validate that users can't send request to each other

      const existingConnectionRequest =
        await connectionRequest.ConnectionRequest.findOne({
          $or: [
            { fromUserId: fromUserId, toUserId: toUserId },
            { fromUserId: toUserId, toUserId: fromUserId },
          ],
        });
      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Connection request already exists between these users.",
        });
      }

      // case 3: if requested user doesn't exists

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          message: "The user you are trying to connect to does not exist.",
        });
      }

      const connectionRequest = new connectionRequest({
        fromUserId: fromUserId,
        toUserId: toUserId,
        status: status,
      });
      await connectionRequest.save();
      res.status(201).json({
        message: req.user.firstName + " has " + status + toUser.firstName,
        connectionRequest,
      });
    } catch (error) {
      throw new Error("Error " + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      // case 1: validate status
      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const connectionRequest = await connectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "No pending connection request found." });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save(); // if found interested then update status to accepted/rejected
      res.status(200).json({
        message:
          "Connection request " + status + " by " + loggedInUser.firstName,
        data,
      });
    } catch (error) {
      throw new Error("Error " + error.message);
    }
  }
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    const allowedStatuses = ["accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const connectionRequest = await connectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest) {
      return res
        .status(404)
        .json({ message: "No pending connection request found." });
    }
    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.status(200).json({
      message:
        "Connection request " + status + " by " + loggedInUser.firstName,
      data,
    });
  } catch (error) {
    throw new Error("Error " + error.message);
  }
});


userRouter.post("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await connectionRequest.find({ toUserId: loggedInUser._id, status: 'interested' }).populate('fromUserId', 'firstName lastName email');
        res.status(200).json({ connectionRequests });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = requestRouter;