import React from 'react';
import { Link } from 'react-router-dom';
function RecycleMenu(props) {
  return (
    <div>
      <div className="admin-menu">
        <h2>Recycle Menu</h2>
      </div>
      <div className="list-group">
        <Link to="/admin/recyclebin" className="list-group-item">Recycle Dashboard</Link>
        <Link to="/admin/recyclebin/customers" className="list-group-item">Customers Recyclebin</Link>
        <Link to="/admin/recyclebin/employees" className="list-group-item">Employees Recyclebin</Link>
        <Link to="/admin/recyclebin/devices" className="list-group-item">Devices Recyclebin</Link>
        <Link to="/admin/recyclebin/order" className="list-group-item">Orders Recyclebin</Link>
        <Link to="/admin/recyclebin/AdminService" className="list-group-item">Services Recyclebin</Link>
      </div>
    </div>
  );
}

export default RecycleMenu;