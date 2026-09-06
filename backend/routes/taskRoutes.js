const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateStatus,
  assignTask,
  addComment,
  deleteComment
} = require("../controllers/taskController");

// All task routes require authentication
router.use(protect);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/status", updateStatus);
router.patch("/:id/assign", assignTask);

// Comments
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

module.exports = router;