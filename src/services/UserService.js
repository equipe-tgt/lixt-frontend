import BaseService from '../services/BaseService';
import { getI18n } from 'react-i18next';

const UserService = {
  doRegister: (user) => {
    return BaseService.post('/auth/register', user, {
      params: {
        language: getI18n()?.language === 'pt_BR' ? 'pt-br' : 'en-us',
      },
    });
  },
  resetPassword: (email) => {
    console.log('lang', getI18n().language);
    return BaseService.post(`/auth/forget-password`, email, {
      headers: {
        'Content-Type': 'text/plain',
      },
      params: {
        language: getI18n()?.language === 'pt_BR' ? 'pt-br' : 'en-us',
      },
    });
  },
  updatePassword: (password, token) => {
    return BaseService.post('/auth/update-password', password, {
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${token}`,
      },
      params: {
        language: getI18n()?.language === 'pt_BR' ? 'pt-br' : 'en-us',
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
  revokeToken: (token) => {
    return BaseService.get('/auth/revoke-token', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default UserService;
