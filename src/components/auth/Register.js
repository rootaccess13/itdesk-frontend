import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toast, Spinner, Card, Button } from 'flowbite-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    password: '',
    repeatPassword: ''
  });

  const { firstName, lastName, username, email, phoneNumber, idNumber, password, repeatPassword } = formData;
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setToast({ show: true, message: "Passwords do not match" });
      return;
    }

    const newUser = { firstName, lastName, username, email, phoneNumber, idNumber, password };
    setLoading(true);

    try {
      await axios.post('https://itdesk-backend.vercel.app/api/users/register', newUser);
      setToast({ show: true, message: "Registration successful! Please wait for administrator confirmation." });
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        idNumber: '',
        password: '',
        repeatPassword: ''
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.email || err.response?.data?.username || 'Registration failed. Please check your input.';
      setToast({ show: true, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (response) => {
    setGoogleLoading(true);
    try {
      const decoded = jwtDecode(response.credential);
      const { email, given_name, family_name, sub } = decoded;

      await axios.post('https://itdesk-backend.vercel.app/api/users/register', {
        googleId: sub,
        firstName: given_name,
        lastName: family_name,
        username: `${given_name}${family_name}`,
        email,
        phoneNumber: 'N/A',
        idNumber: 'N/A', // Added for Google auth
        password: 'oauth-user'
      });

      setToast({ show: true, message: "Google registration successful! Please wait for confirmation." });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || 'Google registration failed' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl"> {/* Increased max-width */}
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
          Create New Account
        </h1>
        
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={firstName}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={phoneNumber}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={password}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={lastName}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={username}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="idNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  ID Number
                </label>
                <input
                  type="text"
                  name="idNumber"
                  id="idNumber"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={idNumber}
                  onChange={onChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="repeatPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="repeatPassword"
                  id="repeatPassword"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  value={repeatPassword}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner aria-label="Registering..." /> : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
              Login here
            </a>
          </p>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-2 text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <GoogleOAuthProvider clientId="36468434283-pj5p6ev61uasg63djvd4bv85ho4inm1r.apps.googleusercontent.com">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleAuth}
              onError={() => setToast({ show: true, message: 'Google authentication failed' })}
              theme="filled_blue"
              size="large"
              shape="rectangular"
              text="signup_with"
            />
          </div>
        </GoogleOAuthProvider>
      </Card>

      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast onClose={() => setToast({ ...toast, show: false })}>
            <div className="text-sm font-normal">{toast.message}</div>
          </Toast>
        </div>
      )}

      {googleLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Spinner aria-label="Google sign-in" size="xl" />
        </div>
      )}
    </div>
  );
};

export default Register;
