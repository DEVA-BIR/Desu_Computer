import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { format } from "date-fns";
import { FaTrashRestore, FaTrash, FaSearch } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContxt.jsx";

const DeviceRecycleBin = () => {

  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const { employee } = useAuth();

  const token = employee?.employee_token || null;


  // =========================================================
  // GET DELETED DEVICES
  // =========================================================
  const fetchDeletedDevices = async () => {

    try {

      setLoading(true);
      setErrorMsg(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/DeviceInfo/recycle-bin`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to load deleted devices"
        );
      }

      setDevices(data.data || []);

    } catch (error) {

      console.error(
        "GET DELETED DEVICES ERROR:",
        error
      );

      setErrorMsg(
        error.message ||
        "Failed to load deleted devices"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    if (token) {
      fetchDeletedDevices();
    }

  }, [token]);


  // =========================================================
  // RESTORE DEVICE
  // =========================================================
  const handleRestore = async (deviceId) => {

    const confirmed = window.confirm(
      "Are you sure you want to restore this device?"
    );

    if (!confirmed) return;

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/DeviceInfo/${deviceId}/restore`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to restore device"
        );
      }

      setDevices((prev) =>
        prev.filter(
          (device) =>
            device.device_id !== deviceId
        )
      );

      setSuccessMsg(
        data.message ||
        "Device restored successfully"
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);

    } catch (error) {

      console.error(
        "RESTORE DEVICE ERROR:",
        error
      );

      setErrorMsg(
        error.message ||
        "Failed to restore device"
      );
    }
  };


  // =========================================================
  // PERMANENT DELETE
  // =========================================================
  const handlePermanentDelete = async (deviceId) => {

    const confirmed = window.confirm(
      "WARNING!\n\n" +
      "This will permanently delete the device " +
      "and its related orders.\n\n" +
      "This action cannot be undone.\n\n" +
      "Are you sure?"
    );

    if (!confirmed) return;

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/DeviceInfo/${deviceId}/permanent`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to permanently delete device"
        );
      }

      setDevices((prev) =>
        prev.filter(
          (device) =>
            device.device_id !== deviceId
        )
      );

      setSuccessMsg(
        data.message ||
        "Device permanently deleted"
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);

    } catch (error) {

      console.error(
        "PERMANENT DELETE DEVICE ERROR:",
        error
      );

      setErrorMsg(
        error.message ||
        "Failed to permanently delete device"
      );
    }
  };


  // =========================================================
  // SEARCH
  // =========================================================
  const filteredDevices = devices.filter(
    (device) => {

      const search =
        searchTerm.toLowerCase();

      return (

        String(device.device_id || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.customer_first_name || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.customer_last_name || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.customer_email || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_year || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_make || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_model || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_type || "")
          .toLowerCase()
          .includes(search)

        ||

        String(
          device.device_accessories_received || ""
        )
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_brand || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_serial || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.device_problem || "")
          .toLowerCase()
          .includes(search)

        ||

        String(device.deleted_at || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );


  useEffect(() => {

    setCurrentPage(1);

  }, [searchTerm]);


  // =========================================================
  // PAGINATION
  // =========================================================
  const totalPages =
    Math.ceil(
      filteredDevices.length /
      itemsPerPage
    );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentDevices =
    filteredDevices.slice(
      startIndex,
      startIndex + itemsPerPage
    );


  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {

    return (
      <section className="recycle-bin">

        <div className="recycle-bin-container">

          <h2 className="recycle-bin-loading">
            Loading Device Recycle Bin...
          </h2>

        </div>

      </section>
    );
  }


  // =========================================================
  // UI
  // =========================================================
  return (

    <section className="recycle-bin">

      <div className="recycle-bin-container">


        {/* HEADER */}

        <div className="recycle-bin-header">

          <div className="recycle-bin-title">

            <h2>
              🗑️ Device Recycle Bin
            </h2>

            <p className="recycle-bin-count">
              Deleted Devices:{" "}
              {filteredDevices.length}
            </p>

          </div>


          {/* SEARCH */}

          <div className="recycle-bin-search-wrapper">

            <FaSearch className="recycle-bin-search-icon" />

            <input
              type="text"
              className="recycle-bin-search"
              placeholder="Search deleted devices..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {/* SUCCESS */}

        {successMsg && (

          <div className="recycle-bin-message recycle-bin-success">
            {successMsg}
          </div>

        )}


        {/* ERROR */}

        {errorMsg && (

          <div className="recycle-bin-message recycle-bin-error">
            {errorMsg}
          </div>

        )}


        {/* TABLE */}

        <div className="recycle-bin-table-wrapper">

          <Table
            striped
            bordered
            hover
            className="recycle-bin-table"
          >

            <thead>

              <tr>

                <th>No.</th>

                <th>Device ID</th>

                <th>Customer</th>

                <th>Year</th>

                <th>Make</th>

                <th>Model</th>

                <th>Type</th>

                <th>Accessories</th>

                <th>Brand</th>

                <th>Serial</th>

                <th>Problem</th>

                <th>Deleted Date</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {currentDevices.length > 0 ? (

                currentDevices.map(
                  (device, index) => (

                    <tr
                      key={
                        device.device_id
                      }
                    >

                      <td>
                        {startIndex +
                          index +
                          1}
                      </td>

                      <td>
                        {device.device_id}
                      </td>

                      <td>
                        {device.customer_first_name}{" "}
                        {device.customer_last_name}
                      </td>

                      <td>
                        {device.device_year}
                      </td>

                      <td>
                        {device.device_make}
                      </td>

                      <td>
                        {device.device_model}
                      </td>

                      <td>
                        {device.device_type}
                      </td>

                      <td>
                        {
                          device.device_accessories_received
                        }
                      </td>

                      <td>
                        {device.device_brand}
                      </td>

                      <td>
                        {device.device_serial}
                      </td>

                      <td>
                        {device.device_problem}
                      </td>

                      <td>

                        {device.deleted_at
                          ? format(
                              new Date(
                                device.deleted_at
                              ),
                              "MM-dd-yyyy | kk:mm"
                            )
                          : "N/A"}

                      </td>

                      <td>

                        <div className="recycle-bin-actions">

                          <button
                            type="button"
                            className="recycle-bin-action recycle-bin-restore"
                            title="Restore Device"
                            onClick={() =>
                              handleRestore(
                                device.device_id
                              )
                            }
                          >

                            <FaTrashRestore />

                          </button>


                          <button
                            type="button"
                            className="recycle-bin-action recycle-bin-permanent-delete"
                            title="Delete Permanently"
                            onClick={() =>
                              handlePermanentDelete(
                                device.device_id
                              )
                            }
                          >

                            <FaTrash />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="13"
                    className="recycle-bin-empty"
                  >
                    🗑️ No deleted devices found.
                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </div>


        {/* PAGINATION */}

        {filteredDevices.length > 0 && (

          <div className="pagination">

            <button
              onClick={() =>
                setCurrentPage(1)
              }
              disabled={
                currentPage === 1
              }
            >
              « First
            </button>


            <button
              onClick={() =>
                setCurrentPage(
                  currentPage - 1
                )
              }
              disabled={
                currentPage === 1
              }
            >
              ‹ Previous
            </button>


            <span className="recycle-bin-page-info">
              Page {currentPage} of{" "}
              {totalPages}
            </span>


            <button
              onClick={() =>
                setCurrentPage(
                  currentPage + 1
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
            >
              Next ›
            </button>


            <button
              onClick={() =>
                setCurrentPage(
                  totalPages
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
            >
              Last »
            </button>

          </div>

        )}

      </div>

    </section>

  );
};

export default DeviceRecycleBin;