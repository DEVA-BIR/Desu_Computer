
const conn = require("../Config/dbconfig");

// =========================================================
// CREATE DEVICE
// =========================================================
async function createdevice(deviceData) {
  try {
    const {
      customer_id,
      device_year,
      device_make,
      device_model,
      device_type,
      device_accessories_received,
      device_brand,
      device_serial,
      device_problem,
    } = deviceData;

    // Required field validation
    if (!device_year)
      throw new Error("Year is required");

    if (!device_make)
      throw new Error("Make is required");

    if (!device_model)
      throw new Error("Model is required");

    if (!device_type)
      throw new Error("Type is required");

    if (!device_accessories_received)
      throw new Error("Accessorie is required");

    if (!device_brand)
      throw new Error("Brand is required");

    if (!device_serial)
      throw new Error("Serial is required");

    if (!device_problem)
      throw new Error("Problem is required");

    // =====================================================
    // CHECK DUPLICATE SERIAL
    // =====================================================
    const serialExists = await conn.query(
      `
        SELECT device_id
        FROM customer_device_info
        WHERE device_serial = ?
          AND deleted_at IS NULL
      `,
      [device_serial]
    );

    if (serialExists.length > 0) {
      throw new Error("Serial already exists");
    }

    // =====================================================
    // CHECK DUPLICATE BRAND
    // =====================================================
    const brandExists = await conn.query(
      `
        SELECT device_id
        FROM customer_device_info
        WHERE device_brand = ?
          AND deleted_at IS NULL
      `,
      [device_brand]
    );

    if (brandExists.length > 0) {
      throw new Error("Brand already exists");
    }

    // =====================================================
    // GENERATE NEXT DEVICE ID
    // =====================================================
    const idResult = await conn.query(
      `
        SELECT COALESCE(MAX(device_id), 0) + 1 AS nextDeviceId
        FROM customer_device_info
      `
    );

    const device_id = idResult[0].nextDeviceId;

    // =====================================================
    // INSERT DEVICE
    // =====================================================
    const query = `
      INSERT INTO customer_device_info (
        device_id,
        customer_id,
        device_year,
        device_make,
        device_model,
        device_type,
        device_accessories_received,
        device_brand,
        device_serial,
        device_problem
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return await conn.query(query, [
      device_id,
      customer_id,
      device_year,
      device_make,
      device_model,
      device_type,
      device_accessories_received,
      device_brand,
      device_serial,
      device_problem,
    ]);

  } catch (error) {
    console.log("Create Device Service Error:", error);
    throw error;
  }
}

// =========================================================
// GET DEVICES BY CUSTOMER
// ONLY NON-DELETED DEVICES
// =========================================================
async function getdevicesByCustomer(customer_id) {
  try {
    const query = `
      SELECT *
      FROM customer_device_info
      WHERE customer_id = ?
        AND deleted_at IS NULL
      ORDER BY device_id DESC
    `;

    const rows = await conn.query(
      query,
      [customer_id]
    );

    return rows;

  } catch (error) {
    console.log(
      "Get devices Service Error:",
      error
    );

    throw error;
  }
}

// =========================================================
// SOFT DELETE DEVICE
// =========================================================
async function deletedevice(deviceId) {
  try {
    const query = `
      UPDATE customer_device_info
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE device_id = ?
        AND deleted_at IS NULL
    `;

    const result = await conn.query(
      query,
      [deviceId]
    );

    if (result.affectedRows !== 1) {
      throw new Error(
        "Device not found or already deleted"
      );
    }

    return true;

  } catch (error) {
    console.error(
      "SOFT DELETE DEVICE ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET SINGLE DEVICE
// ONLY NON-DELETED DEVICES
// =========================================================
async function getSingleDevice(deviceId) {
  try {
    const query = `
      SELECT *
      FROM customer_device_info
      WHERE device_id = ?
        AND deleted_at IS NULL
    `;

    const rows = await conn.query(
      query,
      [deviceId]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];

  } catch (error) {
    console.log(
      "Get Single Device Service Error:",
      error
    );

    throw error;
  }
}

// =========================================================
// UPDATE DEVICE
// =========================================================
async function updateDevice(deviceId, data) {
  try {
    // Get current record
    const current = await getSingleDevice(deviceId);

    if (!current) {
      throw new Error("Device not found");
    }

    const updated = {
      device_year:
        data.device_year ?? current.device_year,

      device_make:
        data.device_make ?? current.device_make,

      device_model:
        data.device_model ?? current.device_model,

      device_type:
        data.device_type ?? current.device_type,

      device_accessories_received:
        data.device_accessories_received ??
        current.device_accessories_received,

      device_brand:
        data.device_brand ?? current.device_brand,

      device_serial:
        data.device_serial ?? current.device_serial,

      device_problem:
        data.device_problem ?? current.device_problem,
    };

    const query = `
      UPDATE customer_device_info
      SET
        device_year = ?,
        device_make = ?,
        device_model = ?,
        device_type = ?,
        device_accessories_received = ?,
        device_brand = ?,
        device_serial = ?,
        device_problem = ?
      WHERE device_id = ?
        AND deleted_at IS NULL
    `;

    return await conn.query(query, [
      updated.device_year,
      updated.device_make,
      updated.device_model,
      updated.device_type,
      updated.device_accessories_received,
      updated.device_brand,
      updated.device_serial,
      updated.device_problem,
      deviceId,
    ]);

  } catch (error) {
    console.log(
      "Update Device Service Error:",
      error
    );

    throw error;
  }
}

// =========================================================
// GET DELETED DEVICES
// RECYCLE BIN
// =========================================================
async function getDeletedDevices() {
  try {
    const query = `
      SELECT
        d.device_id,
        d.customer_id,
        d.device_make,
        d.device_model,
        d.device_year,
        d.device_brand,
        d.deleted_at,

        ci.customer_first_name,
        ci.customer_last_name,

        c.customer_email,
        c.customer_phone_number

      FROM customer_device_info d

      LEFT JOIN customer_info ci
        ON d.customer_id = ci.customer_id

      LEFT JOIN customer_identifier c
        ON d.customer_id = c.customer_id

      WHERE d.deleted_at IS NOT NULL

      ORDER BY d.deleted_at DESC
    `;

    const rows = await conn.query(query);

    return rows;

  } catch (error) {
    console.log(
      "GET DELETED DEVICES ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// RESTORE DEVICE
// =========================================================
async function restoreDevice(deviceId) {
  try {
    const query = `
      UPDATE customer_device_info
      SET deleted_at = NULL
      WHERE device_id = ?
        AND deleted_at IS NOT NULL
    `;

    const result = await conn.query(
      query,
      [deviceId]
    );

    if (result.affectedRows === 0) {
      throw new Error(
        "Device not found in recycle bin"
      );
    }

    return true;

  } catch (error) {
    console.log(
      "RESTORE DEVICE ERROR:",
      error
    );

    throw error;
  }
}

// =========================================================
// PERMANENT DELETE DEVICE
// =========================================================

async function permanentDeleteDevice(deviceId) {
  try {
    // =====================================================
    // 1. CHECK THAT DEVICE EXISTS IN RECYCLE BIN
    // =====================================================
    const checkQuery = `
      SELECT device_id
      FROM customer_device_info
      WHERE device_id = ?
        AND deleted_at IS NOT NULL
    `;

    const device = await conn.query(checkQuery, [deviceId]);

    if (device.length === 0) {
      throw new Error(
        "Device not found in recycle bin or has already been deleted"
      );
    }

    // =====================================================
    // 2. GET ALL ORDERS BELONGING TO THIS DEVICE
    // =====================================================
    const orderRows = await conn.query(
      `
        SELECT order_id
        FROM orders
        WHERE device_id = ?
      `,
      [deviceId]
    );

    // =====================================================
    // 3. DELETE ALL CHILD RECORDS FIRST
    // =====================================================
    for (const order of orderRows) {

      // Delete order_services records
      await conn.query(
        `
          DELETE FROM order_services
          WHERE order_id = ?
        `,
        [order.order_id]
      );

      // Delete order_status records
      await conn.query(
        `
          DELETE FROM order_status
          WHERE order_id = ?
        `,
        [order.order_id]
      );

      // Delete order_info records
      await conn.query(
        `
          DELETE FROM order_info
          WHERE order_id = ?
        `,
        [order.order_id]
      );
    }

    // =====================================================
    // 4. NOW DELETE ORDERS
    // =====================================================
    await conn.query(
      `
        DELETE FROM orders
        WHERE device_id = ?
      `,
      [deviceId]
    );

    // =====================================================
    // 5. FINALLY DELETE THE DEVICE
    // =====================================================
    const result = await conn.query(
      `
        DELETE FROM customer_device_info
        WHERE device_id = ?
          AND deleted_at IS NOT NULL
      `,
      [deviceId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to permanently delete device");
    }

    return {
      success: true,
      message: "Device permanently deleted successfully",
      device_id: deviceId,
    };

  } catch (error) {
    console.error(
      "Permanent Delete Device Service Error:",
      error
    );

    throw error;
  }
}
// =========================================================
// EXPORT FUNCTIONS
// =========================================================
module.exports = {
  createdevice,
  getdevicesByCustomer,
  deletedevice,
  getSingleDevice,
  updateDevice,
  getDeletedDevices,
  restoreDevice,
  permanentDeleteDevice,
}

