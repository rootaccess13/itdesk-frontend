import React, { useContext, useState } from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarItems,
  SidebarItemGroup,
} from 'flowbite-react';
import AuthContext from '../../context/AuthContext';
import { FaHome, FaUsers, FaCogs, FaBullhorn, FaBook, FaUser, FaBars, FaTimes } from "react-icons/fa";

const SidebarComponent = () => {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 text-white bg-gray-800 rounded-lg sm:hidden"
      >
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <Sidebar
        className={`h-full w-16 sm:w-64 lg:w-72 bg-gray-800 text-white fixed sm:relative transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <SidebarItems className="space-y-2">
          <SidebarItemGroup>
            <SidebarItem
              href="/dashboard"
              icon={FaHome}
              className="flex sm:flex-row sm:space-x-2 sm:py-2 sm:px-4 sm:w-auto w-12 justify-center"
            >
              <span className="sm:inline hidden">Dashboard</span>
            </SidebarItem>

            <SidebarItem
              href="/tickets"
              icon={FaUsers}
              className="flex sm:flex-row sm:space-x-2 sm:py-2 sm:px-4 sm:w-auto w-12 justify-center"
            >
              <span className="sm:inline hidden">Tickets</span>
            </SidebarItem>

            <SidebarItem
              href="/assets"
              icon={FaCogs}
              className="flex sm:flex-row sm:space-x-2 sm:py-2 sm:px-4 sm:w-auto w-12 justify-center"
            >
              <span className="sm:inline hidden">Assets</span>
            </SidebarItem>

            {user && (user.role === 'staff' || user.role === 'administrator') && (
              <SidebarItem
                href="/announcements"
                icon={FaBullhorn}
                className="flex sm:flex-row sm:space-x-2 sm:py-2 sm:px-4 sm:w-auto w-12 justify-center"
              >
                <span className="sm:inline hidden">Announcements</span>
              </SidebarItem>
            )}

            <SidebarItem
              href="/articles"
              icon={FaBook}
              className="flex sm:flex-row sm:space-x-2 sm:py-2 sm:px-4 sm:w-auto w-12 justify-center"
            >
              <span className="sm:inline hidden">Articles</span>
            </SidebarItem>

            {user && (user.role === 'staff' || user.role === 'administrator') && (
              <SidebarItem
                href="/users"
                icon={FaUser}
                className="flex sm:flex-row sm:space-x-2 sm:py-2 sm:px-4 sm:w-auto w-12 justify-center"
              >
                <span className="sm:inline hidden">Users</span>
              </SidebarItem>
            )}
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default SidebarComponent;
