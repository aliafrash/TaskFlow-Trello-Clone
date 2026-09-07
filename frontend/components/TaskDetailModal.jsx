"use client";

import { useState } from "react";
import {
  X,
  MessageSquare,
  History,
  Send,
  Trash2,
  Calendar,
  User,
  Flag,
  Edit2,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  UserPlus,
} from "lucide-react";

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  users = [],
  currentUserId,
  isAdmin,
  onAddComment,
  onDeleteComment,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignToMe,
  onReassign,
}) {
  const [activeTab, setActiveTab] = useState("comments");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  if (!isOpen || !task) return null;

  const isCreator =
    task.creator?._id === currentUserId ||
    task.creator === currentUserId;
  const canDelete = isCreator || isAdmin;

  const priorityColors = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const statusLabels = {
    todo: "To Do",
    doing: "In Progress",
    done: "Done",
  };

  const statusIcons = {
    todo: ListTodo,
    doing: Clock,
    done: CheckCircle2,
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      setCommentError("");
      await onAddComment(task._id, commentText.trim());
      setCommentText("");
    } catch (err) {
      setCommentError(
        err.response?.data?.message || err.message || "Failed to post comment."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const comments = task.comments || [];
  const activities = (task.activities || []).slice().reverse(); // newest first
  const StatusIcon = statusIcons[task.status] || ListTodo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-150 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${
                priorityColors[task.priority] || priorityColors.medium
              }`}
            >
              <Flag className="w-3.5 h-3.5 mr-0.5" />
              {task.priority || "medium"}
            </span>

            <div className="flex items-center space-x-1 text-xs bg-gray-200/70 text-gray-700 px-2.5 py-1 rounded-full font-medium">
              <StatusIcon className="w-3.5 h-3.5 mr-0.5 text-gray-500" />
              <span>{statusLabels[task.status] || task.status}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(task._id);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
              {task.title}
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              {task.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                Assignee
              </span>
              {isAdmin ? (
                <select
                  value={
                    typeof task.assignedUser === "object"
                      ? task.assignedUser?._id || ""
                      : task.assignedUser || ""
                  }
                  onChange={(e) =>
                    onReassign && onReassign(task._id, e.target.value || null)
                  }
                  className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : task.assignedUser ? (
                <div className="flex items-center space-x-1.5 text-xs text-gray-800 font-medium">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span className="truncate">
                    {task.assignedUser?.name || "Assigned User"}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onAssignToMe && onAssignToMe(task._id)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 bg-blue-100/70 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors w-fit"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign to Me</span>
                </button>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                Due Date
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-gray-800 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">
                Creator
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-gray-800 font-medium">
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span className="truncate">{task.creator?.name || "Team Member"}</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 flex space-x-6 pt-2">
            <button
              onClick={() => setActiveTab("comments")}
              className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === "comments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                {comments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === "activity"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Activity History</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                {activities.length}
              </span>
            </button>
          </div>

          {/* Comments Tab Content */}
          {activeTab === "comments" && (
            <div className="space-y-4">
              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                {commentError && (
                  <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
                    {commentError}
                  </div>
                )}
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Write a comment or update for the team..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-3 pr-12 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="absolute right-2.5 bottom-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all shadow-xs"
                    title="Send comment"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {comments.map((comment) => {
                  const isAuthor =
                    comment.user?._id === currentUserId ||
                    comment.user === currentUserId;
                  const canDeleteComment = isAuthor || isAdmin;

                  return (
                    <div
                      key={comment._id}
                      className="flex space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {comment.user?.name
                          ? comment.user.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {comment.user?.name || "User"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          {canDeleteComment && (
                            <button
                              onClick={() =>
                                onDeleteComment(task._id, comment._id)
                              }
                              className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 whitespace-pre-line break-words leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {comments.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No comments yet. Start the conversation above!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab Content */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              {activities.map((act, index) => (
                <div
                  key={act._id || index}
                  className="flex items-start space-x-3 text-xs text-gray-600 py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="leading-snug">
                      <span className="font-semibold text-gray-900">
                        {act.user?.name || "Team Member"}
                      </span>{" "}
                      {act.details}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(act.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">
                  No activity history recorded yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
