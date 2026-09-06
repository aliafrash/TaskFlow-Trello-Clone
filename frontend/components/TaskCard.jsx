"use client";

import { Calendar, User, Edit2, Trash2, ChevronRight, ChevronLeft, Flag } from "lucide-react";

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
  isAdmin,
}) {
  const isCreator = task.creator?._id === currentUserId || task.creator === currentUserId;
  const canDelete = isCreator || isAdmin;

  const priorityColors = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${
              priorityColors[task.priority] || priorityColors.medium
            }`}
          >
            <Flag className="w-3 h-3 mr-0.5" />
            {task.priority || "medium"}
          </span>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(task._id)}
                title="Delete Task"
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-snug break-words">
          {task.title}
        </h4>

        {/* Description */}
        <p className="text-gray-600 text-xs line-clamp-3 mb-3 break-words whitespace-pre-line">
          {task.description}
        </p>
      </div>

      <div>
        {/* Meta details: Due Date, Assignee */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          {formattedDate ? (
            <div className="flex items-center space-x-1 text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
          ) : (
            <div />
          )}

          {task.assignedUser ? (
            <div
              className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-full text-[11px] text-gray-700 font-medium"
              title={`Assigned to ${task.assignedUser.name}`}
            >
              <User className="w-3 h-3 text-gray-500" />
              <span className="max-w-[90px] truncate">{task.assignedUser.name}</span>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400 italic">Unassigned</span>
          )}
        </div>

        {/* Quick status movement buttons */}
        <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center text-[11px] text-gray-400">
          {task.status !== "todo" ? (
            <button
              onClick={() =>
                onStatusChange(
                  task._id,
                  task.status === "done" ? "doing" : "todo"
                )
              }
              className="flex items-center hover:text-blue-600 hover:bg-gray-100 px-1.5 py-0.5 rounded transition-colors"
              title="Move backward"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              <span>{task.status === "done" ? "Doing" : "To Do"}</span>
            </button>
          ) : <div />}

          {task.status !== "done" ? (
            <button
              onClick={() =>
                onStatusChange(
                  task._id,
                  task.status === "todo" ? "doing" : "done"
                )
              }
              className="flex items-center hover:text-blue-600 hover:bg-gray-100 px-1.5 py-0.5 rounded transition-colors ml-auto"
              title="Move forward"
            >
              <span>{task.status === "todo" ? "Doing" : "Done"}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
