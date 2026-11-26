import React, { useEffect, useState } from "react";
import {
  FaUndo,
  FaTrash,
  FaSearch,
  FaSync,
} from "react-icons/fa";

import serviceService from "../../Services/service.service";

const ServiceRecycleBin = () => {

  // =====================================================
  // SERVICES STATE
  // =====================================================
  const [services, setServices] = useState([]);

  // =====================================================
  // SEARCH STATE
  // =====================================================
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // LOADING STATE
  // =====================================================
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  // =====================================================
  // MESSAGE STATE
  // =====================================================
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  // =====================================================
  // PAGINATION STATE
  // =====================================================
  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  // =====================================================
  // LOAD RECYCLE BIN SERVICES
  // =====================================================
  useEffect(() => {
    loadRecycleBinServices();
  }, []);

  const loadRecycleBinServices = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res =
        await serviceService.getRecycleBinServices();

      setServices(res.data || []);

    } catch (error) {

      console.error(
        "Load Recycle Bin Services Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to load recycle bin services"
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET PAGINATION WHEN SEARCH CHANGES
  // =====================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // =====================================================
  // RESTORE SERVICE
  // =====================================================
  const handleRestore = async (service_id) => {

    const confirmed = window.confirm(
      "Are you sure you want to restore this service?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(true);
      setMessage("");

      await serviceService.restoreService(
        service_id
      );

      setServices((prevServices) =>
        prevServices.filter(
          (service) =>
            Number(service.service_id) !==
            Number(service_id)
        )
      );

      setMessage(
        "Service restored successfully"
      );

      setMessageType("success");

    } catch (error) {

      console.error(
        "Restore Service Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to restore service"
      );

      setMessageType("error");

    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // PERMANENT DELETE
  // =====================================================
  const handlePermanentDelete = async (
    service_id
  ) => {

    const confirmed = window.confirm(
      "WARNING!\n\nThis service will be permanently deleted and cannot be recovered.\n\nAre you sure you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(true);
      setMessage("");

      await serviceService.permanentlyDeleteService(
        service_id
      );

      setServices((prevServices) =>
        prevServices.filter(
          (service) =>
            Number(service.service_id) !==
            Number(service_id)
        )
      );

      setMessage(
        "Service permanently deleted successfully"
      );

      setMessageType("success");

    } catch (error) {

      console.error(
        "Permanent Delete Service Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to permanently delete service"
      );

      setMessageType("error");

    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================
  const filteredServices =
    services.filter((service) => {

      const search =
        searchTerm.toLowerCase().trim();

      if (!search) {
        return true;
      }

      const name = String(
        service.service_name || ""
      ).toLowerCase();

      const description = String(
        service.service_description || ""
      ).toLowerCase();

      const id = String(
        service.service_id || ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        description.includes(search) ||
        id.includes(search)
      );
    });

  // =====================================================
  // PAGINATION
  // =====================================================
  const totalPages = Math.ceil(
    filteredServices.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentServices =
    filteredServices.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // =====================================================
  // LOADING UI
  // =====================================================
  if (loading) {

    return (
      <section className="service-recycle-bin">

        <div className="service-recycle-header">

          <div>
            <h2>
              Service Recycle Bin
            </h2>

            <p>
              Manage deleted services
            </p>
          </div>

        </div>

        <div className="service-recycle-loading">

          <div className="service-spinner"></div>

          <p>
            Loading recycle bin...
          </p>

        </div>

      </section>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <section className="service-recycle-bin">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="service-recycle-header">

        <div className="service-recycle-title">

          <div className="service-recycle-icon">
            🗑️
          </div>

          <div>

            <h2>
              Service Recycle Bin
            </h2>

            <p>
              Restore deleted services or permanently
              remove them.
            </p>

          </div>

        </div>

        <div className="service-recycle-count">

          <strong>
            {services.length}
          </strong>

          <span>
            Deleted Services
          </span>

        </div>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}
      {message && (

        <div
          className={`service-recycle-message ${
            messageType === "success"
              ? "success"
              : "error"
          }`}
        >
          {message}
        </div>

      )}

      {/* =================================================
          TOOLBAR
      ================================================= */}
      <div className="service-recycle-toolbar">

        <div className="service-recycle-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search deleted services..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          {searchTerm && (

            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              ×
            </button>

          )}

        </div>

        <button
          type="button"
          className="service-refresh-btn"
          onClick={
            loadRecycleBinServices
          }
          disabled={
            loading ||
            actionLoading
          }
        >
          <FaSync />
          Refresh
        </button>

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}
      {filteredServices.length === 0 ? (

        <div className="service-recycle-empty">

          <div className="empty-recycle-icon">
            🗑️
          </div>

          {searchTerm ? (

            <>
              <h3>
                No services found
              </h3>

              <p>
                No deleted services match
                "{searchTerm}".
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear Search
              </button>
            </>

          ) : (

            <>
              <h3>
                Recycle Bin is Empty
              </h3>

              <p>
                There are currently no deleted
                services.
              </p>
            </>

          )}

        </div>

      ) : (

        <>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}
          <div className="service-recycle-table-wrapper">

            <table className="service-recycle-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Service Name
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {currentServices.map(
                  (service) => (

                    <tr
                      key={
                        service.service_id
                      }
                    >

                      {/* ID */}
                      <td>

                        <span className="service-id">
                          #{service.service_id}
                        </span>

                      </td>

                      {/* SERVICE NAME */}
                      <td>

                        <strong>
                          {service.service_name}
                        </strong>

                      </td>

                      {/* DESCRIPTION */}
                      <td>

                        <div className="service-description">

                          {service.service_description ||
                            "No description"}

                        </div>

                      </td>

                      {/* STATUS */}
                      <td>

                        <span className="deleted-status">
                          Deleted
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td>

                        <div className="service-recycle-actions">

                          <button
                            type="button"
                            className="restore-service-btn"
                            onClick={() =>
                              handleRestore(
                                service.service_id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            title="Restore service"
                          >
                            <FaUndo />
                            Restore
                          </button>

                          <button
                            type="button"
                            className="permanent-service-btn"
                            onClick={() =>
                              handlePermanentDelete(
                                service.service_id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            title="Permanently delete service"
                          >
                            <FaTrash />
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}
          <div className="service-recycle-mobile">

            {currentServices.map(
              (service) => (

                <div
                  className="service-recycle-card"
                  key={
                    service.service_id
                  }
                >

                  <div className="service-card-header">

                    <div>

                      <span>
                        SERVICE
                      </span>

                      <h3>
                        #{service.service_id}
                      </h3>

                    </div>

                    <span className="deleted-status">
                      Deleted
                    </span>

                  </div>

                  <div className="service-card-content">

                    <div className="service-card-row">

                      <span>
                        Service Name
                      </span>

                      <strong>
                        {service.service_name}
                      </strong>

                    </div>

                    <div className="service-card-row description-row">

                      <span>
                        Description
                      </span>

                      <p>
                        {service.service_description ||
                          "No description"}
                      </p>

                    </div>

                  </div>

                  <div className="service-card-actions">

                    <button
                      type="button"
                      className="restore-service-btn"
                      onClick={() =>
                        handleRestore(
                          service.service_id
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <FaUndo />
                      Restore
                    </button>

                    <button
                      type="button"
                      className="permanent-service-btn"
                      onClick={() =>
                        handlePermanentDelete(
                          service.service_id
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <FaTrash />
                      Delete Permanently
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}
          {filteredServices.length > 0 && (
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
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage === totalPages
                }
              >
                Next ›
              </button>

              <button
                onClick={() =>
                  setCurrentPage(totalPages)
                }
                disabled={
                  currentPage === totalPages
                }
              >
                Last »
              </button>

            </div>
          )}

        </>

      )}

    </section>
  );
};

export default ServiceRecycleBin;