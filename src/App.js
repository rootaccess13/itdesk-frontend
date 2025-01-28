import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/utils/Navbar';
import Home from './components/auth/Home';
import Dashboard from './components/auth/Dashboard';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Ticket from './components/tickets/Tickets';
import Assets from './components/asset/Assets';
import FolderDetails from './components/asset/FolderDetails';
import Articles from './components/articles/Articles';
import ArticleDetails from './components/articles/ArticleDetails';
import Users from './components/users/Users';
import ManageUsers from './components/users/ManageUsers';
import Incident from './components/incidentrequest/Incident';
import Tracking from './components/tickets/Tracking';
import { AuthProvider } from './context/AuthContext';
import requireAuth from './components/hoc/requireAuth';
import redirectIfAuthenticated from './components/hoc/redirectIfAuthenticated';
import Announcement from './components/announcement/Announcement';
import Profile from './components/users/Profile';

const ProtectedDashboard = requireAuth(Dashboard);
const RedirectedLogin = redirectIfAuthenticated(Login);
const RedirectedRegister = redirectIfAuthenticated(Register);
const ProtectedTicket = requireAuth(Ticket);
const ProtectedAssets = requireAuth(Assets);
const ProtectedUsers = requireAuth(Users);
const ProtectedManageUsers = requireAuth(ManageUsers);
const ProtectedAnnouncement = requireAuth(Announcement);
const ProtectedArticles = requireAuth(Articles);
const ProtectedProfile = requireAuth(Profile);

const App = () => (
  <AuthProvider>
    <Router>
      <div className="App">
        <NavbarComponent />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RedirectedRegister />} />
          <Route path="/login" element={<RedirectedLogin />} />
          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="/tickets" element={<ProtectedTicket />} />
          <Route path="/assets" element={<ProtectedAssets />} />
          <Route path="/users" element={<ProtectedUsers />} />
          <Route path="/announcements" element={<ProtectedAnnouncement />} />
          <Route path="/users/manage/all" element={<ProtectedManageUsers />} />
          <Route path="/incident" element={<Incident />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/folder/:id" element={<FolderDetails />} />
          <Route path="/articles" element={<ProtectedArticles />} />
          <Route path="/articles/:id" element={<ArticleDetails />} />
          <Route path="/profile" element={<ProtectedProfile />} />
        </Routes>
      </div>
    </Router>
  </AuthProvider>
);

export default App;
