const express = require("express");

const router = express.Router();

const orderController = require("../Controllers/order.controller");

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================
router.post(
  "/",
  orderController.createOrder
);

// =====================================================
// GET ALL ACTIVE ORDERS
// GET /api/orders
// =====================================================
router.get(
  "/",
  orderController.getAllOrders
);

// =====================================================
// GET RECYCLE BIN ORDERS
// GET /api/orders/recycle-bin
// =====================================================
router.get(
  "/recycle-bin",
  orderController.getRecycleBinOrders
);

// =====================================================
// RESTORE ORDER
// PATCH /api/orders/:id/restore
// =====================================================
router.patch(
  "/:id/restore",
  orderController.restoreOrder
);

// =====================================================
// PERMANENTLY DELETE ORDER
// DELETE /api/orders/:id/permanent
// =====================================================
router.delete(
  "/:id/permanent",
  orderController.permanentlyDeleteOrder
);

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// =====================================================
router.get(
  "/:id",
  orderController.getSingleOrder
);

// =====================================================
// UPDATE ORDER
// PUT /api/orders/:id
// =====================================================
router.put(
  "/:id",
  orderController.updateOrder
);

// =====================================================
// MOVE ORDER TO RECYCLE BIN
// DELETE /api/orders/:id
// =====================================================
router.delete(
  "/:id",
  orderController.deleteOrder
);

module.exports = router;