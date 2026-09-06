"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckSquare, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/board");
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
        <Zap className="w-4 h-4" />
        <span>Collaborative Task Management</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
        Manage your team&apos;s workflow with{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          TaskFlow
        </span>
      </h1>

      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-10">
        A fast, intuitive Trello-style Kanban board built for agile teams. Organize tasks, track
        progress, and assign team members in real-time.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <a
          href="/register"
          className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 text-base"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5" />
        </a>
        <a
          href="/login"
          className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 shadow-xs transition-all text-base"
        >
          Sign In
        </a>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Kanban Columns</h3>
          <p className="text-sm text-gray-600">
            Organize tasks into To Do, Doing, and Done columns with real-time status movement.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Team Assignment</h3>
          <p className="text-sm text-gray-600">
            Assign tasks to teammates, set priority flags, and track due dates collaboratively.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Role Permissions</h3>
          <p className="text-sm text-gray-600">
            Granular permissions for task creators and dedicated admin controls for team management.
          </p>
        </div>
      </div>
    </div>
  );
}
