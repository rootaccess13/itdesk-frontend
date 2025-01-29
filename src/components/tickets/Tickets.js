import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Modal from '../modals/ticketModal';
import TakeActionModal from '../utils/TakeActionModal'; // Import the new modal
import SidebarComponent from '../utils/SidebarComponent';
import { Spinner, Dropdown, Button, Toast } from 'flowbite-react';
import AuthContext from '../../context/AuthContext';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTakeActionModal, setShowTakeActionModal] = useState(false); // State for the new modal
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('Open');
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    status: 'Open',
    priority: 'Low',
    type: 'Support',
    severityLevel: 'Minor',
    assignedTo: '',
    escalationLevel: '',
    dueDate: '',
    attachments: [],
    comment: '' // Add comment to the formData
  });
  const [selectedTicketId, setSelectedTicketId] = useState(null); // State for the selected ticket ID
  const [toast, setToast] = useState({ show: false, message: '' });

  const { user } = useContext(AuthContext); // Get the current user from AuthContext

  console.log('Current Filter Status:', filterStatus); // Logging

  // Memoize fetchTickets using useCallback to avoid the warning
  const fetchTickets = useCallback(async (page) => {
    setLoading(true);
    try {
      console.log(`Fetching tickets: page=${page}, filterStatus=${filterStatus}, escalationLevel=${user.role}`); // Debugging
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets`, {
        params: {
          page: page,
          limit: 6,
          status: filterStatus,
          escalationLevel: user.role
        },
        headers: { Authorization: localStorage.getItem('token') }
      });
      console.log(res);
      setTickets(res.data.tickets);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, user.role]); // Include filterStatus and user.role as dependencies

  useEffect(() => {
    console.log('Component mounted or dependencies changed');
    fetchTickets(currentPage);
  }, [currentPage, fetchTickets]); // Now we include fetchTickets as a dependency

  const { _id, title, description, status, priority, type, escalationLevel, assignedTo, dueDate, comment } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${timestamp}-${randomNum}`;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (_id) {
      // Update the existing ticket
      const updatedFormData = new FormData();
      updatedFormData.append('title', title);
      updatedFormData.append('description', description);
      updatedFormData.append('status', status);
      updatedFormData.append('priority', priority);
      updatedFormData.append('type', type);
      updatedFormData.append('escalationLevel', escalationLevel);
      updatedFormData.append('assignedTo', assignedTo);
      updatedFormData.append('dueDate', dueDate);
      updatedFormData.append('comment', comment); // Append the comment
      attachments.forEach(file => {
        updatedFormData.append('attachments', file);
      });

      try {
        const res = await axios.put(`https://itdesk-backend.vercel.app/api/tickets/edit/${_id}`, updatedFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `${localStorage.getItem('token')}`
          }
        });
        if (res && res.data) {
          const updatedTickets = tickets.map(ticket =>
            ticket._id === _id ? res.data : ticket
          );
          setTickets(updatedTickets);
          setFormData({
            _id: '',
            title: '',
            description: '',
            status: 'Open',
            priority: 'Low',
            type: 'Support',
            escalationLevel: '',
            dueDate: '',
            attachments: [],
            comment: '' // Reset the comment
          });
          setAttachments([]);
          setShowModal(false); // Close modal after form submission
          setToast({ show: true, message: 'Ticket updated successfully!' });
        } else {
          console.error('No response data');
        }
      } catch (err) {
        console.error('Error in onSubmit:', err.response ? err.response.data : err.message);
        setToast({show: true, message: err.response.data['msg']});
      }
    } else {
      // Create a new ticket
      const generatedTicketNumber = generateTicketNumber();

      const newFormData = new FormData();
      newFormData.append('ticketNumber', generatedTicketNumber);
      newFormData.append('title', title);
      newFormData.append('description', description);
      newFormData.append('status', status);
      newFormData.append('priority', priority);
      newFormData.append('type', type);
      newFormData.append('assignedTo', assignedTo);
      newFormData.append('escalationLevel', escalationLevel);
      newFormData.append('dueDate', dueDate);
      newFormData.append('comment', comment); // Append the comment
      attachments.forEach(file => {
        newFormData.append('attachments', file);
      });

      try {
        const res = await axios.post('https://itdesk-backend.vercel.app/api/tickets/create', newFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `${localStorage.getItem('token')}`
          }
        });
        if (res && res.data) {
          setTickets([...tickets, res.data]);
          setFormData({
            _id: '',
            title: '',
            description: '',
            status: 'Open',
            priority: 'Low',
            type: 'Support',
            assignedTo: '',
            dueDate: '',
            attachments: [],
            comment: '' // Reset the comment
          });
          setAttachments([]);
          setShowModal(false); // Close modal after form submission
          setToast({ show: true, message: 'Ticket created successfully!' });
        } else {
          console.error('No response data');
        }
      } catch (err) {
        console.error('Error in onSubmit:', err.response ? err.response.data : err.message);
        setToast({show: true, message: err.response.data['msg']});
      }
    }
  };

  const handleEdit = (ticket) => {
    setFormData({
      _id: ticket._id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      assignedTo: ticket.assignedTo ? ticket.assignedTo.username : '',
      escalationLevel: ticket.escalationLevel || '',
      dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().substring(0, 10) : '',
      // attachments: ticket.attachments || [],
      comment: '' // Reset the comment when editing
    });
    setShowModal(true);
  };

  const handleTakeAction = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowTakeActionModal(true);
  };

  const handleTakeTicket = async () => {
    try {
      const res = await axios.put(`https://itdesk-backend.vercel.app/api/tickets/edit/${selectedTicketId}`, { assignedTo: user.username, status: "In Progress" }, {
        headers: {
          'Authorization': `${localStorage.getItem('token')}`
        }
      });
      if (res && res.data) {
        console.log('Cuurent user is:', user._id);
        const updatedTickets = tickets.map(ticket =>
          ticket._id === selectedTicketId ? res.data : ticket
        );
        setTickets(updatedTickets);
        setShowTakeActionModal(false);
        setToast({ show: true, message: 'Ticket assigned to you successfully!' });
      } else {
        console.error('No response data');
      }
    } catch (err) {
      console.error('Error in handleTakeTicket:', err.response ? err.response.data : err.message);
      setToast({ show: true, message: err.response.data['msg'] });
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to the first page on filter change
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets/export?status=${filterStatus}`, {
        headers: { Authorization: localStorage.getItem('token') },
        responseType: 'blob' // Important to handle the binary data
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tickets.csv'); // Filename for the download
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      if(err.response.status === 403){
        setToast({show: true, message: 'Access denied'});
      }
      console.error('Error exporting tickets:', err.response.status);
    }
  };

  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Tickets</h1>
        <div className='w-full flex justify-between items-center mb-4 bg-gray-100 p-2'>
        {user && (user.role === 'staff' || user.role === 'administrator') && (
            <button type="button" onClick={() => setShowModal(true)} className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Create New Ticket</button>
          )}
          <div className='flex gap-2'>
            <Dropdown label="Filter by Status" dismissOnClick={false}>
              <Dropdown.Item onClick={() => handleFilterChange('Open')}>Open</Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilterChange('In Progress')}>In Progress</Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilterChange('Resolved')}>Resolved</Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilterChange('Closed')}>Closed</Dropdown.Item>
            </Dropdown>
            <Button color="light" onClick={handleExport}>Export</Button>
          </div>
        </div>
        
        <Modal size="5xl" show={showModal} onClose={() => setShowModal(false)}>
          <form onSubmit={onSubmit}>
            <h2 className="text-xl mb-4 text-center">{_id ? 'Edit Ticket' : 'Create New Ticket'}</h2>
              <div className="mb-4">
                <label className="block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Priority</label>
                <select
                  name="priority"
                  value={priority}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Type</label>
                <select
                  name="type"
                  value={type}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Incident">Incident</option>
                  <option value="Request">Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Transfer to :</label>
                <select
                  name="escalationLevel"
                  value={formData.escalationLevel}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <option value="">Select Team</option>
                  <option value="Hardware Team">Hardware Team</option>
                  <option value="Software Team">Software Team</option>
                  <option value="Support Team">Support Team</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={dueDate}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4 col-span-2">
                <label className="block mb-2">Upload Files</label>
                <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <input id="dropzone-file" multiple type="file" onChange={onFileChange} className="hidden" />
                </div>
              </div>
              <div className="mb-4 col-span-2">
                <label className="block mb-2">Leave a comment:</label>
                <textarea
                  name="comment"
                  value={comment}
                  onChange={onChange}
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4">{_id ? 'Update Ticket' : 'Create Ticket'}</button>
          </form>
        </Modal>
        
        <TakeActionModal
          show={showTakeActionModal}
          onClose={() => setShowTakeActionModal(false)}
          onTakeAction={handleTakeTicket}
        />

      {loading ? (
        <div className='relative text-center'>
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div>
          {tickets.length === 0 ? (
            <div className='text-center py-4 text-gray-500'>
              <p>No Tickets</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Ticket Number</th>
                    <th scope="col" className="px-6 py-3">Title</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Team assigned</th>
                    <th scope="col" className="px-6 py-3">Assigned To</th>
                    <th scope="col" className="px-6 py-3">Priority</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Due Date</th>
                    <th scope="col" className="px-6 py-3">Attachments</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, index) => (
                    <tr key={ticket._id} className={`${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} border-b border-gray-200 dark:border-gray-700`}>
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {ticket.ticketNumber}
                      </th>
                      <td className="px-6 py-4">{ticket.title}</td>
                      <td className="px-6 py-4">{ticket.description}</td>
                      <td className="px-6 py-4">{ticket.status}</td>
                      <td className="px-6 py-4">{ticket.escalationLevel ? ticket.escalationLevel : 'Unassigned'}</td>
                      <td className="px-6 py-4">{ticket.assignedTo ? `${ticket.assignedTo.username}` : 'Unassigned'}</td>
                      <td className="px-6 py-4">{ticket.priority}</td>
                      <td className="px-6 py-4">{ticket.type}</td>
                      <td className="px-6 py-4">{ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4">
                        {ticket.attachments.length > 0 ? (
                          <ul>
                            {ticket.attachments.map((attachment, index) => (
                              <li key={index}>
                                <img
                                  src={attachment.url}
                                  alt={attachment.filename}
                                  className="w-32 h-auto rounded-lg cursor-pointer mb-2"
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'No Attachments'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(user.role === 'staff' || user.role === 'administrator') ? (
                          <>
                            <button onClick={() => handleEdit(ticket)} className="text-blue-600 dark:text-blue-400 hover:underline">
                              Edit
                            </button>
                            <button onClick={() => handleEdit(ticket)} className="text-blue-600 dark:text-blue-400 hover:underline">
                              Timeline
                            </button>
                          </>
                        ) : (
                          <>
                            {ticket.assignedTo ? (
                              <p className='text-blue-800 hover:underline hover:cursor-pointer text-sm'>Assigned</p>
                            ) : (
                              <button onClick={() => handleTakeAction(ticket._id)} className="text-blue-600 dark:text-blue-400 hover:underline mr-2">
                                Take action
                              </button>
                            )}
                            <button onClick={() => handleEdit(ticket)} className="text-blue-600 dark:text-blue-400 hover:underline">
                              Update
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tickets.length > 0 && (
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

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
                d="M16.707 4.707a1 1 0 00-1.414-1.414L7 11.586 4.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l9-9z"
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
    </div>
  );
};

export default Tickets;
