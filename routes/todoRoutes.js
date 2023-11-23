const express = require("express");
const {
  getAllTodos,
  addNewTodo,
  updateTodo,
  deleteTodo,
  getAllTodosInDate,
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

router.route("/:date").get(getAllTodosInDate);

module.exports = router;
