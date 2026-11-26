const express = require("express");

const router = express.Router();

const serviceController =
  require("../Controllers/service.controller");


// =====================================================
// CREATE SERVICE
// =====================================================
router.post(
  "/service",
  serviceController.createService
);


// =====================================================
// GET ACTIVE SERVICES
// =====================================================
router.get(
  "/service",
  serviceController.getAllServices
);


// =====================================================
// GET RECYCLE BIN SERVICES
// =====================================================
router.get(
  "/service/recycle-bin",
  serviceController.getRecycleBinServices
);


// =====================================================
// RESTORE SERVICE
// =====================================================
router.patch(
  "/service/:service_id/restore",
  serviceController.restoreService
);


// =====================================================
// PERMANENTLY DELETE SERVICE
// =====================================================
router.delete(
  "/service/:service_id/permanent",
  serviceController.permanentlyDeleteService
);


// =====================================================
// UPDATE SERVICE
// =====================================================
router.put(
  "/service/:service_id",
  serviceController.updateService
);


// =====================================================
// MOVE SERVICE TO RECYCLE BIN
// =====================================================
router.delete(
  "/service/:service_id",
  serviceController.deleteService
);


module.exports = router;