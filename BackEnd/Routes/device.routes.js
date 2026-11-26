const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");


const deviceController = require("../Controllers/device.controller");

// Create
router.post("/", deviceController.createdevice);

// Get single device
router.get("/single/:id", deviceController.getSingleDevice);

// Get devices by customer
router.get("/customer/:customer_id", deviceController.getdevicesByCustomer);

// Update
router.put("/:id", deviceController.updateDevice);

// Delete
router.delete("/:id", deviceController.deletedevice);
// =========================================================
// DEVICE RECYCLE BIN - ADMIN ONLY
// =========================================================

router.get(
  "/recycle-bin",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin
  ],
  deviceController.getDeletedDevices
);


router.patch(
  "/:id/restore",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin
  ],
  deviceController.restoreDevice
);


router.delete(
  "/:id/permanent",
  [
    authMiddleware.verifyToken,
    authMiddleware.isAdmin
  ],
  deviceController.permanentDeleteDevice
);

module.exports = router;