
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/users/';

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
