/**
 * Backend API Logic & Controller Unit Tests
 * Runs tests against controllers and middleware using mock req/res.
 */

const assert = require("assert");
const jwt = require("jsonwebtoken");

// Set test env
process.env.JWT_SECRET = "test_jwt_secret_key_12345";

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const userController = require("../controllers/userController");
const taskController = require("../controllers/taskController");
const authController = require("../controllers/authController");

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    }
  };
}

async function runTests() {
  console.log("=== Running Backend Verification Tests ===");
  let passed = 0;
  let failed = 0;

  // Test 1: Admin middleware blocks non-admin
  try {
    const req = { user: { role: "user", name: "Test User" } };
    const res = createMockRes();
    let nextCalled = false;
    adminOnly(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403, "Should return 403 for non-admin");
    assert.strictEqual(nextCalled, false, "next() should not be called");
    console.log("✓ Test 1 Passed: adminOnly middleware blocks non-admin users");
    passed++;
  } catch (err) {
    console.error("✗ Test 1 Failed:", err.message);
    failed++;
  }

  // Test 2: Admin middleware allows admin
  try {
    const req = { user: { role: "admin", name: "Admin User" } };
    const res = createMockRes();
    let nextCalled = false;
    adminOnly(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true, "next() should be called for admin");
    console.log("✓ Test 2 Passed: adminOnly middleware permits admin users");
    passed++;
  } catch (err) {
    console.error("✗ Test 2 Failed:", err.message);
    failed++;
  }

  // Test 3: Auth middleware rejects missing token
  try {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401, "Should return 401 for missing token");
    assert.strictEqual(res.data.message, "No token provided");
    console.log("✓ Test 3 Passed: protect middleware rejects request without token");
    passed++;
  } catch (err) {
    console.error("✗ Test 3 Failed:", err.message);
    failed++;
  }

  // Test 4: Auth middleware rejects invalid token
  try {
    const req = { headers: { authorization: "Bearer invalid_token_123" } };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401, "Should return 401 for invalid token");
    assert.strictEqual(res.data.message, "Invalid token");
    console.log("✓ Test 4 Passed: protect middleware rejects invalid JWT");
    passed++;
  } catch (err) {
    console.error("✗ Test 4 Failed:", err.message);
    failed++;
  }

  // Test 5: getMe returns req.user
  try {
    const req = { user: { _id: "user123", name: "Alice", email: "alice@example.com", role: "user" } };
    const res = createMockRes();
    await authController.getMe(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.name, "Alice");
    assert.strictEqual(res.data.email, "alice@example.com");
    console.log("✓ Test 5 Passed: authController.getMe returns current user info");
    passed++;
  } catch (err) {
    console.error("✗ Test 5 Failed:", err.message);
    failed++;
  }

  // Test 6: Task validation rejects missing title/description
  try {
    const req = { body: {}, user: { _id: "user123" } };
    const res = createMockRes();
    await taskController.createTask(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.message, "Title and description are required");
    console.log("✓ Test 6 Passed: createTask validates required title and description");
    passed++;
  } catch (err) {
    console.error("✗ Test 6 Failed:", err.message);
    failed++;
  }

  // Test 7: updateStatus rejects invalid status values
  try {
    const req = { body: { status: "invalid_status" }, params: { id: "task123" }, user: { _id: "user123" } };
    const res = createMockRes();
    await taskController.updateStatus(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.data.message.includes("Invalid status"));
    console.log("✓ Test 7 Passed: updateStatus validates status enum ('todo', 'doing', 'done')");
    passed++;
  } catch (err) {
    console.error("✗ Test 7 Failed:", err.message);
    failed++;
  }

  // Test 8: updateUserRole rejects invalid role values
  try {
    const req = { body: { role: "superadmin" }, params: { id: "user123" }, user: { _id: "admin123" } };
    const res = createMockRes();
    await userController.updateUserRole(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.data.message.includes("Invalid role"));
    console.log("✓ Test 8 Passed: updateUserRole validates role enum ('user', 'admin')");
    passed++;
  } catch (err) {
    console.error("✗ Test 8 Failed:", err.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
