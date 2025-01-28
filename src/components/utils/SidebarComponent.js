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
    <Sidebar className="h-full">
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem href="/dashboard" icon={FaHome}>
            Dashboard
          </SidebarItem>
          <SidebarItem href="/tickets" icon={FaUsers}>
            Tickets
          </SidebarItem>
          <SidebarItem href="/assets" icon={FaCogs}>
            Assets
          </SidebarItem>
          {user && (user.role === 'staff' || user.role === 'administrator') && (
            <SidebarItem href="/announcements" icon={FaBullhorn}>
              Announcements
            </SidebarItem>
          )}
          <SidebarItem href="/articles" icon={FaBook}>
            Articles
          </SidebarItem>
          {user && (user.role === 'staff' || user.role === 'administrator') && (
            <SidebarItem href="/users" icon={FaUser}>
              Users
            </SidebarItem>
          )}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
};

export default SidebarComponent;
