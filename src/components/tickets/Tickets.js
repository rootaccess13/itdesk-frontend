import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Modal from '../modals/ticketModal';
import TakeActionModal from '../utils/TakeActionModal';
import SidebarComponent from '../utils/SidebarComponent';
import { Spinner, Dropdown, Button, Toast } from 'flowbite-react';
import AuthContext from '../../context/AuthContext';
import { 
  HiOutlineTicket, 
  HiOutlinePencil, 
  HiOutlineClock, 
  HiOutlineUser, 
  HiOutlinePaperClip,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTakeActionModal, setShowTakeActionModal] = useState(false);
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
    assignedTo: '',
    escalationLevel: '',
    dueDate: '',
    attachments: [],
    comment: ''
  });
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const { user } = useContext(AuthContext);

  const fetchTickets = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets`, {
        params: { page, limit: 6, status: filterStatus },
        headers: { Authorization: localStorage.getItem('token') }
      });
      setTickets(res.data.tickets);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to fetch tickets', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage, fetchTickets]);

  // Destructure formData
  const { _id, title, description, status, priority, type, assignedTo, escalationLevel, dueDate, comment } = formData;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const generateTicketNumber = () => {
    const date = new Date();
    return `TKT-${date.getTime()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ticketData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== '_id' && key !== 'attachments') ticketData.append(key, value);
    });
    if (!_id) ticketData.append('ticketNumber', generateTicketNumber());
    attachments.forEach(file => ticketData.append('attachments', file));

    try {
      const url = _id 
        ? `https://itdesk-backend.vercel.app/api/tickets/edit/${_id}`
        : 'https://itdesk-backend.vercel.app/api/tickets/create';
      const method = _id ? axios.put : axios.post;
      
      const res = await method(url, ticketData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem('token')
        }
      });

      setTickets(_id 
        ? tickets.map(t => t._id === _id ? res.data : t)
        : [...tickets, res.data]
      );
      resetForm();
      setToast({ show: true, message: `Ticket ${_id ? 'updated' : 'created'} successfully!`, type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.msg || 'An error occurred', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      title: '',
      description: '',
      status: 'Open',
      priority: 'Low',
      type: 'Support',
      assignedTo: '',
      escalationLevel: '',
      dueDate: '',
      attachments: [],
      comment: ''
    });
    setAttachments([]);
    setShowModal(false);
  };

  const handleEdit = (ticket) => {
    setFormData({
      ...ticket,
      dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().substring(0, 10) : '',
      assignedTo: ticket.assignedTo?.username || '',
      comment: ''
    });
    setShowModal(true);
  };

  const handleTakeAction = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowTakeActionModal(true);
  };

  const handleTakeTicket = async () => {
    try {
      const res = await axios.put(
        `https://itdesk-backend.vercel.app/api/tickets/edit/${selectedTicketId}`,
        { assignedTo: user.username, status: "In Progress" },
        { headers: { 'Authorization': localStorage.getItem('token') } }
      );
      setTickets(tickets.map(t => t._id === selectedTicketId ? res.data : t));
      setShowTakeActionModal(false);
      setToast({ show: true, message: 'Ticket assigned successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.msg || 'Assignment failed', type: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets/export?status=${filterStatus}`, {
        headers: { Authorization: localStorage.getItem('token') },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tickets.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setToast({ show: true, message: 'Export failed: Access denied', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTicketUpdate = (updatedTicket) => {
    setTickets((prevTickets) =>
      prevTickets.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
    );
    setToast({ show: true, message: 'Ticket resolved successfully!', type: 'success' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
            <HiOutlineTicket className="mr-2" /> Tickets
          </h1>
          <div className="flex gap-4">
            {(user?.role === 'staff' || user?.role === 'administrator') && (
              <Button onClick={() => setShowModal(true)} color="blue">
                New Ticket
              </Button>
            )}
            <Dropdown label={`Status: ${filterStatus}`} inline>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                <Dropdown.Item key={status} onClick={() => setFilterStatus(status)}>
                  {status}
                </Dropdown.Item>
              ))}
            </Dropdown>
            <Button onClick={handleExport} color="gray">Export CSV</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="xl" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No tickets found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map(ticket => (
              <div key={ticket._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <HiOutlineTicket className="mr-1" /> {ticket.ticketNumber}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{ticket.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <HiOutlineUser className="mr-2 text-gray-500" />
                    <span>{ticket.assignedTo?.username || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center">
                    <HiOutlineExclamationCircle className="mr-2 text-gray-500" />
                    <span>{ticket.priority}</span>
                  </div>
                  <div className="flex items-center">
                    <HiOutlineClock className="mr-2 text-gray-500" />
                    <span>{ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <HiOutlinePaperClip className="mr-2 text-gray-500" />
                    <span>{ticket.attachments.length} attachment(s)</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {(user?.role === 'staff' || user?.role === 'administrator') ? (
                    <Button size="sm" onClick={() => handleEdit(ticket)}>
                      <HiOutlinePencil className="mr-1" /> Edit
                    </Button>
                  ) : (
                    !ticket.assignedTo && (
                      <Button size="sm" onClick={() => handleTakeAction(ticket._id)} color="blue">
                        Take Action
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              color="gray"
            >
              Previous
            </Button>
            <span className="self-center">Page {currentPage} of {totalPages}</span>
            <Button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              color="gray"
            >
              Next
            </Button>
          </div>
        )}

        <Modal show={showModal} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {_id ? 'Edit Ticket' : 'Create New Ticket'}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={dueDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Team</label>
                <select
                  name="escalationLevel"
                  value={escalationLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Team</option>
                  <option value="Software Team">Software Team</option>
                  <option value="Network Team">Network Team</option>
                  <option value="Hardware Team">Hardware Team</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <Button type="submit" color="blue" className="w-full mt-6">
              {_id ? 'Update Ticket' : 'Create Ticket'}
            </Button>
          </form>
        </Modal>

        <TicketModal
          show={showModal}
          onClose={resetForm}
          title={_id ? 'Edit Ticket' : 'Ticket Details'}
          tickets={_id ? [formData] : tickets} // Pass selected ticket or all tickets
          onTicketUpdate={handleTicketUpdate} // Pass the callback
        />
        <TakeActionModal
          show={showTakeActionModal}
          onClose={() => setShowTakeActionModal(false)}
          onTakeAction={handleTakeTicket}
        />

        {toast.show && (
          <Toast className="fixed top-4 right-4">
            {toast.type === 'success' ? (
              <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" />
            )}
            <div className="ml-3 text-sm">{toast.message}</div>
            <Toast.Toggle onClick={() => setToast({ ...toast, show: false })} />
          </Toast>
        )}
      </div>
    </div>
  );
};

export default Tickets;
