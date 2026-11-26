// =========================================================
// EMPLOYEE SERVICE
// =========================================================

const conn = require("../Config/dbconfig");
const bcrypt = require("bcrypt");

// =========================================================
// CHECK IF EMPLOYEE EXISTS
// =========================================================
async function checkIfEmployeeExists(email) {
  try {
    const query = `
      SELECT employee_id
      FROM employee
      WHERE employee_email = ?
      LIMIT 1
    `;

    const rows = await conn.query(query, [email]);

    return rows.length > 0;
  } catch (error) {
    console.error("CHECK EMPLOYEE EXISTS ERROR:", error);
    throw error;
  }
}

// =========================================================
// CREATE EMPLOYEE
// =========================================================
async function createEmployee(employee) {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      employee.employee_password,
      salt
    );

    const query = `
      INSERT INTO employee
      (
        employee_email,
        active_employee,
        deleted_at
      )
      VALUES (?, ?, NULL)
    `;

    const rows = await conn.query(query, [
      employee.employee_email,
      employee.active_employee ?? 1,
    ]);

    if (!rows || rows.affectedRows !== 1) {
      return false;
    }

    const employee_id = rows.insertId;

    // =====================================================
    // EMPLOYEE INFO
    // =====================================================
    await conn.query(
      `
      INSERT INTO employee_info
      (
        employee_id,
        employee_first_name,
        employee_last_name,
        employee_phone
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        employee_id,
        employee.employee_first_name,
        employee.employee_last_name,
        employee.employee_phone,
      ]
    );

    // =====================================================
    // PASSWORD
    // =====================================================
    await conn.query(
      `
      INSERT INTO employee_pass
      (
        employee_id,
        employee_password_hashed
      )
      VALUES (?, ?)
      `,
      [employee_id, hashedPassword]
    );

    // =====================================================
    // ROLE
    // =====================================================
    await conn.query(
      `
      INSERT INTO employee_role
      (
        employee_id,
        company_role_id
      )
      VALUES (?, ?)
      `,
      [employee_id, employee.company_role_id || 3]
    );

    return {
      employee_id,
    };
  } catch (error) {
    console.error("CREATE EMPLOYEE SERVICE ERROR:", error);
    throw error;
  }
}

// =========================================================
// GET EMPLOYEE BY EMAIL
// IMPORTANT:
// Deleted employees cannot login.
// =========================================================
async function getEmployeeByEmail(employee_email) {
  const query = `
    SELECT
      employee.*,
      employee_info.employee_first_name,
      employee_info.employee_last_name,
      employee_info.employee_phone,
      employee_pass.employee_password_hashed,
      employee_role.company_role_id
    FROM employee

    INNER JOIN employee_info
      ON employee.employee_id = employee_info.employee_id

    INNER JOIN employee_pass
      ON employee.employee_id = employee_pass.employee_id

    INNER JOIN employee_role
      ON employee.employee_id = employee_role.employee_id

    WHERE employee.employee_email = ?
      AND employee.deleted_at IS NULL
      AND employee.active_employee = 1

    LIMIT 1
  `;

  return await conn.query(query, [employee_email]);
}

// =========================================================
// GET ALL ACTIVE EMPLOYEES
// =========================================================
async function getAllEmployees() {
  const query = `
    SELECT
      employee.employee_id,
      employee.employee_email,
      employee.active_employee,
      employee.added_date,
      employee.deleted_at,

      employee_info.employee_first_name,
      employee_info.employee_last_name,
      employee_info.employee_phone,

      employee_role.company_role_id,

      company_roles.company_role_name

    FROM employee

    INNER JOIN employee_info
      ON employee.employee_id = employee_info.employee_id

    INNER JOIN employee_role
      ON employee.employee_id = employee_role.employee_id

    INNER JOIN company_roles
      ON employee_role.company_role_id = company_roles.company_role_id

    WHERE employee.deleted_at IS NULL
      AND employee.active_employee = 1

    ORDER BY employee.employee_id DESC
  `;

  return await conn.query(query);
}

// =========================================================
// UPDATE EMPLOYEE
// =========================================================
async function updateEmployee(employeeId, employee) {
  try {
    // =====================================================
    // Make sure employee exists and is NOT deleted
    // =====================================================
    const checkQuery = `
      SELECT employee_id
      FROM employee
      WHERE employee_id = ?
        AND deleted_at IS NULL
    `;

    const existing = await conn.query(checkQuery, [employeeId]);

    if (existing.length === 0) {
      throw new Error("Employee not found");
    }

    // =====================================================
    // UPDATE EMPLOYEE INFO
    // =====================================================
    await conn.query(
      `
      UPDATE employee_info
      SET
        employee_first_name = ?,
        employee_last_name = ?,
        employee_phone = ?
      WHERE employee_id = ?
      `,
      [
        employee.firstName,
        employee.lastName,
        employee.phone,
        employeeId,
      ]
    );

    // =====================================================
    // UPDATE ACTIVE STATUS
    // =====================================================
    await conn.query(
      `
      UPDATE employee
      SET active_employee = ?
      WHERE employee_id = ?
        AND deleted_at IS NULL
      `,
      [
        employee.active ? 1 : 0,
        employeeId,
      ]
    );

    // =====================================================
    // UPDATE ROLE
    // =====================================================
    let roleId = 1;

    if (employee.role === "Admin") {
      roleId = 3;
    } else if (employee.role === "Manager") {
      roleId = 2;
    }

    await conn.query(
      `
      UPDATE employee_role
      SET company_role_id = ?
      WHERE employee_id = ?
      `,
      [roleId, employeeId]
    );

    return true;
  } catch (error) {
    console.error("UPDATE EMPLOYEE SERVICE ERROR:", error);
    throw error;
  }
}

// =========================================================
// SOFT DELETE EMPLOYEE
// =========================================================
async function deleteEmployee(employeeId) {
  try {
    const query = `
      UPDATE employee
      SET
        deleted_at = CURRENT_TIMESTAMP,
        active_employee = 0
      WHERE employee_id = ?
        AND deleted_at IS NULL
    `;

    const result = await conn.query(query, [employeeId]);

    if (!result || result.affectedRows !== 1) {
      throw new Error(
        "Employee not found or already deleted"
      );
    }

    return true;
  } catch (error) {
    console.error(
      "SOFT DELETE EMPLOYEE ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET DELETED EMPLOYEES
// =========================================================
async function getDeletedEmployees() {
  try {
    const query = `
      SELECT
        employee.employee_id,
        employee.employee_email,
        employee.active_employee,
        employee.added_date,
        employee.deleted_at,

        employee_info.employee_first_name,
        employee_info.employee_last_name,
        employee_info.employee_phone,

        employee_role.company_role_id,
        company_roles.company_role_name

      FROM employee

      INNER JOIN employee_info
        ON employee.employee_id = employee_info.employee_id

      INNER JOIN employee_role
        ON employee.employee_id = employee_role.employee_id

      INNER JOIN company_roles
        ON employee_role.company_role_id =
           company_roles.company_role_id

      WHERE employee.deleted_at IS NOT NULL

      ORDER BY employee.deleted_at DESC
    `;

    return await conn.query(query);
  } catch (error) {
    console.error(
      "GET DELETED EMPLOYEES SERVICE ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// RESTORE EMPLOYEE
// =========================================================
async function restoreEmployee(employeeId) {
  try {
    const query = `
      UPDATE employee
      SET
        deleted_at = NULL,
        active_employee = 1
      WHERE employee_id = ?
        AND deleted_at IS NOT NULL
    `;

    const result = await conn.query(query, [employeeId]);

    if (!result || result.affectedRows !== 1) {
      throw new Error(
        "Deleted employee not found"
      );
    }

    return true;
  } catch (error) {
    console.error(
      "RESTORE EMPLOYEE ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// PERMANENT DELETE EMPLOYEE
// =========================================================
async function permanentDeleteEmployee(employeeId) {
  try {
    // =====================================================
    // CHECK THAT EMPLOYEE IS IN RECYCLE BIN
    // =====================================================
    const checkQuery = `
      SELECT employee_id
      FROM employee
      WHERE employee_id = ?
        AND deleted_at IS NOT NULL
    `;

    const employee = await conn.query(
      checkQuery,
      [employeeId]
    );

    if (!employee || employee.length === 0) {
      throw new Error(
        "Employee not found in Recycle Bin"
      );
    }

    // =====================================================
    // DELETE CHILD RECORDS
    // =====================================================

    await conn.query(
      `
      DELETE FROM employee_pass
      WHERE employee_id = ?
      `,
      [employeeId]
    );

    await conn.query(
      `
      DELETE FROM employee_role
      WHERE employee_id = ?
      `,
      [employeeId]
    );

    await conn.query(
      `
      DELETE FROM employee_info
      WHERE employee_id = ?
      `,
      [employeeId]
    );

    // =====================================================
    // DELETE MAIN EMPLOYEE
    // =====================================================
    const result = await conn.query(
      `
      DELETE FROM employee
      WHERE employee_id = ?
        AND deleted_at IS NOT NULL
      `,
      [employeeId]
    );

    if (!result || result.affectedRows !== 1) {
      throw new Error(
        "Failed to permanently delete employee"
      );
    }

    return true;
  } catch (error) {
    console.error(
      "PERMANENT DELETE EMPLOYEE ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// EXPORT
// =========================================================
module.exports = {
  checkIfEmployeeExists,
  createEmployee,
  getEmployeeByEmail,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getDeletedEmployees,
  restoreEmployee,
  permanentDeleteEmployee,
};