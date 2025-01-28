import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Timeline, TextInput, Label, Card, Spinner, Alert, Textarea, Modal } from "flowbite-react";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";

const Tracking = () => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [assignedTo, setAssignedTo] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      if (ticket && ticket._id) {
        const res = await axios.get(`https://itdesk-backend.vercel.app/api/customerFeedbacks/${ticket._id}`, {
          headers: { Authorization: localStorage.getItem('token') }
        });
        setFeedbackData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    }
  }, [ticket]);

  useEffect(() => {
    if (ticket && ticket._id) {
      fetchFeedback();
    }
  }, [ticket, fetchFeedback]); // Now fetchFeedback is in the dependency array

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`https://itdesk-backend.vercel.app/api/tickets/track/${ticketNumber}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setTicket(res.data);
      setAssignedTo(res.data.assignedTo);
    } catch (err) {
      setError("Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setFeedbackLoading(true);
    setFeedbackSuccess(null);
    setFeedbackError(null);
    try {
      await axios.post(`https://itdesk-backend.vercel.app/api/customerFeedbacks/create/${ticket._id}`, {
        feedback,
        rating,
        assignedTo
      }, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setFeedbackSuccess("Feedback submitted successfully!");
      setFeedback(""); // Reset feedback form
      setRating(0); // Reset rating
      fetchFeedback(); // Refresh feedback data
    } catch (err) {
      setFeedbackError("Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Track Ticket Status</h1>
      <Card>
        <div className="mb-4">
          <Label htmlFor="ticketNumber" value="Enter Ticket Number" />
          <TextInput
            id="ticketNumber"
            type="text"
            placeholder="Ticket Number"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            className="mb-2"
            required
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Spinner size="sm" light={true} /> : 'Search'}
          </Button>
        </div>
        {error && <Alert color="failure" className="mb-2">{error}</Alert>}
        {ticket && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
            <p><strong>Title:</strong> {ticket.title}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Type:</strong> {ticket.type}</p>
            <p><strong>Department:</strong> {ticket.department}</p>
            <p><strong>Due Date:</strong> {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'N/A'}</p>
            <h2 className="text-xl font-bold mt-4 mb-2">Timeline</h2>
            <Timeline className="bg-gray-100 p-2 rounded-md">
              {ticket.timeline && ticket.timeline.length > 0 ? (
                ticket.timeline.map((event, index) => (
                  <Timeline.Item key={index}>
                    <Timeline.Point icon={HiCalendar} />
                    <Timeline.Content>
                      <Timeline.Time>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</Timeline.Time>
                      <Timeline.Title>{event.title}</Timeline.Title>
                      <Timeline.Body>
                        {event.description}
                      </Timeline.Body>
                      {event.link && (
                        <Button color="gray">
                          Learn More
                          <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      )}
                    </Timeline.Content>
                  </Timeline.Item>
                ))
              ) : (
                <p>No events found for this ticket.</p>
              )}
            </Timeline>
            {ticket.status === 'Resolved' && !ticket.has_feedback && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
                {feedbackSuccess && <Alert color="success" className="mb-2">{feedbackSuccess}</Alert>}
                {feedbackError && <Alert color="failure" className="mb-2">{feedbackError}</Alert>}
                <div className="mb-4">
                  <Label htmlFor="feedback" value="Your Feedback" />
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write your feedback here"
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="rating" value="Rating (1 to 5)" />
                  <TextInput
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    required
                  />
                </div>
                <Button onClick={handleFeedbackSubmit} disabled={feedbackLoading}>
                  {feedbackLoading ? <Spinner size="sm" light={true} /> : 'Submit Feedback'}
                </Button>
              </div>
            )}
            {ticket.has_feedback && (
              <div className="mt-6">
                <Button onClick={openModal}>View Feedback</Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Feedback Modal */}
      <Modal show={isModalOpen} onClose={closeModal}>
        <Modal.Header>Feedback for Ticket <span className="underline text-blue-600">{ticket?._id}</span></Modal.Header>
        <Modal.Body>
          {feedbackData ? (
            <div>
              <p><strong>Feedback:</strong> {feedbackData.feedback}</p>
              <p><strong>Rating:</strong> {feedbackData.rating}</p>
            </div>
          ) : (
            <Spinner />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Tracking;
