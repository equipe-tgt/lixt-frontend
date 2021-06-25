import React, { useState } from "react";
import AuthService from "../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserService from "../services/UserService";

export const AuthContext = React.createContext({
  user: null,
  signed: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  async function signIn(username, password) {
    try {
      // Chama o serviço de autenticação
      const responseAuth = await AuthService.doLogin(username, password);

      // Chama o serviço de usuário para pegar os detalhes do usuário que acabou de logar
      const responseUser = await UserService.getUser(
        responseAuth.data.access_token
      );

      // Armazena o usuário no contexto da aplicação, que poderá ser acessado de qualquer página
      setUser({
        id: responseUser.data.id,
        username: responseUser.data.username,
        email: responseUser.data.email,
        name: responseUser.data.name,
        token: responseAuth.data.access_token,
      });

      // Adicionar nome e senha no async Storage o que nos permitirá logar o usuário assim que
      // ele abrir novamente a aplicação
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ username, password })
      );
    } catch (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login: async (username, password) => {
          await signIn(username, password);
        },
        logout: () => {
          setUser(null);
          AsyncStorage.removeItem("user");
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
