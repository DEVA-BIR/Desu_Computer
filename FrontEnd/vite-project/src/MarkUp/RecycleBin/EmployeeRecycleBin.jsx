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

const EmployeeRecycleBin = () => {
  const [employees, setEmployees] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState(null);

  const [successMsg, setSuccessMsg] =
    useState(null);

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
  // Prevents Unexpected token '<'
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
  // GET DELETED EMPLOYEES
  // =====================================================
  const fetchDeletedEmployees =
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
            `${API_URL}/api/employees/recycle-bin`,
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
              "Failed to load deleted employees"
          );
        }

        setEmployees(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } catch (error) {
        console.error(
          "GET DELETED EMPLOYEES ERROR:",
          error
        );

        setErrorMsg(
          error.message ||
            "Failed to load deleted employees"
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
      fetchDeletedEmployees();
    }
  }, [token]);

  // =====================================================
  // RESTORE EMPLOYEE
  // =====================================================
  const handleRestore =
    async (employeeId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to restore this employee?"
        );

      if (!confirmed) return;

      try {
        setErrorMsg(null);
        setSuccessMsg(null);

        const response =
          await fetch(
            `${API_URL}/api/employees/${employeeId}/restore`,
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
              "Failed to restore employee"
          );
        }

        // Remove restored employee
        // from recycle bin
        setEmployees((prev) =>
          prev.filter(
            (emp) =>
              emp.employee_id !==
              employeeId
          )
        );

        setSuccessMsg(
          data.message ||
            "Employee restored successfully"
        );

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } catch (error) {
        console.error(
          "RESTORE EMPLOYEE ERROR:",
          error
        );

        setErrorMsg(
          error.message ||
            "Failed to restore employee"
        );
      }
    };

  // =====================================================
  // PERMANENT DELETE
  // =====================================================
  const handlePermanentDelete =
    async (employeeId) => {
      const confirmed =
        window.confirm(
          "WARNING!\n\n" +
            "This will permanently delete the employee.\n\n" +
            "This action cannot be undone.\n\n" +
            "Are you sure you want to continue?"
        );

      if (!confirmed) return;

      try {
        setErrorMsg(null);
        setSuccessMsg(null);

        const response =
          await fetch(
            `${API_URL}/api/employees/${employeeId}/permanent`,
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
              "Failed to permanently delete employee"
          );
        }

        setEmployees((prev) =>
          prev.filter(
            (emp) =>
              emp.employee_id !==
              employeeId
          )
        );

        setSuccessMsg(
          data.message ||
            "Employee permanently deleted successfully"
        );

        setTimeout(() => {
          setSuccessMsg(null);
        }, 3000);
      } catch (error) {
        console.error(
          "PERMANENT DELETE EMPLOYEE ERROR:",
          error
        );

        setErrorMsg(
          error.message ||
            "Failed to permanently delete employee"
        );
      }
    };

  // =====================================================
  // SEARCH
  // =====================================================
  const filteredEmployees =
    employees.filter((emp) => {
      const search =
        searchTerm.toLowerCase();

      return (
        String(
          emp.employee_id || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.employee_first_name ||
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.employee_last_name || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.employee_email || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.employee_phone || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.company_role_name ||
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.added_date || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          emp.deleted_at || ""
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
      filteredEmployees.length /
        itemsPerPage
    )
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const currentEmployees =
    filteredEmployees.slice(
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
            Loading Employee Recycle Bin...
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
              🗑️ Employee Recycle Bin
            </h2>

            <p className="recycle-bin-count">
              Deleted Employees:{" "}
              {filteredEmployees.length}
            </p>
          </div>

          {/* SEARCH */}
          <div className="recycle-bin-search-wrapper">
            <FaSearch className="recycle-bin-search-icon" />

            <input
              type="text"
              className="recycle-bin-search"
              placeholder="Search deleted employees..."
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
                <th>Employee ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Added Date</th>
                <th>Role</th>
                <th>Deleted Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentEmployees.length >
              0 ? (
                currentEmployees.map(
                  (emp, index) => (
                    <tr
                      key={
                        emp.employee_id
                      }
                    >
                      <td>
                        {startIndex +
                          index +
                          1}
                      </td>

                      <td>
                        {
                          emp.employee_id
                        }
                      </td>

                      <td>
                        {
                          emp.employee_first_name
                        }
                      </td>

                      <td>
                        {
                          emp.employee_last_name
                        }
                      </td>

                      <td>
                        {
                          emp.employee_email
                        }
                      </td>

                      <td>
                        {
                          emp.employee_phone
                        }
                      </td>

                      <td>
                        {emp.added_date
                          ? format(
                              new Date(
                                emp.added_date
                              ),
                              "MM-dd-yyyy | kk:mm"
                            )
                          : "N/A"}
                      </td>

                      <td>
                        {
                          emp.company_role_name
                        }
                      </td>

                      <td>
                        {emp.deleted_at
                          ? format(
                              new Date(
                                emp.deleted_at
                              ),
                              "MM-dd-yyyy | kk:mm"
                            )
                          : "N/A"}
                      </td>

                      <td>
                        <div className="recycle-bin-actions">

                          {/* RESTORE */}
                          <button
                            type="button"
                            className="recycle-bin-action recycle-bin-restore"
                            title="Restore Employee"
                            onClick={() =>
                              handleRestore(
                                emp.employee_id
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
                                emp.employee_id
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
                    colSpan="10"
                    className="recycle-bin-empty"
                  >
                    🗑️ No deleted
                    employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* PAGINATION */}
        {filteredEmployees.length >
          0 && (
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

export default EmployeeRecycleBin;