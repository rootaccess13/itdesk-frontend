import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import TicketModal from '../modals/TicketModalType';
import SidebarComponent from '../utils/SidebarComponent';
import { Spinner, Button } from 'flowbite-react';
import { 
  HiOutlineTicket, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle 
} from 'react-icons/hi';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext); // Added logout from AuthContext
  const [ticketCount, setTicketCount] = useState(null);
  const [myTicketCount, setMyTicketCount] = useState(null);
  const [myTicketCountProgress, setMyTicketCountProgress] = useState(null);
  const [myTicketCountResolved, setMyTicketCountResolved] = useState(null);
  const [inProgressCount, setInProgressCount] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(null);
  const [closedCount, setClosedCount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalTickets, setModalTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch total ticket count
        const totalRes = await axios.get('https://itdesk-backend.vercel.app/api/tickets/count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTicketCount(totalRes.data.count);

        // Fetch status-specific counts for all tickets
        const statusPromises = ['In Progress', 'Resolved', 'Closed'].map(status =>
          axios.get(`https://itdesk-backend.vercel.app/api/tickets/count?status=${status}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        );

        const [inProgressRes, resolvedRes, closedRes] = await Promise.all(statusPromises);
        setInProgressCount(inProgressRes.data.count);
        setResolvedCount(resolvedRes.data.count);
        setClosedCount(closedRes.data.count);

        // Fetch personal ticket counts if user exists
        if (user) {
          const personalPromises = ['Open', 'In Progress', 'Resolved'].map(status =>
            axios.get(`https://itdesk-backend.vercel.app/api/tickets/count/personal/${user._id}?status=${status}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
          );

          const [openRes, progressRes, resolvedRes] = await Promise.all(personalPromises);
          setMyTicketCount(openRes.data.count);
          setMyTicketCountProgress(progressRes.data.count);
          setMyTicketCountResolved(resolvedRes.data.count);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCardClick = (status, title, id) => {
    setModalTitle(title);
    axios.get(`https://itdesk-backend.vercel.app/api/tickets/by-status?status=${status}&id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setModalTickets(res.data);
        setShowModal(true);
      })
      .catch(err => {
        console.error('Error fetching tickets for modal:', err);
      });
  };

  const TicketCards = [
    {
      title: 'Total Tickets',
      content: ticketCount !== null ? `${ticketCount}` : 'Loading...',
      status: '',
      id: '',
      bg: 'bg-red-100',
      icon: HiOutlineTicket,
    },
    {
      title: 'In Progress',
      content: inProgressCount !== null ? `${inProgressCount}` : 'Loading...',
      status: 'In Progress',
      id: '',
      bg: 'bg-blue-100',
      icon: HiOutlineClock,
    },
    {
      title: 'Resolved',
      content: resolvedCount !== null ? `${resolvedCount}` : 'Loading...',
      status: 'Resolved',
      id: '',
      bg: 'green-100',
      icon: HiOutlineCheckCircle,
    },
    {
      title: 'Closed',
      content: closedCount !== null ? `${closedCount}` : 'Loading...',
      status: 'Closed',
      id: '',
      bg: 'bg-yellow-100',
      icon: HiOutlineXCircle,
    },
  ];

  const MyTicketCards = [
    {
      title: 'New Tickets',
      content: myTicketCount !== null ? `${myTicketCount}` : 'Loading...',
      status: 'Open',
      id: user ? user._id : '',
      bg: 'bg-red-100',
      icon: HiOutlineTicket,
    },
    {
      title: 'In Progress',
      content: myTicketCountProgress !== null ? `${myTicketCountProgress}` : 'Loading...',
      status: 'In Progress',
      id: user ? user._id : '',
      bg: 'bg-blue-100',
      icon: HiOutlineClock,
    },
    {
      title: 'Resolved',
      content: myTicketCountResolved !== null ? `${myTicketCountResolved}` : 'Loading...',
      status: 'Resolved',
      id: user ? user._id : '',
      bg: 'bg-green-100',
      icon: HiOutlineCheckCircle,
    },
    {
      title: 'Closed',
      content: closedCount !== null ? `${closedCount}` : 'Loading...',
      status: 'Closed',
      id: user ? user._id : '',
      bg: 'bg-yellow-100',
      icon: HiOutlineXCircle,
    },
  ];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.username}</h1>
          <Button 
            onClick={logout} 
            color="gray" 
            size="sm"
            className="hover:bg-gray-300 transition-colors"
          >
            Logout
          </Button>
        </div>

        {(user.role === 'staff' || user.role === 'administrator') ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Tickets Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {TicketCards.map((card, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md ${card.bg} border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer`}
                  onClick={() => handleCardClick(card.status, card.title, card.id)}
                >
                  <div className="flex flex-col items-center gap-4">
                    <card.icon className="text-3xl text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                    <p className="text-xl font-bold text-gray-700">
                      {card.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">My Tickets</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {MyTicketCards.map((card, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg shadow-md ${card.bg} border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer`}
                  onClick={() => handleCardClick(card.status, card.title, card.id)}
                >
                  <div className="flex flex-col items-center gap-4">
                    <card.icon className="text-3xl text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                    <p className="text-xl font-bold text-gray-700">
                      {card.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <TicketModal
          show={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          tickets={modalTickets}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
            <Spinner size="xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
