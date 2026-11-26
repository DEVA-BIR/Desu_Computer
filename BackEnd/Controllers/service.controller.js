const serviceService =
  require("../Services/service.service");


// =====================================================
// CREATE SERVICE
// =====================================================
async function createService(req, res) {

  try {

    console.log("REQ BODY:", req.body);

    const result =
      await serviceService.createService(req.body);

    return res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: result,
    });

  } catch (error) {

    console.log(
      "Create Service Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}


// =====================================================
// GET ALL ACTIVE SERVICES
// =====================================================
async function getAllServices(req, res) {

  try {

    const services =
      await serviceService.getAllServices();

    return res.status(200).json({
      success: true,
      data: services,
    });

  } catch (error) {

    console.log(
      "Get Services Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}


// =====================================================
// GET RECYCLE BIN SERVICES
// =====================================================
async function getRecycleBinServices(req, res) {

  try {

    const services =
      await serviceService.getRecycleBinServices();

    return res.status(200).json({
      success: true,
      data: services,
    });

  } catch (error) {

    console.log(
      "Get Recycle Bin Services Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get recycle bin services",
    });
  }
}


// =====================================================
// UPDATE SERVICE
// =====================================================
async function updateService(req, res) {

  try {

    const { service_id } = req.params;

    await serviceService.updateService(
      service_id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
    });

  } catch (error) {

    console.log(
      "Update Service Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}


// =====================================================
// MOVE SERVICE TO RECYCLE BIN
// =====================================================
async function deleteService(req, res) {

  try {

    const { service_id } = req.params;

    await serviceService.deleteService(
      service_id
    );

    return res.status(200).json({
      success: true,
      message:
        "Service moved to recycle bin successfully",
    });

  } catch (error) {

    console.log(
      "Delete Service Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to move service to recycle bin",
    });
  }
}


// =====================================================
// RESTORE SERVICE
// =====================================================
async function restoreService(req, res) {

  try {

    const { service_id } = req.params;

    await serviceService.restoreService(
      service_id
    );

    return res.status(200).json({
      success: true,
      message: "Service restored successfully",
    });

  } catch (error) {

    console.log(
      "Restore Service Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to restore service",
    });
  }
}


// =====================================================
// PERMANENTLY DELETE SERVICE
// =====================================================
async function permanentlyDeleteService(req, res) {

  try {

    const { service_id } = req.params;

    await serviceService.permanentlyDeleteService(
      service_id
    );

    return res.status(200).json({
      success: true,
      message:
        "Service permanently deleted successfully",
    });

  } catch (error) {

    console.log(
      "Permanent Delete Service Controller Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to permanently delete service",
    });
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