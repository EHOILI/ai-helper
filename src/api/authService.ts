
import axios from 'axios';

// Temporarily hardcode the production API URL to fix deployment issues
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const register = (username: string, password: string, school: string) => {
  return axios.post(`${API_URL}/users/register`, {
    username,
    password,
    school,
  });
};

const login = (username: string, password: string) => {
  return axios.post(`${API_URL}/users/login`, {
    username,
    password,
  });
};

const getSchools = () => {
  return axios.get(`${API_URL}/schools`);
};

const authService = {
  register,
  login,
  getSchools,
};

export default authService;
