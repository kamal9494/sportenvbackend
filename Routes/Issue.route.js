const express = require("express");
const router = express.Router();
const verifyToken = require("./verifyToken");
const Issue = require("../Models/Issue.model");
const Sport = require("../Models/Sport.model");

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access, only for admins" });
    }
    const results = await Issue.find({}, { __v: 0, _id: 0 });
    res.status(200).send(results);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/", verifyToken, async (req, res) => {
  try {
    const { id, sid, studentName, quantity } = req.body;
    const item = await Sport.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item Not Available" });
    }
    if (item.quantity - quantity < 0) {
      res.status(400).json({ message: "Item Not Available" });
    }
    const updatedItem = await Sport.findByIdAndUpdate(
      { _id: id, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(400).json({ message: "Insufficient Quantity" });
    }
    const issueRequest = new Issue({
      sid: sid,
      studentName: studentName,
      sportName: item.sportName,
      quantity: quantity,
      issuedDate: Date.now(),
    });

    const result = await issueRequest.save();

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
