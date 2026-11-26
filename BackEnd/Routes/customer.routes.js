const express = require("express");

const router = express.Router();

const customerController =
  require("../Controllers/customer.controller");


// =====================================================
// CREATE CUSTOMER
// =====================================================

router.post(
  "/customers",
  customerController.createCustomer
);


// =====================================================
// GET ACTIVE CUSTOMERS
// =====================================================

router.get(
  "/customers",
  customerController.getAllCustomers
);


// =====================================================
// GET CUSTOMER RECYCLE BIN
// =====================================================

router.get(
  "/customers/recycle-bin",
  customerController.getDeletedCustomers
);


// =====================================================
// RESTORE CUSTOMER
// =====================================================

router.patch(
  "/customers/:id/restore",
  customerController.restoreCustomer
);


// =====================================================
// PERMANENT DELETE CUSTOMER
// =====================================================

router.delete(
  "/customers/:id/permanent",
  customerController.permanentDeleteCustomer
);


// =====================================================
// UPDATE CUSTOMER
// =====================================================

router.put(
  "/customers/:id",
  customerController.updateCustomer
);


// =====================================================
// MOVE CUSTOMER TO RECYCLE BIN
// =====================================================

router.delete(
  "/customers/:id",
  customerController.deleteCustomer
);


module.exports = router;