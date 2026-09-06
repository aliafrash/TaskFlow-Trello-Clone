const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");

// All user routes require authentication
router.use(protect);

router.get("/", getAllUsers);
router.get("/:id", getUserById);

// Admin-only management routes
router.patch("/:id/role", adminOnly, updateUserRole);
router.delete("/:id", adminOnly, deleteUser);

module.exports = router;
