import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SidebarComponent from "../utils/SidebarComponent";
import { Table, Button, Spinner, Dropdown, Modal, TextInput, Label, Checkbox, Select } from "flowbite-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: '',
    is_confirmed: false,
    is_active: false
  });

  // Memoize fetchUsers
  const fetchUsers = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/users/manage?page=${page}&limit=10&status=${filterStatus}`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [filterStatus]);

  // Fetch users whenever currentPage or filterStatus changes
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, filterStatus, fetchUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      is_confirmed: user.is_confirmed,
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/users/manage/edit/${selectedUser._id}`, formData, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      setShowModal(false);
      fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="container mx-auto p-4">
        <div className='w-full flex justify-between items-center mb-4 bg-gray-100 p-2'>
          <h1 className="text-md font-bold">Manage all Users</h1>
          <Dropdown label="Filter by Status" dismissOnClick={false}>
            <Dropdown.Item onClick={() => handleFilterChange('')}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('active')}>Active</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange('inactive')}>Inactive</Dropdown.Item>
          </Dropdown>
        </div>
        
        <div className="w-full overflow-x-auto mb-4 lg:mb-0">
          <Table hoverable>
            <Table.Head>
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
                  <Table.Cell colSpan="9" className="text-center">
                    <Spinner aria-label="Loading users" size="xl" />
                  </Table.Cell>
                </Table.Row>
              ) : (
                users.map(user => (
                  <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
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
                      <Button size="xs" className="mr-2 mb-2" onClick={() => handleEditClick(user)}>
                        Edit
                      </Button>
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
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Edit User</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <Label htmlFor="firstName" value="First Name" />
              <TextInput
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="lastName" value="Last Name" />
              <TextInput
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="username" value="Username" />
              <TextInput
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phoneNumber" value="Phone Number" />
              <TextInput
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="role" value="Role" />
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="network-team">Network Team</option>
                <option value="software-team">Software Team</option>
                <option value="hardware-team">Hardware Team</option>
                <option value="administrator">Administrator</option>
              </Select>
            </div>
            <div className="mb-4">
              <Label className="mr-2" htmlFor="is_confirmed" value="Confirmed" />
              <Checkbox
                id="is_confirmed"
                name="is_confirmed"
                checked={formData.is_confirmed}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Label className="mr-2" htmlFor="is_active" value="Active" />
              <Checkbox
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageUsers;
