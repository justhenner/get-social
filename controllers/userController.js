const { ObjectId } = require("mongoose").Types;
const { User, Thought } = require("../models");

// Aggregate function to get the number of students overall
const friendCount = async () =>
  User.aggregate()
    .count("friendCount")
    .then((numberOfFriends) => numberOfFriends);

// probably need the grade function to be a thought or reaction function most likely will just delete
//
// Aggregate function for getting the overall grade using $avg
const thoughts = async (userId) =>
  Thought.aggregate([
    // only include the given student by using $match
    { $match: { _id: ObjectId(thoughtId) } },
    {
      $unwind: "$thoughts",
    },
    {
      $group: {
        _id: ObjectId(userId),
      },
    },
  ]);

module.exports = {
  // Get all users
  getUsers(req, res) {
    User.find()
      .then(async (users) => {
        const userObj = {
          users,
          friendCount: await friendCount(),
        };
        return res.json(userObj);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // Get a single user
  getSingleUser(req, res) {
    User.findOne({ _id: req.params.userId })
      .select("-__v")
      .then(async (user) =>
        !user
          ? res.status(404).json({ message: "No user with that ID" })
          : res.json(user)
            )
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // create a new user
  createUser(req, res) {
    User.create(req.body)
      .then((user) => res.json(user))
      .catch((err) => res.status(500).json(err));
  },
  // Delete a user and remove them from the thought
  deleteUser(req, res) {
    User.findOneAndRemove({ _id: req.params.userId })
      .then((user) =>
        !user
          ? res.status(404).json({ message: "User no longer exists" })
          : Thought.findOneAndUpdate(
              { users: req.params.userId },
              { $pull: { users: req.params.userId } },
              { new: true }
            )
      )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "User deleted, but no thought found" })
          : res.json({ message: "User successfully deleted" })
      )
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  // Update a user
  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user with this id" })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Add a thought to a user
  addFriend(req, res) {
    console.log("You are adding a friend");
    console.log(req.body);
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: { _id: req.params.friendId } } },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user found with that ID" })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },
  // Remove thought from a user
  removeFriend(req, res) {
      // Remove friend from user's friends array
      User.updateOne(
        { _id: req.params.userId },
        { $pull: { friends: req.params.friendId } }
      )
        .then(({ nModified }) => {
          if (nModified === 0) {
            return res.status(404).json({ message: "Friend not found" });
          }
          return res.json({ message: "Friend successfully removed" });
        })
        .catch((err) => res.status(500).json(err));
  },
};