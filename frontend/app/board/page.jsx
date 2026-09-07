"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  ListTodo,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function BoardPage() {
  const { user, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  // Drag and drop state
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/users").catch(() => ({ data: [] })),
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);

      // Keep detail task in sync if open
      if (detailTask) {
        const updated = tasksRes.data.find((t) => t._id === detailTask._id);
        if (updated) setDetailTask(updated);
      }
    } catch (err) {
      console.error("Failed to load board data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleCreateTask = async (taskData) => {
    const res = await api.post("/tasks", taskData);
    setTasks([res.data, ...tasks]);
  };

  const handleUpdateTask = async (taskData) => {
    const res = await api.put(`/tasks/${editingTask._id}`, taskData);
    setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
    if (detailTask?._id === editingTask._id) {
      setDetailTask(res.data);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter((t) => t._id !== taskId));
        if (detailTask?._id === taskId) {
          setDetailTask(null);
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
      if (detailTask?._id === taskId) {
        setDetailTask(res.data);
      }
    } catch (err) {
      console.error("Status update failed:", err);
      fetchData(); // Revert on failure
    }
  };

  const handleAssignToMe = async (taskId) => {
    try {
      const myId = user?.id || user?._id;
      const res = await api.patch(`/tasks/${taskId}/assign`, { assignedUser: myId });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
      if (detailTask?._id === taskId) {
        setDetailTask(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim task");
    }
  };

  const handleReassign = async (taskId, targetUserId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/assign`, { assignedUser: targetUserId });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );
      if (detailTask?._id === taskId) {
        setDetailTask(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reassign task");
    }
  };

  const handleAddComment = async (taskId, text) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data : t))
    );
    setDetailTask(res.data);
  };

  const handleDeleteComment = async (taskId, commentId) => {
    const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.data : t))
    );
    setDetailTask(res.data);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    setDragOverColumn(null);
    setDraggingTaskId(null);

    if (taskId) {
      const targetTask = tasks.find((t) => t._id === taskId);
      if (targetTask && targetTask.status !== targetStatus) {
        handleStatusChange(taskId, targetStatus);
      }
    }
  };

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "all" ||
      (assigneeFilter === "unassigned" && !task.assignedUser) ||
      (task.assignedUser && (task.assignedUser._id === assigneeFilter || task.assignedUser === assigneeFilter));

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const columns = [
    {
      id: "todo",
      title: "To Do",
      icon: ListTodo,
      badgeColor: "bg-slate-100 text-slate-700",
      accentBorder: "border-t-blue-500",
    },
    {
      id: "doing",
      title: "Doing",
      icon: Clock,
      badgeColor: "bg-amber-50 text-amber-700",
      accentBorder: "border-t-amber-500",
    },
    {
      id: "done",
      title: "Done",
      icon: CheckCircle2,
      badgeColor: "bg-emerald-50 text-emerald-700",
      accentBorder: "border-t-emerald-500",
    },
  ];

  if (authLoading || (loading && tasks.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading your board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Board Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Team Kanban Board
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track tasks, assign team members, and manage sprint progress
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            title="Refresh Board"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs mb-8 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Priority filter */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:inline" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start flex-1">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[550px] transition-colors border-t-4 ${
                col.accentBorder
              } ${isDragOver ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-400" : ""}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2">
                  <col.icon className="w-4 h-4 text-gray-600" />
                  <h3 className="font-bold text-gray-800 text-sm tracking-tight">
                    {col.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${col.badgeColor}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {col.id === "todo" && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsModalOpen(true);
                    }}
                    title="Add task to To Do"
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      currentUserId={user?.id || user?._id}
                      isAdmin={isAdmin}
                      onViewDetails={(t) => setDetailTask(t)}
                      onAssignToMe={handleAssignToMe}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 text-center px-4">
                    Drop tasks here or click &quot;+&quot; to add
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        users={users}
        currentUser={user}
        isAdmin={isAdmin}
      />

      {/* Task Detail & Comments Modal */}
      <TaskDetailModal
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        users={users}
        currentUserId={user?.id || user?._id}
        isAdmin={isAdmin}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onAssignToMe={handleAssignToMe}
        onReassign={handleReassign}
        onEdit={(t) => {
          setEditingTask(t);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
