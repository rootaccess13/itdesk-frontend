import React, { useState } from 'react';
import { Modal, Button, Badge } from 'flowbite-react';
import {
  HiOutlineTicket,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUser,
  HiOutlinePaperClip,
  HiDocumentText,
  HiOutlineCalendar,
} from 'react-icons/hi';

const TicketModal = ({ show, onClose, title, tickets, onTicketUpdate }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState({});

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleImageClose = () => {
    setSelectedImage(null);
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleString(undefined, options);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Open':
        return { icon: HiOutlineTicket, color: 'bg-blue-100 text-blue-800' };
      case 'In Progress':
        return { icon: HiOutlineClock, color: 'bg-yellow-100 text-yellow-800' };
      case 'Resolved':
        return { icon: HiOutlineCheckCircle, color: 'bg-green-100 text-green-800' };
      case 'Closed':
        return { icon: HiOutlineXCircle, color: 'bg-gray-100 text-gray-800' };
      default:
        return { icon: HiOutlineTicket, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleResolveTicket = async (ticketId) => {
    if (!ticketId) return; // Guard against undefined ticketId
    setLoading((prev) => ({ ...prev, [ticketId]: true }));
    try {
      const response = await fetch(`https://itdesk-backend.vercel.app/api/tickets/${ticketId}/update/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify({ status: 'Resolved' }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        if (onTicketUpdate) {
          onTicketUpdate(updatedTicket);
        }
      } else {
        console.error('Failed to resolve ticket:', response.statusText);
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
    } finally {
      setLoading((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  return (
    <>
      <Modal show={show} onClose={onClose} size="3xl" popup>
        <Modal.Header className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HiOutlineTicket className="text-blue-500 w-5 h-5" />
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {tickets && tickets.length > 0 ? (
              tickets.map((ticket) => {
                if (!ticket || !ticket._id) return null; // Skip invalid tickets
                const { icon: StatusIcon, color } = getStatusInfo(ticket.status);
                const isLoading = loading[ticket._id] || false;
                return (
                  <div
                    key={ticket._id}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HiOutlineTicket className="text-blue-500 w-5 h-5" />
                          <span className="font-medium text-gray-900 truncate">{ticket.ticketNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-lg font-semibold text-gray-900 truncate">{ticket.title || 'Untitled'}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiDocumentText className="text-gray-500 w-5 h-5" />
                          <p className="text-sm text-gray-700 line-clamp-2">{ticket.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 p-1 rounded-full ${color}`} />
                          <Badge color="gray" className="text-sm">{ticket.status || 'Unknown'}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Priority:</span>
                          <span className="text-sm text-gray-600">{ticket.priority || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Type:</span>
                          <span className="text-sm text-gray-600">{ticket.type || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiOutlineUser className="text-gray-500 w-5 h-5" />
                          <span className="text-sm text-gray-700">
                            {ticket.assignedTo?.username || 'Unassigned'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiOutlineCalendar className="text-gray-500 w-5 h-5" />
                          <span className="text-sm text-gray-700">{formatDate(ticket.createdAt) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiOutlinePaperClip className="text-gray-500 w-5 h-5" />
                          {ticket.attachments && ticket.attachments.length > 0 ? (
                            <div className="space-y-1">
                              {ticket.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  {attachment.url && attachment.url.startsWith('data:image') ? (
                                    <img
                                      src={attachment.url}
                                      alt={attachment.filename || 'Attachment'}
                                      className="w-12 h-12 rounded-lg cursor-pointer object-cover hover:opacity-80 transition"
                                      onClick={() => handleImageClick(attachment.url)}
                                    />
                                  ) : (
                                    <a
                                      href={attachment.url}
                                      download={attachment.filename || 'file'}
                                      className="text-blue-500 hover:underline text-sm truncate max-w-[150px]"
                                    >
                                      {attachment.filename || 'Download'}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-600">None</span>
                          )}
                        </div>
                        {ticket.status === 'In Progress' && (
                          <div className="mt-2">
                            <Button
                              onClick={() => handleResolveTicket(ticket._id)}
                              disabled={isLoading}
                              color="success"
                              size="sm"
                              className="rounded flex items-center gap-2"
                            >
                              <HiOutlineCheckCircle className="w-4 h-4" />
                              {isLoading ? 'Resolving...' : 'Resolve'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">No tickets found.</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="p-4 bg-gray-50 border-t border-gray-200">
          <Button onClick={onClose} color="gray" className="rounded">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {selectedImage && (
        <Modal size="4xl" show={selectedImage !== null} onClose={handleImageClose} popup>
          <Modal.Header className="p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Attachment Preview</h3>
          </Modal.Header>
          <Modal.Body className="p-6 flex justify-center">
            <img
              src={selectedImage}
              alt="Selected attachment"
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
          </Modal.Body>
          <Modal.Footer className="p-4 bg-gray-50 border-t border-gray-200">
            <Button onClick={handleImageClose} color="gray" className="rounded">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default TicketModal;
