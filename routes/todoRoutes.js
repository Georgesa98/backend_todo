const express = require("express");
const {
  getAllTodos,
  addNewTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController.js");
const { verifyJWT } = require("../middleware/verifyJWT.js");
const router = express.Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getAllTodos)
  .post(addNewTodo)
  .patch(updateTodo)
  .delete(deleteTodo);

module.exports = router;
