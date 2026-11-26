const conn = require("../Config/dbconfig");

// =====================================================
// CREATE SERVICE
// =====================================================
async function createService(serviceData) {
  try {

    const {
      service_name,
      service_description,
    } = serviceData;

    const query = `
      INSERT INTO common_services (
        service_name,
        service_description,
        active_service
      )
      VALUES (?, ?, ?)
    `;

    const result = await conn.query(query, [
      service_name,
      service_description,
      1,
    ]);

    return {
      service_id: result.insertId,
      service_name,
      service_description,
      active_service: 1,
    };

  } catch (error) {

    console.log("Create Service Error:", error);

    throw error;
  }
}


// =====================================================
// GET ALL ACTIVE SERVICES
// =====================================================
async function getAllServices() {
  try {

    const query = `
      SELECT
        service_id,
        service_name,
        service_description,
        active_service
      FROM common_services
      WHERE active_service = 1
      ORDER BY service_id DESC
    `;

    const rows = await conn.query(query);

    return rows;

  } catch (error) {

    console.log("Get Services Error:", error);

    throw error;
  }
}


// =====================================================
// GET RECYCLE BIN SERVICES
// =====================================================
async function getRecycleBinServices() {
  try {

    const query = `
      SELECT
        service_id,
        service_name,
        service_description,
        active_service
      FROM common_services
      WHERE active_service = 0
      ORDER BY service_id DESC
    `;

    const rows = await conn.query(query);

    return rows;

  } catch (error) {

    console.log(
      "Get Recycle Bin Services Error:",
      error
    );

    throw error;
  }
}


// =====================================================
// UPDATE SERVICE
// =====================================================
async function updateService(service_id, data) {
  try {

    const {
      service_name,
      service_description,
    } = data;

    const query = `
      UPDATE common_services
      SET
        service_name = ?,
        service_description = ?
      WHERE service_id = ?
        AND active_service = 1
    `;

    const result = await conn.query(query, [
      service_name,
      service_description,
      service_id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error(
        "Service not found or already in recycle bin"
      );
    }

    return result;

  } catch (error) {

    console.log("Update Service Error:", error);

    throw error;
  }
}


// =====================================================
// MOVE SERVICE TO RECYCLE BIN
// =====================================================
async function deleteService(service_id) {
  try {

    const query = `
      UPDATE common_services
      SET active_service = 0
      WHERE service_id = ?
        AND active_service = 1
    `;

    const result = await conn.query(query, [
      service_id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error(
        "Service not found or already in recycle bin"
      );
    }

    return result;

  } catch (error) {

    console.log(
      "Move Service To Recycle Bin Error:",
      error
    );

    throw error;
  }
}


// =====================================================
// RESTORE SERVICE
// =====================================================
async function restoreService(service_id) {
  try {

    const query = `
      UPDATE common_services
      SET active_service = 1
      WHERE service_id = ?
        AND active_service = 0
    `;

    const result = await conn.query(query, [
      service_id,
    ]);

    if (result.affectedRows === 0) {
      throw new Error(
        "Service not found or already active"
      );
    }

    return result;

  } catch (error) {

    console.log(
      "Restore Service Error:",
      error
    );

    throw error;
  }
}


// =====================================================
// PERMANENTLY DELETE SERVICE
// =====================================================
async function permanentlyDeleteService(service_id) {
  try {

    // -------------------------------------------------
    // CHECK SERVICE
    // -------------------------------------------------
    const service = await conn.query(
      `
      SELECT service_id, active_service
      FROM common_services
      WHERE service_id = ?
      `,
      [service_id]
    );

    if (!service || service.length === 0) {
      throw new Error("Service not found");
    }

    // -------------------------------------------------
    // ONLY DELETE FROM RECYCLE BIN
    // -------------------------------------------------
    if (Number(service[0].active_service) !== 0) {
      throw new Error(
        "Service must be moved to recycle bin first"
      );
    }

    // -------------------------------------------------
    // CHECK IF SERVICE IS USED BY ORDERS
    // -------------------------------------------------
    const usedByOrders = await conn.query(
      `
      SELECT COUNT(*) AS count
      FROM order_services
      WHERE service_id = ?
      `,
      [service_id]
    );

    if (
      usedByOrders &&
      Number(usedByOrders[0].count) > 0
    ) {
      throw new Error(
        "This service is used by existing orders and cannot be permanently deleted"
      );
    }

    // -------------------------------------------------
    // PERMANENT DELETE
    // -------------------------------------------------
    const result = await conn.query(
      `
      DELETE FROM common_services
      WHERE service_id = ?
        AND active_service = 0
      `,
      [service_id]
    );

    if (result.affectedRows === 0) {
      throw new Error(
        "Failed to permanently delete service"
      );
    }

    return result;

  } catch (error) {

    console.log(
      "Permanently Delete Service Error:",
      error
    );

    throw error;
  }
}


module.exports = {
  createService,
  getAllServices,
  getRecycleBinServices,
  updateService,
  deleteService,
  restoreService,
  permanentlyDeleteService,
};