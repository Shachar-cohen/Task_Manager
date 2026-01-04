const express = require("express");
const router = express.Router();

const {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
  improveTaskWithAI,
  acceptAI,
  undoAI,
  updateCompleted,
} = require("../controllers/taskController");


const authMiddleware = require("../middleware/authMiddleware");

// CRUD
router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.delete("/:id", authMiddleware, deleteTask);
router.put("/:id", authMiddleware, updateTask);

router.post("/improve", authMiddleware, improveTaskWithAI);
router.post("/:id/accept-ai", authMiddleware, acceptAI);
router.post("/:id/undo-ai", authMiddleware, undoAI);
router.patch("/:id/completed", authMiddleware, updateCompleted);
router.post("/:id/completed", authMiddleware, updateCompleted);


module.exports = router;
