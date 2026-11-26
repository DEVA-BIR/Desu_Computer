// =====================================================
// IMPORT CUSTOMER SERVICE
// =====================================================

const customerService = require("../Services/customer.service");


// =====================================================
// CREATE CUSTOMER
// =====================================================

async function createCustomer(req, res) {
  console.log("CREATE CUSTOMER BODY:", req.body);

  try {

    // Check if customer email already exists
    const customerExists =
      await customerService.checkIfCustomerExists(
        req.body.customer_email
      );

    if (customerExists) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already associated with another customer!",
      });
    }

    // Create customer
    const customer =
      await customerService.createCustomer(req.body);

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Failed to add the customer!",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });

  } catch (error) {

    console.error(
      "CREATE CUSTOMER CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
}


// =====================================================
// GET ALL ACTIVE CUSTOMERS
// =====================================================

async function getAllCustomers(req, res) {

  try {

    const customers =
      await customerService.getAllCustomers();

    return res.status(200).json({
      success: true,
      data: customers,
    });

  } catch (error) {

    console.error(
      "GET ALL CUSTOMERS CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load customers",
    });
  }
}


// =====================================================
// UPDATE CUSTOMER
// =====================================================

async function updateCustomer(req, res) {

  try {

    const customerId = req.params.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    await customerService.updateCustomer(
      customerId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
    });

  } catch (error) {

    console.error(
      "UPDATE CUSTOMER CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update customer",
    });
  }
}


// =====================================================
// SOFT DELETE CUSTOMER
// =====================================================

async function deleteCustomer(req, res) {

  try {

    const customerId = req.params.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    await customerService.deleteCustomer(
      customerId
    );

    return res.status(200).json({
      success: true,
      message: "Customer moved to recycle bin",
    });

  } catch (error) {

    console.error(
      "DELETE CUSTOMER CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to delete customer",
    });
  }
}


// =====================================================
// GET DELETED CUSTOMERS
// =====================================================

async function getDeletedCustomers(req, res) {

  try {

    const customers =
      await customerService.getDeletedCustomers();

    return res.status(200).json({
      success: true,
      data: customers,
    });

  } catch (error) {

    console.error(
      "GET DELETED CUSTOMERS CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load recycle bin customers",
    });
  }
}


// =====================================================
// RESTORE CUSTOMER
// =====================================================

async function restoreCustomer(req, res) {

  try {

    const customerId = req.params.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    await customerService.restoreCustomer(
      customerId
    );

    return res.status(200).json({
      success: true,
      message: "Customer restored successfully",
    });

  } catch (error) {

    console.error(
      "RESTORE CUSTOMER CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to restore customer",
    });
  }
}


// =====================================================
// PERMANENT DELETE CUSTOMER
// =====================================================

async function permanentDeleteCustomer(req, res) {

  try {

    const customerId = req.params.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    await customerService.permanentDeleteCustomer(
      customerId
    );

    return res.status(200).json({
      success: true,
      message: "Customer permanently deleted",
    });

  } catch (error) {

    console.error(
      "PERMANENT DELETE CUSTOMER CONTROLLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to permanently delete customer",
    });
  }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  createCustomer,

  getAllCustomers,

  updateCustomer,

  deleteCustomer,

  getDeletedCustomers,

  restoreCustomer,

  permanentDeleteCustomer,

};