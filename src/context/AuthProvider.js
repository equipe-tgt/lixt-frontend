import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthService from '../services/AuthService';
import UserService from '../services/UserService';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    // Chama o serviço de autenticação
    const responseAuth = await AuthService.doLogin(username, password);
    const accessToken = responseAuth.data.access_token;

    // Chama o serviço de usuário para pegar os detalhes do usuário que acabou de logar
    const responseUser = await UserService.getUser(accessToken);

    const { id, email, name } = responseUser.data;

    // Armazena o usuário no contexto da aplicação, que poderá ser acessado de qualquer página
    setUser({
      id,
      username,
      email,
      name,
      token: accessToken,
    });

    // Adicionar nome e senha no async Storage o que nos permitirá logar o usuário assim que
    // ele abrir novamente a aplicação
    await AsyncStorage.setItem('user', JSON.stringify({ username, password }));
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('lastSelectedList');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.object,
};
