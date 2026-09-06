"use client";

import Link from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { CheckSquare, LayoutDashboard, Shield, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <a href="/board" className="flex items-center space-x-2 text-brand-600 hover:text-brand-700">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">TaskFlow</span>
            </a>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-2">
              <a
                href="/board"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/board"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Kanban Board</span>
              </a>

              {isAdmin && (
                <a
                  href="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/admin"
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </a>
              )}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name || "User"}</p>
                <span
                  className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    user?.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user?.role || "user"}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
