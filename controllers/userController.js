const User = require("../models/User.js");
const Todo = require("../models/Todo.js");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  const users = await User.find().select().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No Users found" });
  }
  res.status(200).json(users);
};

const addNewUser = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name?.firstName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: "A user with the same email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10); // to hide the password in the DataBase
  const newUser = { email, password: hashedPassword, name };
  const user = await User.create(newUser);

  if (user) {
    res.status(201).json({ message: `New user ${name.firstName} created!` });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

const updateUser = async (req, res) => {
  const { id, email, password, name } = req.body;
  if (!email || !id || !name?.firstName) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const duplicate = await User.findOne({ email }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "A user with the same email already exists" });
  }

  (user.email = email), (user.name = name);
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.name.firstName} updated` });
};

const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const todo = await Todo.findOne({ user: id }).lean().exec();
  if (todo) {
    return res.status(400).json({ message: "User has assigned todos" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  await user.deleteOne();

  res.json("User Deleted");
};

module.exports = { getAllUsers, addNewUser, updateUser, deleteUser };
