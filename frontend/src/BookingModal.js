import React from 'react';
import Modal from 'react-modal';
import BookingForm from './BookingForm';

const BookingModal = ({ isOpen, onRequestClose, officeId }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Book an Appointment</h2>
      <BookingForm officeId={officeId} />
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default BookingModal;