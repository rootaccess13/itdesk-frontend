import React, { useContext } from 'react';
import {
  Sidebar,
  SidebarItem,
  SidebarItems,
  SidebarItemGroup,
} from 'flowbite-react';
import AuthContext from '../../context/AuthContext';
import { 
  HiOutlineHome,
  HiOutlineTicket,
  HiOutlineCog,
  HiOutlineSpeakerphone,
  HiOutlineBookOpen,
  HiOutlineUsers
} from 'react-icons/hi';

const SidebarComponent = () => {
  const { user } = useContext(AuthContext);

  return (
    <Sidebar 
      className="fixed top-0 left-0 h-screen w-16 md:w-64 bg-gray-800 text-white transition-all duration-300 z-10"
      aria-label="Main navigation"
    >
      <SidebarItems className="pt-6">
        <SidebarItemGroup className="space-y-2">
          <SidebarItem
            href="/dashboard"
            icon={HiOutlineHome}
            className="flex items-center md:space-x-3 py-3 px-4 hover:bg-gray-700 transition-colors duration-200 text-gray-200 hover:text-white"
          >
            <span className="hidden md:inline text-sm font-medium">Dashboard</span>
          </SidebarItem>

          <SidebarItem
            href="/tickets"
            icon={HiOutlineTicket}
            className="flex items-center md:space-x-3 py-3 px-4 hover:bg-gray-700 transition-colors duration-200 text-gray-200 hover:text-white"
          >
            <span className="hidden md:inline text-sm font-medium">Tickets</span>
          </SidebarItem>

          <SidebarItem
            href="/assets"
            icon={HiOutlineCog}
            className="flex items-center md:space-x-3 py-3 px-4 hover:bg-gray-700 transition-colors duration-200 text-gray-200 hover:text-white"
          >
            <span className="hidden md:inline text-sm font-medium">Assets</span>
          </SidebarItem>

          {user && (user.role === 'staff' || user.role === 'administrator') && (
            <SidebarItem
              href="/announcements"
              icon={HiOutlineSpeakerphone}
              className="flex items-center md:space-x-3 py-3 px-4 hover:bg-gray-700 transition-colors duration-200 text-gray-200 hover:text-white"
            >
              <span className="hidden md:inline text-sm font-medium">Announcements</span>
            </SidebarItem>
          )}

          <SidebarItem
            href="/articles"
            icon={HiOutlineBookOpen}
            className="flex items-center md:space-x-3 py-3 px-4 hover:bg-gray-700 transition-colors duration-200 text-gray-200 hover:text-white"
          >
            <span className="hidden md:inline text-sm font-medium">Articles</span>
          </SidebarItem>

          {user && (user.role === 'staff' || user.role === 'administrator') && (
            <SidebarItem
              href="/users"
              icon={HiOutlineUsers}
              className="flex items-center md:space-x-3 py-3 px-4 hover:bg-gray-700 transition-colors duration-200 text-gray-200 hover:text-white"
            >
              <span className="hidden md:inline text-sm font-medium">Users</span>
            </SidebarItem>
          )}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};

export default SidebarComponent;
