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
  HiOutlineCalendar
} from 'react-icons/hi';

const TicketModal = ({ show, onClose, title, tickets }) => {
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Helper function to get status icon and color
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

  return (
    <>
      <Modal show={show} onClose={onClose} size="4xl" popup>
        <Modal.Header className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HiOutlineTicket className="text-blue-500 w-5 h-5" />
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="space-y-4">
            {tickets && tickets.length > 0 ? (
              tickets.map((ticket) => {
                const { icon: StatusIcon, color } = getStatusInfo(ticket.status);
                return (
                  <div
                    key={ticket._id}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <HiOutlineTicket className="text-blue-500 w-5 h-5" />
                        <span className="font-medium text-gray-900 truncate">{ticket.ticketNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-lg font-semibold text-gray-900 truncate">{ticket.title}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiDocumentText className="text-gray-500 w-5 h-5" />
                        <p className="text-sm text-gray-700 line-clamp-2">{ticket.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 p-1 rounded-full ${color}`} />
                        <Badge color="gray" className="text-sm">{ticket.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Priority:</span>
                        <span className="text-sm text-gray-600">{ticket.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Type:</span>
                        <span className="text-sm text-gray-600">{ticket.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className="text-gray-500 w-5 h-5" />
                        <span className="text-sm text-gray-700">
                          {ticket.assignedTo?.username || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar className="text-gray-500 w-5 h-5" />
                        <span className="text-sm text-gray-700">{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlinePaperClip className="text-gray-500 w-5 h-5" />
                        {ticket.attachments && ticket.attachments.length > 0 ? (
                          <div className="space-y-1">
                            {ticket.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2">
                                {attachment.url.startsWith('data:image') ? (
                                  <img
                                    src={attachment.url}
                                    alt={attachment.filename}
                                    className="w-12 h-12 rounded-lg cursor-pointer object-cover"
                                    onClick={() => handleImageClick(attachment.url)}
                                  />
                                ) : (
                                  <a 
                                    href={attachment.url} 
                                    download={attachment.filename}
                                    className="text-blue-500 hover:underline text-sm truncate max-w-[150px]"
                                  >
                                    {attachment.filename}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">
                No tickets found.
              </div>
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
            <img src={selectedImage} alt="Selected attachment" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
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
