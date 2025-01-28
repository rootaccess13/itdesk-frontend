// TicketModalType.js
import React from 'react';
import { Modal, Button } from 'flowbite-react';

const TicketModal = ({ show, onClose, title, tickets }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <div key={ticket.id} className="p-2 border-b">
              <p>{ticket.title}</p>
              <p>{ticket.description}</p>
            </div>
          ))
        ) : (
          <p>No tickets available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TicketModal;
