import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, NavbarCollapse, NavbarLink, NavbarToggle, Dropdown, Modal } from 'flowbite-react';
import { FiBell, FiUser } from 'react-icons/fi'; // Import the user icon
import AuthContext from '../../context/AuthContext';

const NavbarComponent = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext); // Get userId from context
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !user._id) return; // Skip fetching if userId is not available

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`https://itdesk-backend.vercel.app/api/notifications?userId=${user._id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Notifications:', data);

          // Filter notifications for today's date
          const today = new Date();
          const filteredNotifications = data.filter(notification => {
            const notificationDate = new Date(notification.createdAt);
            return (
              notificationDate.getFullYear() === today.getFullYear() &&
              notificationDate.getMonth() === today.getMonth() &&
              notificationDate.getDate() === today.getDate()
            );
          });

          setNotifications(filteredNotifications);

          // Calculate unread count
          const unreadCount = filteredNotifications.filter(notification => !notification.viewedBy.includes(user._id)).length;
          setUnreadCount(unreadCount);
        } else {
          console.error('Failed to fetch notifications:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/notifications?userId=${user._id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications:', data);

        // Filter notifications for today's date
        const today = new Date();
        const filteredNotifications = data.filter(notification => {
          const notificationDate = new Date(notification.createdAt);
          return (
            notificationDate.getFullYear() === today.getFullYear() &&
            notificationDate.getMonth() === today.getMonth() &&
            notificationDate.getDate() === today.getDate()
          );
        });

        setNotifications(filteredNotifications);

        // Calculate unread count
        const unreadCount = filteredNotifications.filter(notification => !notification.viewedBy.includes(user._id)).length;
        setUnreadCount(unreadCount);
      } else {
        console.error('Failed to fetch notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (user && !notification.viewedBy.includes(user._id)) {
      try {
        await fetch(`https://itdesk-backend.vercel.app/api/notifications/${notification._id}/view`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }) // Send the user ID to the server
        });

        // Fetch notifications again to update state
        await fetchNotifications();
      } catch (error) {
        console.error('Error marking notification as viewed:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const getRoleText = () => {
    switch (user?.role) {
      case 'administrator':
        return 'Administrator';
      case 'staff':
        return 'Staff';
      case 'software-team':
        return 'Software Team';
      case 'hardware-team':
        return 'Hardware Team';
      case 'network-team':
        return 'Network Team';
      default:
        return 'IT Service HelpDesk';
    }
  };

  return (
    <>
      <Navbar fluid rounded>
        <Navbar.Brand href="#">
          <img src="https://flowbite-react.com/favicon.svg" className="mr-6 h-9 sm:h-9" alt="Flowbite React Logo" />
          <span className="ml-2 self-center whitespace-nowrap text-xl font-semibold dark:text-white">IT Service HelpDesk - {getRoleText()}</span>
        </Navbar.Brand>
        <NavbarToggle />
        <NavbarCollapse>
          {isAuthenticated ? (
            <>
              <NavbarLink as={Link} to={location.pathname === '/dashboard' ? '/' : '/dashboard'} active>
                {location.pathname === '/dashboard' ? 'Home' : 'Dashboard'}
              </NavbarLink>
              <NavbarLink className="relative">
                <Dropdown
                  label={
                    <div className="relative">
                      <FiBell className="text-xl" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 left-3 h-4 w-4 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  }
                  arrowIcon={false}
                  inline
                >
                  <Dropdown.Header>
                    <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <div className="w-72 text-sm text-gray-500 dark:text-gray-400">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Dropdown.Item
                          key={notification._id}
                          className='flex flex-col items-start border-b cursor-pointer'
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <p className='text-sm font-bold'>{notification.title}</p>
                          <p className='text-xs text-gray-500'>{formatDate(notification.createdAt)}</p>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item>No new notifications</Dropdown.Item>
                    )}
                  </div>
                </Dropdown>
              </NavbarLink>
              <NavbarLink>
                <Dropdown
                  label={
                    <div className="flex items-center">
                      <FiUser className="text-xl" />
                      <span className="ml-2 hidden md:inline">{user?.username || 'Profile'}</span>
                    </div>
                  }
                  arrowIcon={false}
                  inline
                >
                  <Dropdown.Item as={Link} to="/profile">
                    View Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={logout}>
                    Logout
                  </Dropdown.Item>
                </Dropdown>
              </NavbarLink>
            </>
          ) : (
            <>
              <NavbarLink as={Link} to="/" active>
                Home
              </NavbarLink>
              <NavbarLink as={Link} to="/incident" active>
               Incident
              </NavbarLink>
              <NavbarLink as={Link} to="/register">
                Register
              </NavbarLink>
              <NavbarLink as={Link} to="/login">
                Login
              </NavbarLink>
            </>
          )}
        </NavbarCollapse>
      </Navbar>

      {/* Modal for Notification Details */}
      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <Modal.Header>{selectedNotification?.title || 'Notification Details'}</Modal.Header>
        <Modal.Body>
          {selectedNotification?.banner ? (
            <img
              src={`https://itdesk-backend.vercel.app/${selectedNotification.banner}`}
              alt={selectedNotification.title}
              className="w-full h-48 object-cover mb-2 rounded-md"
            />
          ) : (
            <img
              src="https://itdesk-backend.vercel.app/uploads/banners/1722262677123_Screen Shot 2024-07-26 at 15.01.52 PM.png"
              alt="Placeholder"
              className="w-full h-48 object-cover mb-2 rounded-md"
            />
          )}
          <p className='mb-2'>{selectedNotification?.message || 'No message available'}</p>
          <p className="text-xs text-gray-500">{selectedNotification?.createdAt ? formatDate(selectedNotification.createdAt) : 'No date available'}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavbarComponent;
