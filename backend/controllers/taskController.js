const Task = require("../models/Task");
const User = require("../models/User");

// Helper to populate standard task fields
const populateTask = (query) => {
  return query
    .populate("creator", "name email role")
    .populate("assignedUser", "name email role")
    .populate("comments.user", "name email role")
    .populate("activities.user", "name email role");
};

// Create Task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedUser,
      status,
      priority,
      dueDate
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    // Role check: Normal users can only leave unassigned or assign to themselves
    let targetAssignee = assignedUser || null;
    if (req.user.role !== "admin" && targetAssignee) {
      if (targetAssignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Normal users can only assign tasks to themselves"
        });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      creator: req.user._id,
      assignedUser: targetAssignee,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,
      activities: [
        {
          user: req.user._id,
          action: "created",
          details: `created task in "${status || 'todo'}"`
        }
      ]
    });

    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Tasks
exports.getTasks = async (req, res) => {
  try {
    let query = {};

    // Normal users see their own created tasks, assigned tasks, or unassigned tasks eligible for claim
    if (req.user.role !== "admin") {
      query.$or = [
        { creator: req.user._id },
        { assignedUser: req.user._id },
        { assignedUser: null }
      ];
    }

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Optional priority filter
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const tasks = await populateTask(Task.find(query)).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Single Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Permission check: admin, creator, assigned user, or unassigned task
    const creatorId = task.creator?._id ? task.creator._id.toString() : task.creator?.toString();
    const assignedId = task.assignedUser?._id ? task.assignedUser._id.toString() : task.assignedUser?.toString();

    const isCreator = creatorId === req.user._id.toString();
    const isAssigned = assignedId === req.user._id.toString();
    const isUnassigned = !task.assignedUser;
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isUnassigned && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to view this task"
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Task Details
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAssigned = task.assignedUser?.toString() === req.user._id.toString();
    const isUnassigned = !task.assignedUser;
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isUnassigned && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to update this task"
      });
    }

    // Assignment permission check if assignedUser is updated
    if (req.body.assignedUser !== undefined) {
      const newAssignee = req.body.assignedUser || null;
      if (!isAdmin) {
        // Normal user can only claim an unassigned task to themselves
        if (task.assignedUser && task.assignedUser.toString() !== newAssignee?.toString()) {
          return res.status(403).json({
            message: "Only administrators can reassign tasks between users"
          });
        }
        if (newAssignee && newAssignee.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            message: "Normal users can only assign unassigned tasks to themselves"
          });
        }
      }
      task.assignedUser = newAssignee;
    }

    if (req.body.title !== undefined) task.title = req.body.title.trim();
    if (req.body.description !== undefined) task.description = req.body.description.trim();
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;

    task.activities.push({
      user: req.user._id,
      action: "updated",
      details: "updated task details"
    });

    await task.save();

    const updatedTask = await populateTask(Task.findById(task._id));
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Status Only (Drag and Drop / Quick status toggle)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'todo', 'doing', or 'done'"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAssigned = task.assignedUser?.toString() === req.user._id.toString();
    const isUnassigned = !task.assignedUser;
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isUnassigned && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to update this task's status"
      });
    }

    const oldStatus = task.status;
    task.status = status;

    task.activities.push({
      user: req.user._id,
      action: "status_changed",
      details: `moved from "${oldStatus}" to "${status}"`
    });

    await task.save();

    const updatedTask = await populateTask(Task.findById(task._id));
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Assign Task (Normal users can only claim unassigned tasks; Admins can reassign between any user)
exports.assignTask = async (req, res) => {
  try {
    const { assignedUser } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const isAdmin = req.user.role === "admin";
    const targetAssignee = assignedUser || null;

    if (!isAdmin) {
      // Normal user rules according to assignment spec:
      // 1. Task must be currently unassigned
      if (task.assignedUser) {
        return res.status(403).json({
          message: "Task is already assigned. Only administrators can reassign tasks across users."
        });
      }
      // 2. Normal user can only assign to themselves
      if (targetAssignee && targetAssignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Normal users can only assign eligible unassigned tasks to themselves."
        });
      }
    }

    task.assignedUser = targetAssignee;

    let assigneeName = "someone";
    if (targetAssignee) {
      const userDoc = await User.findById(targetAssignee);
      if (userDoc) assigneeName = userDoc.name;
    }

    task.activities.push({
      user: req.user._id,
      action: "assigned",
      details: targetAssignee ? `assigned task to ${assigneeName}` : "unassigned task"
    });

    await task.save();

    const updatedTask = await populateTask(Task.findById(task._id));
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Task (Only creator or admin)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: Only the creator or an admin can delete this task"
      });
    }

    await task.deleteOne();

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Add Comment to Task
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text cannot be empty"
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    });

    task.activities.push({
      user: req.user._id,
      action: "commented",
      details: "added a comment"
    });

    await task.save();

    const updatedTask = await populateTask(Task.findById(task._id));
    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Comment from Task
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const comment = task.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found"
      });
    }

    // Only comment author or admin can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCommentAuthor && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to delete this comment"
      });
    }

    comment.deleteOne();
    await task.save();

    const updatedTask = await populateTask(Task.findById(task._id));
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};