import BaseService from '../services/BaseService';

const UserService = {
  doRegister: (user) => {
    return BaseService.post('/auth/register', user);
  },
  resetPassword: (email) => {
    return BaseService.post(`/auth/forget-password/${email}`);
  },
  updatePassword: (password, token) => {
    return BaseService.post('/auth/update-password', password, {
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getUser: (token) => {
    return BaseService.get('/auth/data-user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default UserService;
