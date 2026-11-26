const express = require("express");

const router = express.Router();

const employeeController = require("../Controllers/employee.controller");

const authMiddleware = require("../middlewares/auth.middleware");

// =========================================================
// CREATE EMPLOYEE
// =========================================================
router.post(
  "/employees",
  employeeController.createEmployee
);

// =========================================================
// GET ALL ACTIVE EMPLOYEES
// =========================================================
router.get(
  "/employees",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
  ],
  employeeController.getAllEmployees
);

// =========================================================
// UPDATE EMPLOYEE
// =========================================================
router.put(
  "/employees/:id",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
  ],
  employeeController.updateEmployee
);

// =========================================================
// SOFT DELETE → RECYCLE BIN
// =========================================================
router.delete(
  "/employees/:id",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
  ],
  employeeController.deleteEmployee
);

// =========================================================
// GET RECYCLE BIN
// =========================================================
router.get(
  "/employees/recycle-bin",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
  ],
  employeeController.getDeletedEmployees
);

// =========================================================
// RESTORE
// =========================================================
router.patch(
  "/employees/:id/restore",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
  ],
  employeeController.restoreEmployee
);

// =========================================================
// PERMANENT DELETE
// =========================================================
router.delete(
  "/employees/:id/permanent",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
  ],
  employeeController.permanentDeleteEmployee
);

module.exports = router;