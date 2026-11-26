import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTools,
  FaUserTie,
  FaClipboardList,
  FaLaptop,
  FaDesktop,
} from "react-icons/fa";

const RecycleDashboardBody = () => {
  const navigate = useNavigate();

  const cards = [
    {
      small: "Restore Employee",
      title: "Employees Recyclebin",
      link: "Recycle Employees +",
      path: "/admin/recyclebin/employees",
      icon: <FaUserTie />,
    },
    {
      small: "Restore Customer",
      title: "Customers Recyclebin",
      link: "Recycle Customers +",
      path: "/admin/recyclebin/customers",
      icon: <FaClipboardList />,
    },
    {
      small: "Restore Device",
      title: "Devices Recyclebin",
      link: "Recycle Devices +",
      path: "/admin/recyclebin/devices",
      icon: <FaDesktop />,
    },
    {
      small: "Restore Order",
      title: "Orders Recyclebin",
      link: "Recycle Orders +",
      path: "/admin/recyclebin/order",
      icon: <FaLaptop />,
    },
    {
      small: "Restore Service",
      title: "Services Recyclebin",
      link: "Recycle Services +",
      path: "/admin/recyclebin/AdminService",
      icon: <FaTools />,
    },
  ];

  return (
    <div className="dashboard-body">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Recycle Dashboard</h1>

          <p>
            Welcome to the Recycle Dashboard! Here, you can manage and restore
            deleted items such as employees, customers, devices, orders, and
            services. Use the cards below to navigate to the respective recycle
            bins and restore any items you wish to recover.
          </p>
        </div>

        {/* Cards */}
        <div className="dashboard-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => {

  navigate(card.path);
}}
              style={{ cursor: "pointer" }}
            >
              
              <div>
                <small>{card.small}</small>
                <h3>{card.title}</h3>
                <span>{card.link}</span>
              </div>

              <div className="card-icon">
                {card.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecycleDashboardBody;