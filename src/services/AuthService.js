import BaseService from './BaseService';
import { Base64 } from '../utils/base64Utils';

// Valores de autenticação da API
const CLIENT_ID = 'client';
const SECRET_ID = '123456';

const STRING_API_AUTH = `${CLIENT_ID}:${SECRET_ID}`;

const AuthService = {
  doLogin: (username, password) => {
    const dataLogin = new FormData();

    dataLogin.append('username', username);
    dataLogin.append('password', password);
    dataLogin.append('grant_type', 'password');

    return BaseService.post('/oauth/token', dataLogin, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${Base64.btoa(STRING_API_AUTH)}`,
      },
    });
  },

  refreshToken: (refreshToken) => {
    const dataForRefresh = new FormData();
    dataForRefresh.append('refresh_token', refreshToken);
    dataForRefresh.append('grant_type', 'refresh_token');

    return BaseService.post('/oauth/token', dataForRefresh, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: `Basic ${Base64.btoa(STRING_API_AUTH)}`,
      },
    });
  },
  getUserData: () => {
    return BaseService.get('/auth/data-user', {
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${Base64.btoa(STRING_API_AUTH)}`,
      },
    });
  },
  putGlobalCommentsPreference: (userDetails) => {
    return BaseService.put('/auth/global-comments-preferences', userDetails, {
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${Base64.btoa(STRING_API_AUTH)}`,
      },
    });
  }
};

export default AuthService;
