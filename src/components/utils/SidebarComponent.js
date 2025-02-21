import React, { useContext } from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarItems,
  SidebarItemGroup,
} from 'flowbite-react';
import AuthContext from '../../context/AuthContext';
import { FaHome, FaUsers, FaCogs, FaBullhorn, FaBook, FaUser } from "react-icons/fa";

const SidebarComponent = () => {
  const { user } = useContext(AuthContext);

  return (
    <Sidebar className="h-full w-16 sm:w-64 lg:w-72 bg-gray-800 text-white">
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
  );
};

export default SidebarComponent;
