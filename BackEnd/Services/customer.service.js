// Import the query function from the db.config.js file
const conn = require("../Config/dbconfig");

// Check if customer exists
async function checkIfCustomerExists(email) {
  const query = "SELECT * FROM customer_identifier WHERE customer_email = ?";
  const rows = await conn.query(query, [email]);

  return rows.length > 0;
}
async function createCustomer(customer) {

  const customerIdentifierQuery = `
    INSERT INTO customer_identifier
    (customer_email, customer_phone_number, customer_hash)
    VALUES (?, ?, ?)
  `;

  const identifierResult = await conn.query(
    customerIdentifierQuery,
    [
      customer.customer_email,
      customer.customer_phone,
      "default_hash"
    ]
  );

  const customer_id = identifierResult.insertId;

  const customerInfoQuery = `
    INSERT INTO customer_info
    (customer_id, customer_first_name, customer_last_name, active_customer_status)
    VALUES (?, ?, ?, ?)
  `;

  await conn.query(
    customerInfoQuery,
    [
      customer_id,
      customer.customer_first_name,
      customer.customer_last_name,
      1
    ]
  );

  return customer_id;
}

// Get customer by email
async function getCustomerByEmail(customer_email) {
  const query = `
    SELECT * FROM customer
    INNER JOIN customer_info
    ON customer.customer_id = customer_info.customer_id
    WHERE customer.customer_email = ?
  `;

  const rows = await conn.query(query, [customer_email]);

  return rows;
}

// Get all customers
async function getAllCustomers() {
  const query = `
    SELECT 
      ci.customer_id,
      ci.customer_first_name,
      ci.customer_last_name,
      c.customer_email,
      c.customer_phone_number,
      c.customer_added_date,
      ci.active_customer_status
    FROM customer_info ci
    LEFT JOIN customer_identifier c
      ON ci.customer_id = c.customer_id
    WHERE c.is_deleted = 0
    ORDER BY c.customer_id DESC
  `;

  const rows = await conn.query(query);

  return rows;
}
// =====================================================
// GET DELETED CUSTOMERS
// =====================================================

async function getDeletedCustomers() {
  const query = `
    SELECT 
      ci.customer_id,
      ci.customer_first_name,
      ci.customer_last_name,
      c.customer_email,
      c.customer_phone_number,
      c.customer_added_date,
      c.deleted_at,
      ci.active_customer_status
    FROM customer_info ci
    INNER JOIN customer_identifier c
      ON ci.customer_id = c.customer_id
    WHERE c.is_deleted = 1
    ORDER BY c.deleted_at DESC
  `;

  const rows = await conn.query(query);

  return rows;
}
async function updateCustomer(customerId, customer) {
  await conn.query(
    `
      UPDATE customer_info
      SET
      customer_first_name=?,
      customer_last_name=?,
      active_customer_status=?
      WHERE customer_id=?
    `,
    [
      customer.firstName,
      customer.lastName,
      customer.active ? 1 : 0,
      customerId,
    ]
  );

  await conn.query(
    `
      UPDATE customer_identifier
      SET customer_phone_number=?
      WHERE customer_id=?
    `,
    [
      customer.phone,
      customerId,
    ]
  );

  return true;
}
async function deleteCustomer(customerId) {
  try {
    const query = `
      UPDATE customer_identifier
      SET
        is_deleted = 1,
        deleted_at = NOW()
      WHERE customer_id = ?
    `;

    const result = await conn.query(query, [customerId]);

    if (result.affectedRows === 0) {
      throw new Error("Customer not found");
    }

    return true;

  } catch (error) {
    console.log("SOFT DELETE CUSTOMER ERROR:", error);
    throw error;
  }
}
async function restoreCustomer(customerId) {
  try {
    const query = `
      UPDATE customer_identifier
      SET
        is_deleted = 0,
        deleted_at = NULL
      WHERE customer_id = ?
    `;

    const result = await conn.query(query, [customerId]);

    if (result.affectedRows === 0) {
      throw new Error("Customer not found");
    }

    return true;

  } catch (error) {
    console.log("RESTORE CUSTOMER ERROR:", error);
    throw error;
  }
}
// =====================================================
// PERMANENT DELETE CUSTOMER
// =====================================================

async function permanentDeleteCustomer(customerId) {

  // Get all orders belonging to this customer
  // OR connected to their devices
  const orders = await conn.query(`
    SELECT DISTINCT o.order_id
    FROM orders o
    LEFT JOIN customer_device_info d
      ON o.device_id = d.device_id
    WHERE o.customer_id = ?
       OR d.customer_id = ?
  `, [customerId, customerId]);

  // Delete order children
  for (const order of orders) {
    await conn.query(
      `DELETE FROM order_info WHERE order_id = ?`,
      [order.order_id]
    );

    await conn.query(
      `DELETE FROM order_services WHERE order_id = ?`,
      [order.order_id]
    );

    await conn.query(
      `DELETE FROM order_status WHERE order_id = ?`,
      [order.order_id]
    );
  }

  // Delete orders
  await conn.query(`
    DELETE o FROM orders o
    LEFT JOIN customer_device_info d
      ON o.device_id = d.device_id
    WHERE o.customer_id = ?
       OR d.customer_id = ?
  `, [customerId, customerId]);

  // Delete devices
  await conn.query(
    `DELETE FROM customer_device_info WHERE customer_id = ?`,
    [customerId]
  );

  // Delete customer info
  await conn.query(
    `DELETE FROM customer_info WHERE customer_id = ?`,
    [customerId]
  );

  // Delete customer
  const result = await conn.query(
    `DELETE FROM customer_identifier WHERE customer_id = ?`,
    [customerId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Customer not found");
  }

  return true;
}
// Export functions
module.exports = {
  checkIfCustomerExists,
  createCustomer,
  getCustomerByEmail,
  getAllCustomers,
  getDeletedCustomers,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  permanentDeleteCustomer,  
};
