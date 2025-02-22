import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarComponent from "../utils/SidebarComponent";
import { Table, Button, Spinner, Toast, Modal } from "flowbite-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [confirmedUsers, setConfirmedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers(currentPage);
    fetchConfirmedUsers();
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/users?page=${page}&limit=7`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      console.log('Users:', res); // Debug log for users
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchConfirmedUsers = async () => {
    try {
      const res = await axios.get('https://itdesk-backend.vercel.app/api/users/confirmed', {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      console.log('Confirmed Users:', res); // Debug log for confirmed users
      setConfirmedUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleConfirm = async (id, action) => {
    try {
      const endpoint = action === 'accept' ? `/confirm/${id}` : `/decline/${id}`;
      await axios.put(`https://itdesk-backend.vercel.app/api/users${endpoint}`, {}, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setToast({ show: true, message: `User ${action === 'accept' ? 'confirmed' : 'declined'} successfully` });
      fetchUsers(currentPage);
      fetchConfirmedUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="container mx-auto p-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-3/4 overflow-x-auto mb-4 lg:mb-0">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>ID Number</Table.HeadCell>
              <Table.HeadCell>First Name</Table.HeadCell>
              <Table.HeadCell>Last Name</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone Number</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Confirmed</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan="8" className="text-center">
                    <Spinner aria-label="Loading users" size="xl" />
                  </Table.Cell>
                </Table.Row>
              ) : (
                users.map(user => (
                  <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.idNumber}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.firstName}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.lastName}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.phoneNumber}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.role}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.is_confirmed ? 'Yes' : 'No'}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {user.is_active ? 'Yes' : 'No'}
                    </Table.Cell>
                    <Table.Cell>
                      {!user.is_confirmed && (
                        <>
                          <Button
                            size="xs"
                            onClick={() => handleConfirm(user._id, 'accept')}
                            className="mr-2 mb-2"
                          >
                            Accept
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleConfirm(user._id, 'decline')}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="w-full lg:w-1/4 lg:ml-4">
          <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">List of Users</h5>
        <a href="/users/manage/all" className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500">
          Manage users
        </a>
      </div>
            {confirmedUsers && confirmedUsers.length > 0 ? (
              confirmedUsers.map(user => (
                <div key={user._id} className="mb-2 cursor-pointer" onClick={() => handleUserClick(user)}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white hover:underline">{user.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No confirmed users</p>
            )}
          </div>
        </div>
      </div>
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 4.707a1 1 0 00-1.414-1.414L7 11.586 4.707 9.293a1 1 0 00-1.414 1.414l3 3a 1 1 0 001.414 0l9-9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Check icon</span>
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <Toast.Toggle onClick={() => setToast({ ...toast, show: false })} />
          </Toast>
        </div>
      )}
      {selectedUser && (
        <Modal show={showModal} size="sm" onClose={() => setShowModal(false)}>
          <Modal.Header>
            User Info
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p><strong>First Name:</strong> {selectedUser.firstName}</p>
              <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
              <p><strong>Username:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Confirmed:</strong> {selectedUser.is_confirmed ? 'Yes' : 'No'}</p>
              <p><strong>Active:</strong> {selectedUser.is_active ? 'Yes' : 'No'}</p>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Users;
