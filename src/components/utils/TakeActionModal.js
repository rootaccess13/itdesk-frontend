import React from 'react';
import { Modal, Button } from 'flowbite-react';

const TakeActionModal = ({ show, onClose, onTakeAction }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Take Action</Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to take this ticket?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onTakeAction}>Take this ticket</Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TakeActionModal;
