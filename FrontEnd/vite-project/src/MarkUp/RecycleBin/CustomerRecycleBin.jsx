import React, {
  useEffect,
  useState,
} from "react";

import { Table } from "react-bootstrap";
import { format } from "date-fns";

import {
  FaTrashRestore,
  FaTrash,
  FaSearch,
} from "react-icons/fa";

import { useAuth } from "../../Context/AuthContxt";

const CustomerRecycleBin = () => {
  const [customers, setCustomers] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState(null);

  const [successMsg, setSuccessMsg] =
    useState(null);

  // =====================================================
  // PAGINATION
  // =====================================================
  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  const { employee } = useAuth();

  const token =
    employee?.employee_token || null;

  const API_URL =
    import.meta.env.VITE_API_URL;

  // =====================================================
  // SAFE JSON RESPONSE
  // =====================================================
  const getResponseData = async (
    response
  ) => {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "application/json"
      )
    ) {
      const text =
        await response.text();

      throw new Error(
        `Server returned ${
          response.status
        } instead of JSON. ${
          text.slice(0, 100)
        }`
      );
    }

    return await response.json();
  };

  // =====================================================
  // GET DELETED CUSTOMERS
  // =====================================================
  const fetchDeletedCustomers =
    async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        if (!token) {
          throw new Error(
            "Authentication token is missing"
          );
        }

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL is not configured"
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/customers/recycle-bin`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
                "x-access-token":
                  token,
              },
            }
          );

        const data =
          await getResponseData(
            response
          );

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load deleted customers"
          );
        }

        setCustomers(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } catch (error) {
        console.error(
          "GET DELETED CUSTOMERS ERROR:",
          error
        );

        setErrorMsg(
          error.message ||
            "Failed to load deleted customers"
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    if (token) {
      fetchDeletedCustomers();
    }
  }, [token]);

  // =====================================================
  // RESTORE CUSTOMER
  // =====================================================
  const handleRestore =
    async (customerId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to restore this customer?"
        );

      if (!confirmed) return;

      try {
        setErrorMsg(null);
        setSuccessMsg(null);

        const response =
          await fetch(
            `${API_URL}/api/customers/${customerId}/restore`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
                "x-access-token":
                  token,
              },
            }
          );

        const data =
          await getResponseData(
            response
          );

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to restore customer"
          );
        }

        // Remove restored customer
        // from recycle bin
        setCustomers((prev) =>
          prev.filter(
            (customer) =>
              customer.customer_id !==
              customerId
          )
        );

        setSuccessMsg(
          data.message ||
            "Customer restored successfully"
        );

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } catch (error) {
        console.error(
          "RESTORE CUSTOMER ERROR:",
          error
        );

        setErrorMsg(
          error.message ||
            "Failed to restore customer"
        );
      }
    };

  // =====================================================
  // PERMANENT DELETE
  // =====================================================
  const handlePermanentDelete =
    async (customerId) => {
      const confirmed =
        window.confirm(
          "WARNING!\n\n" +
            "This will permanently delete the customer.\n\n" +
            "This action cannot be undone.\n\n" +
            "Are you sure you want to continue?"
        );

      if (!confirmed) return;

      try {
        setErrorMsg(null);
        setSuccessMsg(null);

        const response =
          await fetch(
            `${API_URL}/api/customers/${customerId}/permanent`,
            {
              method: "DELETE",
              headers: {
                "Content-Type":
                  "application/json",
                "x-access-token":
                  token,
              },
            }
          );

        const data =
          await getResponseData(
            response
          );

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to permanently delete customer"
          );
        }

        setCustomers((prev) =>
          prev.filter(
            (customer) =>
              customer.customer_id !==
              customerId
          )
        );

        setSuccessMsg(
          data.message ||
            "Customer permanently deleted successfully"
        );

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } catch (error) {
        console.error(
          "PERMANENT DELETE CUSTOMER ERROR:",
          error
        );

        setErrorMsg(
          error.message ||
            "Failed to permanently delete customer"
        );
      }
    };

  // =====================================================
  // SEARCH
  // =====================================================
  const filteredCustomers =
    customers.filter((customer) => {
      const search =
        searchTerm.toLowerCase();

      return (
        String(
          customer.customer_id || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          customer.customer_first_name ||
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          customer.customer_last_name ||
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          customer.customer_email || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          customer.customer_phone_number ||
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          customer.customer_added_date ||
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          customer.deleted_at || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });

  // =====================================================
  // RESET PAGE ON SEARCH
  // =====================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // =====================================================
  // PAGINATION
  // =====================================================
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentCustomers =
    filteredCustomers.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <section className="recycle-bin">
        <div className="recycle-bin-container">
          <h2>
            Loading Customer Recycle Bin...
          </h2>
        </div>
      </section>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <section className="recycle-bin">
      <div className="recycle-bin-container">

        {/* HEADER */}
        <div className="recycle-bin-header">

          <div className="recycle-bin-title">
            <h2>
              🗑️ Customer Recycle Bin
            </h2>

            <p className="recycle-bin-count">
              Deleted Customers:{" "}
              {filteredCustomers.length}
            </p>
          </div>

          {/* SEARCH */}
          <div className="recycle-bin-search-wrapper">

            <FaSearch className="recycle-bin-search-icon" />

            <input
              type="text"
              className="recycle-bin-search"
              placeholder="Search deleted customers..."
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
                <th>Customer ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Added Date</th>
                <th>Deleted Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {currentCustomers.length >
              0 ? (

                currentCustomers.map(
                  (customer, index) => (

                    <tr
                      key={
                        customer.customer_id
                      }
                    >

                      {/* NUMBER */}
                      <td>
                        {startIndex +
                          index +
                          1}
                      </td>

                      {/* CUSTOMER ID */}
                      <td>
                        {
                          customer.customer_id
                        }
                      </td>

                      {/* FIRST NAME */}
                      <td>
                        {
                          customer.customer_first_name
                        }
                      </td>

                      {/* LAST NAME */}
                      <td>
                        {
                          customer.customer_last_name
                        }
                      </td>

                      {/* EMAIL */}
                      <td>
                        {
                          customer.customer_email
                        }
                      </td>

                      {/* PHONE */}
                      <td>
                        {
                          customer.customer_phone_number
                        }
                      </td>

                      {/* ADDED DATE */}
                      <td>
                        {customer.customer_added_date
                          ? format(
                              new Date(
                                customer.customer_added_date
                              ),
                              "MM-dd-yyyy | kk:mm"
                            )
                          : "N/A"}
                      </td>

                      {/* DELETED DATE */}
                      <td>
                        {customer.deleted_at
                          ? format(
                              new Date(
                                customer.deleted_at
                              ),
                              "MM-dd-yyyy | kk:mm"
                            )
                          : "N/A"}
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="recycle-bin-actions">

                          {/* RESTORE */}
                          <button
                            type="button"
                            className="recycle-bin-action recycle-bin-restore"
                            title="Restore Customer"
                            onClick={() =>
                              handleRestore(
                                customer.customer_id
                              )
                            }
                          >
                            <FaTrashRestore />
                          </button>

                          {/* PERMANENT DELETE */}
                          <button
                            type="button"
                            className="recycle-bin-action recycle-bin-permanent-delete"
                            title="Delete Permanently"
                            onClick={() =>
                              handlePermanentDelete(
                                customer.customer_id
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
                    colSpan="9"
                    className="recycle-bin-empty"
                  >
                    🗑️ No deleted
                    customers found.
                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </div>

        {/* =====================================================
            PAGINATION
        ====================================================== */}
        {filteredCustomers.length >
          0 && (

          <div className="pagination">

            {/* FIRST */}
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

            {/* PREVIOUS */}
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

            {/* PAGE INFO */}
            <span className="recycle-bin-page-info">
              Page {currentPage} of{" "}
              {totalPages}
            </span>

            {/* NEXT */}
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

            {/* LAST */}
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

export default CustomerRecycleBin;