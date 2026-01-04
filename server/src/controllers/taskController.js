const Task = require("../models/Task");
const { improveTask } = require("../services/geminiService");

// ======================
// Create Task
// ======================
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      completed: false,
      user: req.userId,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create task failed:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// ======================
// Get all tasks
// ======================
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// ======================
// Update task (title / description)
// ======================
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        title: req.body.title,
        description: req.body.description,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

// ======================
// Delete task
// ======================
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// ======================
// AI Improve (description + priority recommendation)
// ======================
exports.improveTaskWithAI = async (req, res) => {
  try {
    const { taskId } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const improvedText = await improveTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
    });

    if (!improvedText || typeof improvedText !== "string") {
      return res.status(500).json({
        message: "AI returned empty response",
      });
    }

    task.aiSuggestion = improvedText;
    task.originalDescription = task.description;
    await task.save();

    res.json({
      aiSuggestion: improvedText,
    });
  } catch (err) {
    if (err.statusCode === 429) {
      return res.status(429).json({
        message: "AI quota exceeded. Try again later.",
      });
    }

    console.error("AI ERROR:", err);
    res.status(500).json({ message: "AI improvement failed" });
  }
};


// ======================
// Accept AI (description + priority)
// ======================
exports.acceptAI = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task || !task.aiSuggestion) {
      return res.status(404).json({ message: "AI suggestion not found" });
    }

    // החלת תיאור
    task.description = task.aiSuggestion;

    // החלת priority אם AI המליץ
    if (
      task.aiPrioritySuggestion &&
      task.aiPrioritySuggestion !== "keep"
    ) {
      task.priority = task.aiPrioritySuggestion;
    }

    // ניקוי שדות AI
    task.aiSuggestion = null;
    task.aiPrioritySuggestion = null;
    task.originalDescription = null;
    task.originalPriority = null;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Accept AI failed" });
  }
};

// ======================
// Undo AI
// ======================
exports.undoAI = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task || !task.aiSuggestion) {
      return res.status(404).json({ message: "AI suggestion not found" });
    }

    task.description = task.originalDescription;
    task.priority = task.originalPriority;

    task.aiSuggestion = null;
    task.aiPrioritySuggestion = null;
    task.originalDescription = null;
    task.originalPriority = null;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Undo AI failed" });
  }
};

// ======================
// Update completed
// ======================
exports.updateCompleted = async (req, res) => {
  try {
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be boolean" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update completed status" });
  }
};
