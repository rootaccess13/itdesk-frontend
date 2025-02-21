import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import Modal from "../modals/ticketModal";
import TakeActionModal from "../utils/TakeActionModal";
import SidebarComponent from "../utils/SidebarComponent";
import { Spinner, Dropdown, Button, Toast, Card } from "flowbite-react";
import AuthContext from "../../context/AuthContext";
import {
  HiOutlineTicket,
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePaperClip,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiEye,
  HiDownload,
} from "react-icons/hi";
import { jsPDF } from "jspdf"; // Ensure correct import

// Log jsPDF to verify import
console.log("jsPDF imported:", jsPDF);

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTakeActionModal, setShowTakeActionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("Open");
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    description: "",
    status: "Open",
    priority: "Low",
    type: "Support",
    assignedTo: "",
    escalationLevel: "",
    dueDate: "",
    attachments: [],
    comment: "",
  });
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [analytics, setAnalytics] = useState(null);

  const { user } = useContext(AuthContext);

  const fetchTickets = useCallback(
    async (page) => {
      setLoading(true);
      try {
        const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets`, {
          params: { page, limit: 6, status: filterStatus },
          headers: { Authorization: localStorage.getItem("token") },
        });
        setTickets(res.data.tickets || []); // Ensure tickets is an array
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setToast({ show: true, message: "Failed to fetch tickets", type: "error" });
        setTickets([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    },
    [filterStatus]
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets/analytics`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Failed to fetch analytics", type: "error" });
    }
  }, []);

  useEffect(() => {
    fetchTickets(currentPage);
    fetchAnalytics();
  }, [currentPage, fetchTickets, fetchAnalytics]);

  const { _id, title, description, status, priority, type, assignedTo, escalationLevel, dueDate, comment } = formData;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const generateTicketNumber = () => {
    const date = new Date();
    return `TKT-${date.getTime()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ticketData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "_id" && key !== "attachments") ticketData.append(key, value);
    });
    if (!_id) ticketData.append("ticketNumber", generateTicketNumber());
    attachments.forEach((file) => ticketData.append("attachments", file));

    try {
      const url = _id
        ? `https://itdesk-backend.vercel.app/api/tickets/edit/${_id}`
        : "https://itdesk-backend.vercel.app/api/tickets/create";
      const method = _id ? axios.put : axios.post;

      const res = await method(url, ticketData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem("token"),
        },
      });

      setTickets(
        _id
          ? tickets.map((t) => (t._id === _id ? res.data : t))
          : [...tickets, res.data]
      );
      resetForm();
      setToast({ show: true, message: `Ticket ${_id ? "updated" : "created"} successfully!`, type: "success" });
      fetchAnalytics();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.msg || "An error occurred", type: "error" });
    }
  };

  const resetForm = () => {
    setFormData({
      _id: "",
      title: "",
      description: "",
      status: "Open",
      priority: "Low",
      type: "Support",
      assignedTo: "",
      escalationLevel: "",
      dueDate: "",
      attachments: [],
      comment: "",
    });
    setAttachments([]);
    setShowModal(false);
  };

  const handleEdit = (ticket) => {
    setFormData({
      ...ticket,
      dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().substring(0, 10) : "",
      assignedTo: ticket.assignedTo?.username || "",
      comment: "",
    });
    setShowModal(true);
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const handleTakeAction = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowTakeActionModal(true);
  };

  const handleTakeTicket = async () => {
    try {
      const res = await axios.put(
        `https://itdesk-backend.vercel.app/api/tickets/edit/${selectedTicketId}`,
        { assignedTo: user._id, status: "In Progress" },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setTickets(tickets.map((t) => (t._id === selectedTicketId ? res.data : t)));
      setShowTakeActionModal(false);
      setToast({ show: true, message: "Ticket assigned successfully!", type: "success" });
      fetchAnalytics();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.msg || "Assignment failed", type: "error" });
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets/export?status=${filterStatus}`, {
        headers: { Authorization: localStorage.getItem("token") },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tickets.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setToast({ show: true, message: "Export failed: Access denied", type: "error" });
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedTicket || typeof jsPDF !== "function") {
      console.error("jsPDF not available or no ticket selected");
      setToast({ show: true, message: "Unable to generate PDF", type: "error" });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Ticket Details", 20, 20);
    doc.setFontSize(12);
    doc.text(`Ticket Number: ${selectedTicket.ticketNumber}`, 20, 30);
    doc.text(`Title: ${selectedTicket.title}`, 20, 40);
    doc.text(`Description: ${selectedTicket.description}`, 20, 50, { maxWidth: 160 });
    doc.text(`Status: ${selectedTicket.status}`, 20, 70);
    doc.text(`Priority: ${selectedTicket.priority}`, 20, 80);
    doc.text(`Assigned To: ${selectedTicket.assignedTo?.username || "Unassigned"}`, 20, 90);
    doc.text(`Due Date: ${selectedTicket.dueDate ? new Date(selectedTicket.dueDate).toLocaleDateString() : "N/A"}`, 20, 100);
    doc.text(`Escalation Level: ${selectedTicket.escalationLevel || "N/A"}`, 20, 110);
    doc.text(`Attachments: ${selectedTicket.attachments.length}`, 20, 120);

    if (selectedTicket.attachments.length > 0) {
      doc.text("Attachment URLs:", 20, 130);
      selectedTicket.attachments.forEach((attachment, index) => {
        doc.text(`${index + 1}. ${attachment.url}`, 20, 140 + index * 10, { maxWidth: 160 });
      });
    }

    doc.save(`ticket_${selectedTicket.ticketNumber}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
              <HiOutlineTicket className="mr-2 text-blue-600" /> Tickets
            </h1>
            <div className="flex gap-4">
              {(user?.role === "staff" || user?.role === "administrator") && (
                <Button
                  onClick={() => setShowModal(true)}
                  gradientDuoTone="greenToBlue"
                  className="font-medium"
                >
                  New Ticket
                </Button>
              )}
              <Dropdown label={`Status: ${filterStatus}`} inline>
                {["Open", "In Progress", "Resolved", "Closed"].map((status) => (
                  <Dropdown.Item key={status} onClick={() => setFilterStatus(status)}>
                    {status}
                  </Dropdown.Item>
                ))}
              </Dropdown>
              <Button onClick={handleExport} color="gray" className="font-medium">
                Export CSV
              </Button>
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="xl" />
              <span className="ml-3 text-gray-600">Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No tickets found for status: {filterStatus}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <Card key={ticket._id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <HiOutlineTicket className="mr-1" /> {ticket.ticketNumber}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <HiOutlineUser className="mr-2 text-gray-500" />
                        <span>{ticket.assignedTo?.username || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center">
                        <HiOutlineExclamationCircle className="mr-2 text-gray-500" />
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <HiOutlineClock className="mr-2 text-gray-500" />
                        <span>{ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <HiOutlinePaperClip className="mr-2 text-gray-500" />
                        <span>{ticket.attachments.length} attachment(s)</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {(user?.role === "staff" || user?.role === "administrator") ? (
                        <Button
                          size="sm"
                          onClick={() => handleEdit(ticket)}
                          gradientDuoTone="cyanToBlue"
                        >
                          <HiOutlinePencil className="mr-1" /> Edit
                        </Button>
                      ) : (
                        !ticket.assignedTo && (
                          <Button
                            size="sm"
                            onClick={() => handleTakeAction(ticket._id)}
                            gradientDuoTone="greenToBlue"
                          >
                            Take Action
                          </Button>
                        )
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleView(ticket)}
                        gradientDuoTone="purpleToBlue"
                      >
                        <HiEye className="mr-1" /> View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                color="gray"
              >
                Previous
              </Button>
              <span className="self-center text-gray-600">Page {currentPage} of {totalPages}</span>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                color="gray"
              >
                Next
              </Button>
            </div>
          )}

          {/* Analytics Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
              <HiOutlineChartBar className="mr-2 text-blue-600" /> Ticket Analytics & Insights
            </h2>
            {analytics ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Status Distribution</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className={`text-sm ${getStatusColor(status)} px-2 py-1 rounded-full`}>
                          {status}
                        </span>
                        <span className="text-sm font-medium text-gray-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Priority Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.priorityBreakdown).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between items-center">
                        <span className={`text-sm ${getPriorityColor(priority)} px-2 py-1 rounded-full`}>
                          {priority}
                        </span>
                        <span className="text-sm font-medium text-gray-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Most Common Problems</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {analytics.commonProblems.map((problem, index) => (
                      <li key={index}>
                        {problem.title} <span className="text-gray-500">({problem.count} tickets)</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Metrics</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Total Tickets: <span className="font-medium">{analytics.totalTickets}</span></p>
                    <p>Average Resolution Time: <span className="font-medium">{analytics.avgResolutionTime || "N/A"}</span></p>
                    <p>Unassigned Tickets: <span className="font-medium">{analytics.unassignedTickets}</span></p>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Loading analytics...
              </div>
            )}
          </div>

          {/* Create/Edit Ticket Modal */}
          <Modal show={showModal} onClose={resetForm}>
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {_id ? "Edit Ticket" : "Create New Ticket"}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Team</label>
                  <select
                    name="escalationLevel"
                    value={escalationLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
              <Button
                type="submit"
                gradientDuoTone="greenToBlue"
                className="w-full mt-6 font-medium"
              >
                {_id ? "Update Ticket" : "Create Ticket"}
              </Button>
            </form>
          </Modal>

          {/* View Ticket Modal */}
          <Modal show={showViewModal} onClose={() => setShowViewModal(false)} size="lg">
            <Modal.Header className="bg-gradient-to-r from-purple-500 to-blue-600">
              <span className="text-white">Ticket Details</span>
            </Modal.Header>
            <Modal.Body className="space-y-4">
              {selectedTicket ? (
                <div className="text-gray-700">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedTicket.title}</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <p><strong>Ticket Number:</strong> {selectedTicket.ticketNumber}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span></p>
                    <p><strong>Priority:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span></p>
                    <p><strong>Assigned To:</strong> {selectedTicket.assignedTo?.username || "Unassigned"}</p>
                    <p><strong>Due Date:</strong> {selectedTicket.dueDate ? new Date(selectedTicket.dueDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Escalation Level:</strong> {selectedTicket.escalationLevel || "N/A"}</p>
                    <p className="md:col-span-2"><strong>Description:</strong> {selectedTicket.description}</p>
                    <div className="md:col-span-2">
                      <strong>Attachments:</strong>
                      {selectedTicket.attachments.length > 0 ? (
                        <ul className="list-disc list-inside mt-1">
                          {selectedTicket.attachments.map((attachment, index) => (
                            <li key={index}>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {attachment.filename}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No attachments</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No ticket selected</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleDownloadPDF} gradientDuoTone="pinkToOrange">
                <HiDownload className="mr-2" /> Download PDF
              </Button>
              <Button onClick={() => setShowViewModal(false)} color="gray">
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <TakeActionModal
            show={showTakeActionModal}
            onClose={() => setShowTakeActionModal(false)}
            onTakeAction={handleTakeTicket}
          />

          {toast.show && (
            <Toast className="fixed top-4 right-4">
              {toast.type === "success" ? (
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
    </div>
  );
};

export default Tickets;
