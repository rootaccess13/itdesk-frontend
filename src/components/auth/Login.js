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
      const res = await axios.post('http://localhost:5001/api/users/login', formData);
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
        const res = await axios.post('http://localhost:5001/api/users/login', loginData);
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
    <>
      <GoogleOAuthProvider clientId="36468434283-pj5p6ev61uasg63djvd4bv85ho4inm1r.apps.googleusercontent.com">
        <form className="max-w-md mx-auto mt-4" onSubmit={onSubmit}>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="email"
              name="email"
              id="floating_email"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              value={email}
              onChange={onChange}
              required
            />
            <label
              htmlFor="floating_email"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="password"
              name="password"
              id="floating_password"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              value={password}
              onChange={onChange}
              required
            />
            <label
              htmlFor="floating_password"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Login
          </button>
          <div className="flex flex-col items-center justify-center mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or continue with</p>
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => {
                console.log('Login Failed');
              }}
              useOneTap
            />
          </div>
        </form>
      </GoogleOAuthProvider>

      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 4.707a1 1 0 00-1.414-1.414L7 11.586 4.707 9.293a1 1 0 00-1.414 1.414l3 3a 1 1 0 001.414 0l9-9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Check icon</span>
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <Toast.Toggle onClick={() => setToast({ ...toast, show: false })} />
          </Toast>
        </div>
      )}
    </>
  );
};

export default Login;
