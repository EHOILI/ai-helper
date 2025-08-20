
import axios from 'axios';

// Temporarily hardcode the production API URL to fix deployment issues
const API_URL = `${process.env.REACT_APP_API_URL}/api/users/`;

const register = (username: string, password: string) => {
  return axios.post(API_URL + 'register', {
    username,
    password,
  });
};

const login = (username: string, password: string) => {
  return axios.post(API_URL + 'login', {
    username,
    password,
  });
};

const authService = {
  register,
  login,
};

export default authService;
