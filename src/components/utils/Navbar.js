import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Dropdown, Modal } from 'flowbite-react';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi'; // Added logout icon
import AuthContext from '../../context/AuthContext';
import '../../styles/styles.css';

const NavbarComponent = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
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
          body: JSON.stringify({ userId: user._id })
        });
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
        return 'Platform';
    }
  };

  return (
    <>
      <Navbar fluid rounded className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <Navbar.Brand href="#" className="flex items-center">
            <span className="ml-2 self-center whitespace-nowrap text-2xl font-bold text-gray-800">
              ITDesk <span className="text-blue-600">- {getRoleText()}</span>
            </span>
          </Navbar.Brand>
          <Navbar.Toggle className="p-2 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <Navbar.Collapse className="mt-2 md:mt-0">
            {isAuthenticated ? (
              <>
                <Navbar.Link
                  as={Link}
                  to={location.pathname === '/dashboard' ? '/' : '/dashboard'}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  active
                >
                  {location.pathname === '/dashboard' ? 'Home' : 'Dashboard'}
                </Navbar.Link>
                <Navbar.Link className="relative">
                  <Dropdown
                    label={
                      <div className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <FiBell className="text-xl text-gray-700" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 h-4 w-4 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    }
                    arrowIcon={false}
                    inline
                    className="shadow-lg border border-gray-100 rounded-lg"
                  >
                    <Dropdown.Header className="px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-900">Notifications</span>
                    </Dropdown.Header>
                    <div className="w-72 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Dropdown.Item
                            key={notification._id}
                            className="flex flex-col items-start p-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item className="text-gray-500 p-3">No new notifications</Dropdown.Item>
                      )}
                    </div>
                  </Dropdown>
                </Navbar.Link>
                <Navbar.Link>
                  <Dropdown
                    label={
                      <div className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <FiUser className="text-xl text-gray-700" />
                        <span className="ml-2 hidden md:inline text-gray-700">{user?.username || 'Profile'}</span>
                      </div>
                    }
                    arrowIcon={false}
                    inline
                    className="shadow-lg border border-gray-100 rounded-lg"
                  >
                    <Dropdown.Item
                      as={Link}
                      to="/profile"
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FiUser className="mr-2" />
                      View Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={logout}
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200 text-red-600"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown>
                </Navbar.Link>
              </>
            ) : (
              <>
                <Navbar.Link as={Link} to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" active>
                  Home
                </Navbar.Link>
                <Navbar.Link as={Link} to="/incident" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" active>
                  Incident
                </Navbar.Link>
                <Navbar.Link as={Link} to="/register" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Register
                </Navbar.Link>
                <Navbar.Link as={Link} to="/login" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Login
                </Navbar.Link>
              </>
            )}
          </Navbar.Collapse>
        </div>
      </Navbar>

      {/* Modal for Notification Details */}
      <Modal show={isModalOpen} onClose={handleCloseModal} className="rounded-lg">
        <Modal.Header className="border-b border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900">{selectedNotification?.title || 'Notification Details'}</h3>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedNotification?.banner ? (
            <img
              src={`https://itdesk-backend.vercel.app/${selectedNotification.banner}`}
              alt={selectedNotification.title}
              className="w-full h-48 object-cover mb-4 rounded-md"
            />
          ) : (
            <img
              src="https://itdesk-backend.vercel.app/uploads/banners/1722262677123_Screen Shot 2024-07-26 at 15.01.52 PM.png"
              alt="Placeholder"
              className="w-full h-48 object-cover mb-4 rounded-md"
            />
          )}
          <p className="text-gray-700 mb-4">{selectedNotification?.message || 'No message available'}</p>
          <p className="text-xs text-gray-500">{selectedNotification?.createdAt ? formatDate(selectedNotification.createdAt) : 'No date available'}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavbarComponent;
