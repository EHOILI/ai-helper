
import api from './index';

const register = (username: string, password: string, school: string) => {
  return api.post('/users/register', {
    username,
    password,
    school,
  });
};

const login = (username: string, password: string) => {
  return api.post('/users/login', {
    username,
    password,
  });
};

const getSchools = () => {
  return api.get('/schools');
};

const authService = {
  register,
  login,
  getSchools,
};

export default authService;
