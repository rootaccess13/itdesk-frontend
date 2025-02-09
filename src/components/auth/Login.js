import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { Toast } from 'flowbite-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, message: '' });

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post('https://itdesk-backend.vercel.app/api/users/login', formData, {
        withCredentials: true,
      });
      login(res.data.token); // Save token and set isAuthenticated to true
      setToast({ show: true, message: 'Login successful!' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response);
      setToast({ show: true, message: err.response.data['message']});
    }
  };


  const responseGoogle = async (response) => {
    console.log(response);
    const decodedToken = decodeToken(response.credential);
    if (decodedToken) {
      const { sub } = decodedToken;
      const loginData = {
        googleId: sub,
        // You can include other data if needed
      };
  
      try {
        const res = await axios.post('https://itdesk-backend.vercel.app/api/users/login', loginData);
        console.log(res.data);
        login(res.data.token);
        setToast({ show: true, message: 'Login successful!' });
        navigate('/dashboard');
      } catch (error) {
        console.error(error.response.data);
        setToast({ show: true, message: error.response.data['message'] });
      }
    }
  };

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-gray-500">Welcome back! Please enter your details</p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.01]"
          >
            Sign in
          </button>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-8">
            <GoogleOAuthProvider clientId="36468434283-pj5p6ev61uasg63djvd4bv85ho4inm1r.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={responseGoogle}
                onError={() => console.log('Login Failed')}
                useOneTap
                shape="pill"
                theme="filled_blue"
                size="large"
                width="100%"
                logo_alignment="center"
              />
            </GoogleOAuthProvider>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign up
          </a>
        </div>
      </div>

      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast className="border border-gray-200 shadow-xl">
            <div className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${toast.message.includes('success') ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {toast.message.includes('success') ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <Toast.Toggle onClick={() => setToast({ ...toast, show: false })} />
          </Toast>
        </div>
      )}
    </div>
  );
};

export default Login;
