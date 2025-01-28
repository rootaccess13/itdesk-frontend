import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import TicketModal from '../modals/TicketModalType';
import SidebarComponent from '../utils/SidebarComponent';
import { Spinner } from 'flowbite-react';
import UserStats from '../stats/UserStats';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    // Fetch the total number of tickets from the backend
    axios.get('http://localhost:5001/api/tickets/count', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setTicketCount(res.data.count);
      })
      .catch(err => {
        console.error(err);
      });

    // Fetch the number of tickets in progress from the backend
    axios.get('http://localhost:5001/api/tickets/count?status=In Progress', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setInProgressCount(res.data.count);
      })
      .catch(err => {
        console.error(err);
      });

    // Fetch the number of tickets resolved from the backend
    axios.get('http://localhost:5001/api/tickets/count?status=Resolved', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setResolvedCount(res.data.count);
      })
      .catch(err => {
        console.error(err);
      });

    // Fetch the number of tickets closed from the backend
    axios.get('http://localhost:5001/api/tickets/count?status=Closed', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setClosedCount(res.data.count);
      })
      .catch(err => {
        console.error(err);
      });

    // Fetch the personal ticket count for the logged-in user
    if (user) {
      fetchMyTicketCount(user._id);
    }
  }, [user]);

  const fetchMyTicketCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/tickets/count/personal/${userId}?status=Open`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyTicketCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
    try {
      const res = await axios.get(`http://localhost:5001/api/tickets/count/personal/${userId}?status=In Progress`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyTicketCountProgress(res.data.count);
    } catch (err) {
      console.error(err);
    }
    try {
      const res = await axios.get(`http://localhost:5001/api/tickets/count/personal/${userId}?status=Resolved`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMyTicketCountResolved(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (status, title, id) => {
    setModalTitle(title);
    axios.get(`http://localhost:5001/api/tickets/by-status?status=${status}&id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setModalTickets(res.data);
        setShowModal(true);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const Ticketcards = [
    {
      title: 'Total Tickets',
      content: ticketCount !== null ? `${ticketCount}` : 'Loading ticket count...',
      status: '', // Fetch all tickets
      id: '', // or some default value if needed
      bg: 'bg-red-200'
    },
    {
      title: 'In Progress',
      content: inProgressCount !== null ? `${inProgressCount}` : 'Loading in-progress count...',
      status: 'In Progress',
      id: '', // or some default value if needed
      bg: 'bg-blue-100'
    },
    {
      title: 'Resolved',
      content: resolvedCount !== null ? `${resolvedCount}` : 'Loading resolved count...',
      status: 'Resolved',
      id: '', // or some default value if needed
      bg: 'bg-green-200'
    },
    {
      title: 'Closed',
      content: closedCount !== null ? `${closedCount}` : 'Loading closed count...',
      status: 'Closed',
      id: '', // or some default value if needed
      bg: 'bg-yellow-200'
    }
  ];

  const MyTicketcards = [
    {
      title: 'New Tickets',
      content: myTicketCount !== null ? `${myTicketCount}` : 'Loading ticket count...',
      status: 'Open', // Fetch all personal tickets
      id: user ? user._id : '',
      bg: 'bg-red-200'
    },
    {
      title: 'In Progress',
      content: myTicketCountProgress !== null ? `${myTicketCountProgress}` : 'Loading in-progress count...',
      status: 'In Progress',
      id: user ? user._id : '',
      bg: 'bg-blue-100'
    },
    {
      title: 'Resolved',
      content: myTicketCountResolved !== null ? `${myTicketCountResolved}` : 'Loading resolved count...',
      status: 'Resolved',
      id: user ? user._id : '',
      bg: 'bg-green-200'
    },
    {
      title: 'Closed',
      content: closedCount !== null ? `${closedCount}` : 'Loading closed count...',
      status: 'Closed',
      id: user ? user._id : '',
      bg: 'bg-yellow-200'
    }
  ];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <SidebarComponent />
      <div className="w-full m-4 p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
        <div className="container mx-auto p-4">
          <div className='w-full flex justify-between items-center mb-4 bg-gray-100 p-2'>
            <p className='font-bold text-md bg-gray-100 p-2'>Welcome, {user.username}</p>
            <button className='font-bold text-md bg-gray-100 p-2'>Logout</button>
          </div>

          {(user.role === 'staff' || user.role === 'administrator') ? (
            <>
              <h1 className='text-2xl font-bold underline'>
                Tickets
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {Ticketcards.map((card, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${card.bg} text-center rounded-lg border border-gray-200 shadow-md dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}
                    onClick={() => handleCardClick(card.status, card.title, card.id)}
                  >
                    <div className="flex h-full flex-col justify-center gap-4 p-6">
                      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {card.title}
                      </h5>
                      <p className="font-bold text-lg text-gray-700 dark:text-gray-400">
                        {card.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) :
            <>
              <h1 className='text-2xl font-bold underline'>
                My Tickets
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {MyTicketcards.map((card, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${card.bg} text-center rounded-lg border border-gray-200 shadow-md dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}
                    onClick={() => handleCardClick(card.status, card.title, card.id)}
                  >
                    <div className="flex h-full flex-col justify-center gap-4 p-6">
                      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {card.title}
                      </h5>
                      <p className="font-bold text-lg text-gray-700 dark:text-gray-400">
                        {card.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          }

          <h1 className='text-2xl font-bold mt-4 underline'>
            Users
          </h1>


        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <UserStats />
            </div>
            <div>
              <UserStats />
            </div>
          </div>
      </div>

      <TicketModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        tickets={modalTickets}
      />
    </div>
  );
};

export default Dashboard;
