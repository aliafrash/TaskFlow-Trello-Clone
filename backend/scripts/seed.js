/**
 * TaskFlow Database Seeding Script
 * Creates the required Administrator account, sample Normal Users,
 * and realistic sample Kanban tasks across To Do, Doing, and Done.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Task = require("../models/Task");

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/taskflow";

  console.log("--------------------------------------------------");
  console.log("🌱 Starting TaskFlow Database Seeder");
  console.log("📡 Connecting to MongoDB:", mongoUri);
  console.log("--------------------------------------------------");

  try {
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB successfully.");

    // Clean existing data
    console.log("🧹 Clearing existing Users and Tasks...");
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log("✓ Cleared collections.");

    // 1. Create Users
    console.log("👤 Creating Users (Administrator + Normal Users)...");
    const adminPassword = await bcrypt.hash("Admin@123456", 10);
    const userPassword = await bcrypt.hash("User@123456", 10);

    const admin = await User.create({
      name: "System Administrator",
      email: "admin@taskflow.com",
      password: adminPassword,
      role: "admin",
    });

    const john = await User.create({
      name: "John Doe",
      email: "john@taskflow.com",
      password: userPassword,
      role: "user",
    });

    const jane = await User.create({
      name: "Jane Smith",
      email: "jane@taskflow.com",
      password: userPassword,
      role: "user",
    });

    console.log("✓ Created 3 users (1 Administrator, 2 Normal Users).");

    // 2. Create Tasks across To Do, Doing, Done
    console.log("📋 Creating initial Kanban tasks...");

    const tasks = [
      // To Do (Unassigned - ready for normal users to claim)
      {
        title: "Sprint Planning & User Story Estimation",
        description: "Review product backlog, estimate effort points, and prioritize user stories for the upcoming 2-week sprint cycle.",
        status: "todo",
        priority: "high",
        creator: admin._id,
        assignedUser: null,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
        comments: [
          {
            user: admin._id,
            text: "Please make sure everyone reviews the ticket acceptance criteria prior to tomorrow's meeting.",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        ],
        activities: [
          {
            user: admin._id,
            action: "created",
            details: 'created task in "todo"',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Research Webhook & Third-Party Integration Patterns",
        description: "Evaluate outgoing webhook architectures for real-time notification delivery to Slack and Microsoft Teams.",
        status: "todo",
        priority: "medium",
        creator: jane._id,
        assignedUser: null,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        activities: [
          {
            user: jane._id,
            action: "created",
            details: 'created task in "todo"',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
        ],
      },

      // Doing (In Progress)
      {
        title: "Implement Drag-and-Drop Kanban Board",
        description: "Build 3 status columns (To Do, Doing, Done) with smooth HTML5 drag-and-drop movement and instant MongoDB state persistence.",
        status: "doing",
        priority: "high",
        creator: admin._id,
        assignedUser: john._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        comments: [
          {
            user: john._id,
            text: "Drag and drop interactions are working smoothly. Connecting the PATCH /api/tasks/:id/status endpoint now.",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
        ],
        activities: [
          {
            user: admin._id,
            action: "created",
            details: 'created task in "todo"',
            createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
          },
          {
            user: admin._id,
            action: "assigned",
            details: "assigned task to John Doe",
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          },
          {
            user: john._id,
            action: "status_changed",
            details: 'moved from "todo" to "doing"',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Build Responsive Dashboard Navigation & UI Theme",
        description: "Implement top navigation header with user profile chips, responsive mobile menu, and role-based Admin navigation link.",
        status: "doing",
        priority: "medium",
        creator: admin._id,
        assignedUser: jane._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        activities: [
          {
            user: admin._id,
            action: "created",
            details: 'created task in "todo"',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
          {
            user: admin._id,
            action: "assigned",
            details: "assigned task to Jane Smith",
            createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
          },
          {
            user: jane._id,
            action: "status_changed",
            details: 'moved from "todo" to "doing"',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          },
        ],
      },

      // Done
      {
        title: "Configure JWT Role-Based Authentication System",
        description: "Implement bcrypt password hashing, JWT token generation, auth middleware, and adminOnly route protection.",
        status: "done",
        priority: "high",
        creator: admin._id,
        assignedUser: admin._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        activities: [
          {
            user: admin._id,
            action: "created",
            details: 'created task in "todo"',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            user: admin._id,
            action: "status_changed",
            details: 'moved from "doing" to "done"',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ],
      },
      {
        title: "Initialize Next.js App Router Client Project",
        description: "Setup Next.js with Tailwind CSS, Axios client interceptors, global context state, and Lucide icon components.",
        status: "done",
        priority: "medium",
        creator: admin._id,
        assignedUser: john._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        activities: [
          {
            user: admin._id,
            action: "created",
            details: 'created task in "todo"',
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
          },
          {
            user: john._id,
            action: "status_changed",
            details: 'moved from "doing" to "done"',
            createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
          },
        ],
      },
    ];

    await Task.insertMany(tasks);
    console.log("✓ Created 6 initial tasks across To Do, Doing, and Done.");

    console.log("--------------------------------------------------");
    console.log("🎉 Database seeding completed successfully!");
    console.log("--------------------------------------------------");
    console.log("🔑 PRE-SEEDED LOGIN CREDENTIALS:");
    console.log("");
    console.log("1. ADMINISTRATOR ACCOUNT:");
    console.log("   Email:    admin@taskflow.com");
    console.log("   Password: Admin@123456");
    console.log("   Role:     admin");
    console.log("");
    console.log("2. NORMAL USER ACCOUNT 1:");
    console.log("   Email:    john@taskflow.com");
    console.log("   Password: User@123456");
    console.log("   Role:     user");
    console.log("");
    console.log("3. NORMAL USER ACCOUNT 2:");
    console.log("   Email:    jane@taskflow.com");
    console.log("   Password: User@123456");
    console.log("   Role:     user");
    console.log("--------------------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
    process.exit(1);
  }
}

seedDatabase();
