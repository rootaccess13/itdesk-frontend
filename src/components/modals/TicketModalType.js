import React, { useState } from 'react';
import { Modal, Button, Badge, Table } from 'flowbite-react';
import { 
  HiOutlineTicket, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineUser,
  HiOutlinePaperClip,
  HiDocumentText, // Replaced HiOutlineDescription with HiDocumentText
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
        <Modal.Header>
          <div className="flex items-center gap-2">
            <HiOutlineTicket className="text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        </Modal.Header>
        <Modal.Body className="p-6">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Ticket #</Table.HeadCell>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Priority</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>Assigned To</Table.HeadCell>
                <Table.HeadCell>Created</Table.HeadCell>
                <Table.HeadCell>Attachments</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {tickets && tickets.length > 0 ? (
                  tickets.map((ticket) => {
                    const { icon: StatusIcon, color } = getStatusInfo(ticket.status);
                    return (
                      <Table.Row key={ticket._id} className="bg-white hover:bg-gray-50">
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                          <HiOutlineTicket className="text-blue-500" />
                          {ticket.ticketNumber}
                        </Table.Cell>
                        <Table.Cell>{ticket.title}</Table.Cell>
                        <Table.Cell className="flex items-center gap-2">
                          <HiDocumentText className="text-gray-500" />
                          {ticket.description}
                        </Table.Cell>
                        <Table.Cell className="flex items-center gap-2">
                          <StatusIcon className={`p-1 rounded-full ${color}`} />
                          <span>{ticket.status}</span>
                        </Table.Cell>
                        <Table.Cell>{ticket.priority}</Table.Cell>
                        <Table.Cell>{ticket.type}</Table.Cell>
                        <Table.Cell className="flex items-center gap-2">
                          <HiOutlineUser className="text-gray-500" />
                          {ticket.assignedTo?.username || 'Unassigned'}
                        </Table.Cell>
                        <Table.Cell className="flex items-center gap-2">
                          <HiOutlineCalendar className="text-gray-500" />
                          {formatDate(ticket.createdAt)}
                        </Table.Cell>
                        <Table.Cell className="flex items-center gap-2">
                          <HiOutlinePaperClip className="text-gray-500" />
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
                                      className="text-blue-500 hover:underline"
                                    >
                                      {attachment.filename}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            'None'
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={9} className="text-center text-gray-500 py-4">
                      No tickets found.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} color="gray">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {selectedImage && (
        <Modal size="4xl" show={selectedImage !== null} onClose={handleImageClose}>
          <Modal.Header>
            <h3 className="text-xl font-semibold text-gray-900">Attachment Preview</h3>
          </Modal.Header>
          <Modal.Body className="p-6 flex justify-center">
            <img src={selectedImage} alt="Selected attachment" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleImageClose} color="gray">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default TicketModal;
