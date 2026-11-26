import React, { useEffect, useState } from "react";
//import "./RecycleBin.css";

const API_URL = import.meta.env.VITE_API_URL;

function RecycleBin() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // PAGINATION STATE
  // =====================================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =====================================================
  // GET RECYCLE BIN ORDERS
  // =====================================================
  const fetchRecycleBinOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/order/recycle-bin`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to load recycle bin orders."
        );
      }

      const ordersData = data?.data || [];

      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error(
        "FETCH RECYCLE BIN ORDERS ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to load recycle bin orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ORDERS
  // =====================================================
  useEffect(() => {
    fetchRecycleBinOrders();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================
  useEffect(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    if (!search) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const orderId = String(
        order.order_id || ""
      ).toLowerCase();

      const customerName =
        `${order.customer_first_name || ""} ${
          order.customer_last_name || ""
        }`.toLowerCase();

      const employeeName =
        `${order.employee_first_name || ""} ${
          order.employee_last_name || ""
        }`.toLowerCase();

      const deviceName =
        `${order.device_make || ""} ${
          order.device_model || ""
        } ${
          order.device_brand || ""
        }`.toLowerCase();

      const email = String(
        order.customer_email || ""
      ).toLowerCase();

      const phone = String(
        order.customer_phone_number || ""
      ).toLowerCase();

      return (
        orderId.includes(search) ||
        customerName.includes(search) ||
        employeeName.includes(search) ||
        deviceName.includes(search) ||
        email.includes(search) ||
        phone.includes(search)
      );
    });

    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  // =====================================================
  // RESET PAGINATION WHEN SEARCH CHANGES
  // =====================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // =====================================================
  // PAGINATION
  // =====================================================
  const totalPages = Math.ceil(
    filteredOrders.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =====================================================
  // RESTORE ORDER
  // =====================================================
  const handleRestore = async (orderId) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore Order #${orderId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/order/${orderId}/restore`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to restore order."
        );
      }

      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) =>
            Number(order.order_id) !==
            Number(orderId)
        )
      );

      alert(
        data?.message ||
          "Order restored successfully."
      );
    } catch (error) {
      console.error(
        "RESTORE ORDER ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to restore order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // PERMANENT DELETE
  // =====================================================
  const handlePermanentDelete = async (
    orderId
  ) => {
    const confirmed = window.confirm(
      `WARNING!\n\nOrder #${orderId} will be permanently deleted and cannot be recovered.\n\nAre you sure you want to continue?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/order/${orderId}/permanent`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to permanently delete order."
        );
      }

      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) =>
            Number(order.order_id) !==
            Number(orderId)
        )
      );

      alert(
        data?.message ||
          "Order permanently deleted."
      );
    } catch (error) {
      console.error(
        "PERMANENT DELETE ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to permanently delete order."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================
  const formatPrice = (price) => {
    const amount = Number(price || 0);

    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="recycle-bin-page">
        <div className="recycle-bin-header">
          <div>
            <h1>Recycle Bin</h1>
            <p>Manage deleted orders</p>
          </div>
        </div>

        <div className="recycle-loading">
          <div className="recycle-spinner"></div>

          <p>
            Loading recycle bin...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <div className="recycle-bin-page">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="recycle-bin-header">

        <div className="recycle-title">

          <div className="recycle-icon">
            🗑️
          </div>

          <div>
            <h1>
              Recycle Bin
            </h1>

            <p>
              Deleted orders can be restored or
              permanently removed.
            </p>
          </div>

        </div>

        <div className="recycle-count">

          <span>
            {orders.length}
          </span>

          <small>
            Deleted Orders
          </small>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}
      {error && (
        <div className="recycle-error">
          {error}
        </div>
      )}

      {/* =================================================
          SEARCH
      ================================================= */}
      <div className="recycle-toolbar">

        <div className="recycle-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search deleted orders..."
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
          className="refresh-btn"
          onClick={fetchRecycleBinOrders}
          disabled={
            loading ||
            actionLoading
          }
        >
          ↻ Refresh
        </button>

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}
      {filteredOrders.length === 0 ? (

        <div className="recycle-empty">

          <div className="empty-icon">
            🗑️
          </div>

          {searchTerm ? (
            <>
              <h2>
                No orders found
              </h2>

              <p>
                No deleted orders match
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
              <h2>
                Recycle Bin is Empty
              </h2>

              <p>
                There are currently no deleted
                orders.
              </p>
            </>
          )}

        </div>

      ) : (

        <>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}
          <div className="recycle-table-container">

            <table className="recycle-table">

              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Employee</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {currentOrders.map((order) => (

                  <tr
                    key={order.order_id}
                  >

                    <td>
                      <div className="order-number">
                        #{order.order_id}
                      </div>
                    </td>

                    <td>
                      <div className="customer-info">

                        <strong>
                          {order.customer_first_name || ""}
                          {" "}
                          {order.customer_last_name || ""}
                        </strong>

                        <small>
                          {order.customer_email || "-"}
                        </small>

                        <small>
                          {order.customer_phone_number || "-"}
                        </small>

                      </div>
                    </td>

                    <td>
                      <div className="device-info">

                        <strong>
                          {order.device_make || ""}
                          {" "}
                          {order.device_model || ""}
                        </strong>

                        <small>
                          {order.device_brand || ""}
                        </small>

                        {order.device_year && (
                          <small>
                            {order.device_year}
                          </small>
                        )}

                      </div>
                    </td>

                    <td>
                      {order.employee_first_name || ""}
                      {" "}
                      {order.employee_last_name || ""}
                    </td>

                    <td>

                      <strong>
                        {formatPrice(
                          order.order_total_price
                        )}
                      </strong>

                      <small>
                        ETB
                      </small>

                    </td>

                    <td>
                      <span className="status-badge">
                        {order.order_status ||
                          "Unknown"}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        order.order_date
                      )}
                    </td>

                    <td>

                      <div className="order-actions">

                        <button
                          type="button"
                          className="restore-btn"
                          onClick={() =>
                            handleRestore(
                              order.order_id
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          title="Restore order"
                        >
                          ↩ Restore
                        </button>

                        <button
                          type="button"
                          className="permanent-delete-btn"
                          onClick={() =>
                            handlePermanentDelete(
                              order.order_id
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          title="Permanently delete order"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}
          <div className="recycle-mobile-list">

            {currentOrders.map((order) => (

              <div
                className="recycle-card"
                key={order.order_id}
              >

                <div className="recycle-card-header">

                  <div>

                    <span className="card-label">
                      ORDER
                    </span>

                    <h3>
                      #{order.order_id}
                    </h3>

                  </div>

                  <span className="status-badge">
                    {order.order_status ||
                      "Unknown"}
                  </span>

                </div>

                <div className="recycle-card-body">

                  <div className="card-row">
                    <span>Customer</span>

                    <strong>
                      {order.customer_first_name || ""}
                      {" "}
                      {order.customer_last_name || ""}
                    </strong>
                  </div>

                  <div className="card-row">
                    <span>Device</span>

                    <strong>
                      {order.device_make || ""}
                      {" "}
                      {order.device_model || ""}
                    </strong>
                  </div>

                  <div className="card-row">
                    <span>Employee</span>

                    <strong>
                      {order.employee_first_name || ""}
                      {" "}
                      {order.employee_last_name || ""}
                    </strong>
                  </div>

                  <div className="card-row">
                    <span>Total</span>

                    <strong>
                      {formatPrice(
                        order.order_total_price
                      )}{" "}
                      ETB
                    </strong>
                  </div>

                  <div className="card-row">
                    <span>Order Date</span>

                    <strong>
                      {formatDate(
                        order.order_date
                      )}
                    </strong>
                  </div>

                </div>

                <div className="recycle-card-actions">

                  <button
                    type="button"
                    className="restore-btn"
                    onClick={() =>
                      handleRestore(
                        order.order_id
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    ↩ Restore
                  </button>

                  <button
                    type="button"
                    className="permanent-delete-btn"
                    onClick={() =>
                      handlePermanentDelete(
                        order.order_id
                      )
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    Delete Permanently
                  </button>

                </div>

              </div>

            ))}

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}
          {filteredOrders.length > 0 && (
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

    </div>
  );
}

export default RecycleBin;