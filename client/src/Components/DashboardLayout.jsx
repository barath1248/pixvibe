import React from 'react';
import Sidebar from './Sidebar'; 
import '../styles/DashboardLayout.css'; 

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default DashboardLayout;
