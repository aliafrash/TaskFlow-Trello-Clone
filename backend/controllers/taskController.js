const Task = require("../models/Task");

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

    const task = await Task.create({
      title,
      description,
      creator: req.user._id,
      assignedUser: assignedUser || null,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null
    });

    const populatedTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedUser", "name email");

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

    if (req.user.role !== "admin") {
      query.$or = [
        { creator: req.user._id },
        { assignedUser: req.user._id }
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

    const tasks = await Task.find(query)
      .populate("creator", "name email")
      .populate("assignedUser", "name email")
      .sort({ createdAt: -1 });

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
    const task = await Task.findById(req.params.id)
      .populate("creator", "name email")
      .populate("assignedUser", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Permission check: admin, creator, or assigned user
    const creatorId = task.creator?._id ? task.creator._id.toString() : task.creator?.toString();
    const assignedId = task.assignedUser?._id ? task.assignedUser._id.toString() : task.assignedUser?.toString();

    const isCreator = creatorId === req.user._id.toString();
    const isAssigned = assignedId === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isAdmin) {
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

    // Check permission (creator, assigned user, or admin)
    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAssigned = task.assignedUser?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to update this task"
      });
    }

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    if (req.body.assignedUser !== undefined) task.assignedUser = req.body.assignedUser || null;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedUser", "name email");

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

    // Check permission
    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAssigned = task.assignedUser?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: You are not authorized to update this task's status"
      });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedUser", "name email");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Assign Task to User
exports.assignTask = async (req, res) => {
  try {
    const { assignedUser } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Only creator or admin can reassign tasks
    const isCreator = task.creator?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Access denied: Only the task creator or an admin can assign tasks"
      });
    }

    task.assignedUser = assignedUser || null;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedUser", "name email");

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