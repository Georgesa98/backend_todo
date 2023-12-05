const Todo = require("../models/Todo.js");
const User = require("../models/User.js");

const getAllTodos = async (req, res) => {
  const todos = await Todo.find().select().lean();
  if (!todos?.length) {
    return res.status(200).json({ message: "No Todos found" });
  }
  const todosWithUser = await Promise.all(
    todos.map(async (todo) => {
      const user = await User.findById(todo.user).lean().exec();
      return { ...todo, firstName: user.firstName };
    })
  );
  res.status(200).json(todosWithUser);
};

const getAllTodosInDate = async (req, res) => {
  const date = req.params.date;
  if (!date) return res.status(400).json({ message: "No date received " });
  const todo = await Todo.find({ deadline: date }).lean().exec();
  if (!todo?.length) return res.status(200).json({ message: "No todos found" });
  return res.status(200).json(todo);
};

const addNewTodo = async (req, res) => {
  const { user, title, text, deadline } = req.body;
  if (!user || !title || !text || !deadline) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const duplicate = await Todo.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Todo with the same title already exists" });
  }
  const newTodo = { user, title, text, deadline };
  const todo = await Todo.create(newTodo);
  if (todo) {
    res
      .status(200)
      .json({ message: `New todo with the title ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid todo data" });
  }
};

const updateTodo = async (req, res) => {
  const { id, user, title, text, completed, deadline } = req.body;

  if (!title || !user || !text || !completed || !deadline) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const todo = await Todo.findById(id).exec();
  if (!todo) {
    return res.status(400).json({ message: "Todo not found" });
  }

  const duplicate = await Todo.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Title already exists" });
  }

  todo.user = user;
  todo.title = title;
  todo.text = text;
  todo.completed = completed;
  todo.deadline = deadline;

  const updatedTodo = todo.save();
  res.json({ message: `Todo with the title ${updatedTodo.title} updated` });
};

const deleteTodo = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Todo ID required" });
  }

  const todo = await Todo.findById(id).exec();

  if (!todo) {
    return res.status(400).json({ message: "Todo not found" });
  }

  const result = await todo.deleteOne();
  const reply = `Todo with the title ${result.title} deleted`;

  res.json(reply);
};

module.exports = {
  getAllTodos,
  getAllTodosInDate,
  addNewTodo,
  updateTodo,
  deleteTodo,
};
