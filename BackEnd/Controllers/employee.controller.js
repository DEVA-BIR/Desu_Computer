const employeeService = require("../Services/employee.service");

// =========================================================
// CREATE EMPLOYEE
// =========================================================
async function createEmployee(req, res) {
  try {
    const employeeExists =
      await employeeService.checkIfEmployeeExists(
        req.body.employee_email
      );

    if (employeeExists) {
      return res.status(400).json({
        success: false,
        error:
          "This email address is already associated with another employee!",
      });
    }

    const employee =
      await employeeService.createEmployee(req.body);

    if (!employee) {
      return res.status(400).json({
        success: false,
        error: "Failed to add the employee!",
      });
    }

    return res.status(201).json({
      success: true,
      status: "success",
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error(
      "CREATE EMPLOYEE CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Something went wrong!",
    });
  }
}

// =========================================================
// GET ALL ACTIVE EMPLOYEES
// =========================================================
async function getAllEmployees(req, res) {
  try {
    const employees =
      await employeeService.getAllEmployees();

    return res.status(200).json({
      success: true,
      status: "success",
      data: employees || [],
    });
  } catch (error) {
    console.error(
      "GET ALL EMPLOYEES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to get employees",
    });
  }
}

// =========================================================
// UPDATE EMPLOYEE
// =========================================================
async function updateEmployee(req, res) {
  try {
    const employeeId = req.params.id;

    await employeeService.updateEmployee(
      employeeId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error(
      "UPDATE EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Update failed",
    });
  }
}

// =========================================================
// SOFT DELETE EMPLOYEE
// =========================================================
async function deleteEmployee(req, res) {
  try {
    const employeeId = req.params.id;

    await employeeService.deleteEmployee(
      employeeId
    );

    return res.status(200).json({
      success: true,
      message:
        "Employee moved to Recycle Bin successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Delete failed",
    });
  }
}

// =========================================================
// GET DELETED EMPLOYEES
// =========================================================
async function getDeletedEmployees(req, res) {
  try {
    const employees =
      await employeeService.getDeletedEmployees();

    return res.status(200).json({
      success: true,
      data: employees || [],
    });
  } catch (error) {
    console.error(
      "GET DELETED EMPLOYEES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to get deleted employees",
    });
  }
}

// =========================================================
// RESTORE EMPLOYEE
// =========================================================
async function restoreEmployee(req, res) {
  try {
    const employeeId = req.params.id;

    await employeeService.restoreEmployee(
      employeeId
    );

    return res.status(200).json({
      success: true,
      message:
        "Employee restored successfully",
    });
  } catch (error) {
    console.error(
      "RESTORE EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to restore employee",
    });
  }
}

// =========================================================
// PERMANENT DELETE EMPLOYEE
// =========================================================
async function permanentDeleteEmployee(req, res) {
  try {
    const employeeId = req.params.id;

    await employeeService.permanentDeleteEmployee(
      employeeId
    );

    return res.status(200).json({
      success: true,
      message:
        "Employee permanently deleted successfully",
    });
  } catch (error) {
    console.error(
      "PERMANENT DELETE EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to permanently delete employee",
    });
  }
}

// =========================================================
// EXPORT
// =========================================================
module.exports = {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getDeletedEmployees,
  restoreEmployee,
  permanentDeleteEmployee,
};