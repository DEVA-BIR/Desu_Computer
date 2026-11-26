require("dotenv").config();

const jwt = require("jsonwebtoken");
const employeeService = require("../Services/employee.service");

// VERIFY TOKEN
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).json({
        status: "fail",
        error: "No token provided",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT VERIFY ERROR:", err);

        return res.status(401).json({
          status: "fail",
          error: "Unauthorized!",
        });
      }

      req.employee_email = decoded.employee_email;

      next();
    });
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);

    return res.status(500).json({
      status: "error",
      error: "Authentication server error",
    });
  }
};

// CHECK ADMIN
const isAdmin = async (req, res, next) => {
  try {
    const employee_email = req.employee_email;

    if (!employee_email) {
      return res.status(401).json({
        status: "fail",
        error: "Employee email not found in token",
      });
    }

    console.log("Checking admin:", employee_email);

    const employee =
      await employeeService.getEmployeeByEmail(employee_email);

    // Employee doesn't exist
    if (!employee || employee.length === 0) {
      return res.status(404).json({
        status: "fail",
        error: "Employee not found",
      });
    }

    console.log("Employee role:", employee[0].company_role_id);

    // Admin role = 3
    if (employee[0].company_role_id === 3) {
      return next();
    }

    return res.status(403).json({
      status: "fail",
      error: "Not an Admin!",
    });

  } catch (error) {
    console.error("IS ADMIN ERROR:", error);

    return res.status(500).json({
      status: "error",
      error: "Failed to verify administrator",
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};