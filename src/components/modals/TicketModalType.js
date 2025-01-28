import React, { useState } from 'react';
import { Modal, Button, Badge } from 'flowbite-react';

const TicketModal = ({ show, onClose, title, tickets }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleImageClose = () => {
    setSelectedImage(null);
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Modal show={show} onClose={onClose}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {tickets && tickets.length > 0 ? (
              tickets.map(ticket => (
                <div key={ticket._id} className="p-4 bg-gray-100 rounded-lg">
                  <h5 className="text-lg font-bold">{ticket.title}</h5>
                  <p className='flex flex-inline text-sm font-bold'>Created: {formatDate(ticket.createdAt)}</p>
                  <p className='flex flex-inline text-sm font-bold'>Description: {ticket.description}</p>
                  <p className='flex flex-inline text-sm font-bold'>Status: <Badge color="warning">{ticket.status}</Badge></p>
                  <p className='flex flex-inline text-sm font-bold'>Priority: {ticket.priority}</p>
                  <p className='flex flex-inline text-sm font-bold'>Type: {ticket.type}</p>
                  <p className='flex flex-inline text-sm font-bold'>
                    Assigned To: {ticket.assignedTo ? `${ticket.assignedTo.username} (${ticket.assignedTo.email})` : 'Unassigned'}
                  </p>
                  <div>
                    <h6 className="font-bold">Attachments:</h6>
                    {ticket.attachments && ticket.attachments.length > 0 ? (
                      <ul>
                        {ticket.attachments.map((attachment, index) => (
                          <li key={index}>
                            {attachment.url.startsWith('data:image') ? (
                              <img
                                src={attachment.url}
                                alt={attachment.filename}
                                className="w-48 h-auto rounded-lg cursor-pointer"
                                onClick={() => handleImageClick(attachment.url)}
                              />
                            ) : (
                              <a href={attachment.url} download={attachment.filename}>
                                {attachment.filename}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No attachments</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No tickets found.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {selectedImage && (
        <Modal size="4xl" show={selectedImage !== null} onClose={handleImageClose}>
          <Modal.Body>
            <img src={selectedImage} alt="Selected attachment" className="w-full h-auto rounded-lg" />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleImageClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default TicketModal;
