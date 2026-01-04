import { useEffect, useState } from "react";
import api from "../api/api";

const ITEMS_PER_PAGE = 5;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  // ===== Create modal =====
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // ===== Edit =====
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // ===== AI =====
  const [aiLoading, setAiLoading] = useState(false);

  // ===== Search + Pagination =====
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ======================
  // Fetch tasks
  // ======================
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);


  const getCompletedById = (id) => {
  const realTask = tasks.find((t) => t._id === id);
  return realTask ? realTask.completed : false;
};

  // ======================
  // Create task
  // ======================
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", {
        title,
        description,
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setIsCreateOpen(false);
      fetchTasks();
    } catch {
      alert("Failed to create task");
    }
  };

  // ======================
  // Delete
  // ======================
  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  // ======================
  // Completed
  // ======================
  const toggleCompleted = async (task) => {
  const newCompleted = !task.completed;

  // UI instant
  setTasks((prev) =>
    prev.map((t) =>
      t._id === task._id ? { ...t, completed: newCompleted } : t
    )
  );

  try {
    console.log("PATCH URL:", `/tasks/${task._id}/completed`);

    await api.patch(`/tasks/${task._id}/completed`, {
      completed: newCompleted,
    });
  } catch (err) {
    console.error("Failed to update completed status", err);

    // rollback
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id ? { ...t, completed: task.completed } : t
      )
    );
  }
};

  // ======================
  // Edit
  // ======================
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const saveEdit = async (id) => {
    await api.put(`/tasks/${id}`, {
      title: editTitle,
      description: editDescription,
    });
    setEditingId(null);
    fetchTasks();
  };

  // ======================
  // AI Improve  
  // ======================
  const improveWithAI = async (task) => {
  console.log("CLICKED IMPROVE", task._id);

  if (aiLoading) return;
  setAiLoading(true);

  try {
    const res = await api.post("/tasks/improve", {
      taskId: task._id,
    });

    console.log("AI RAW RESPONSE:", res.data);

    const aiText = res.data.aiSuggestion || "NO AI TEXT RETURNED";

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t._id === task._id
          ? { ...t, aiSuggestion: aiText }
          : t
      );

      console.log("UPDATED TASKS:", updated);
      return updated;
    });
  } catch (err) {
    console.error("AI failed:", err);
  } finally {
    setAiLoading(false);
  }
};


  const acceptAI = async (id) => {
    await api.post(`/tasks/${id}/accept-ai`);
    fetchTasks();
  };

  const undoAI = async (id) => {
    await api.post(`/tasks/${id}/undo-ai`);
    fetchTasks();
  };

  // ======================
  // Search + Pagination
  // ======================
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Task
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-3 border rounded mb-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Tasks */}
        <div className="space-y-4">
          {paginatedTasks.map((task) => {
            const editing = editingId === task._id;

            return (
              <div
                key={task._id}
                className={`bg-white rounded shadow p-4 ${
                  task.completed ? "opacity-60 line-through" : ""
                }`}
              >
                <div className="flex justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                   <button
  type="button"
  onClick={() => toggleCompleted(task)}
  className={`px-3 py-1 rounded text-sm font-medium transition ${
  getCompletedById(task._id)
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"
}`}

>
{getCompletedById(task._id) ? "Done" : "Not done"}
</button>



                    {!editing ? (
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium">
                            {task.title}
                          </h3>

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        )}

                        {task.aiSuggestion && (
                          <div className="mt-3 p-3 bg-purple-50 border rounded">
                            <p className="text-sm font-medium text-purple-700">
                              AI suggestion:
                            </p>
                            <p className="text-sm">
                              {task.aiSuggestion}
                            </p>

                            <div className="flex gap-4 mt-2 text-sm">
                              <button
                                onClick={() => acceptAI(task._id)}
                                className="text-green-600"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => undoAI(task._id)}
                                className="text-gray-500"
                              >
                                Undo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <input
                          className="w-full p-2 border rounded"
                          value={editTitle}
                          onChange={(e) =>
                            setEditTitle(e.target.value)
                          }
                        />
                        <input
                          className="w-full p-2 border rounded"
                          value={editDescription}
                          onChange={(e) =>
                            setEditDescription(e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 text-sm">
                    {!editing ? (
                      <>
                        <button
                          onClick={() => startEdit(task)}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
  type="button"                
  onClick={() => {
    console.log("IMPROVE CLICKED", task._id);
    improveWithAI(task);
  }}
  disabled={aiLoading}
  className="text-purple-600"
>
  ✨ Improve
</button>

                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => saveEdit(task._id)}
                          className="text-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Create New Task
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                className="w-full p-2 border rounded"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="w-full p-2 border rounded"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
