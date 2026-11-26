import React from "react";
import AdminMenu from "./AdminMenu";
import ManagerMenu from "./ManagerMenu";
import EmployeeMenu from "./EmployeeMenu";

function SidebarMenu() {
  const employee = JSON.parse(localStorage.getItem("employee"));

  if (!employee) return null;

  // Change this according to your employee object
  const role = employee.employee_role;

  switch (role) {
    case 3:
      return <AdminMenu />;

    case 2:
      return <ManagerMenu />;

    case 1:
      return <EmployeeMenu />;

    default:
      return <AdminMenu />;
  }
}

export default SidebarMenu;