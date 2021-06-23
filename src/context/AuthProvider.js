import React, { useState } from "react";
import AuthService from "../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = React.createContext({
  user: null,
  signed: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /**
   * @todo tratar erros
   */
  async function signIn(username, password) {
    try {
      // Chama o serviço de autenticação
      const { data } = await AuthService.doLogin(username, password);

      // Armazena o usuário no contexto da aplicação, que poderá ser acessado de qualquer página
      setUser({ username: data.username, name: data.name });

      // Adicionar nome e senha no async Storage o que nos permitirá logar o usuário assim que
      // ele abrir novamente a aplicação
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ username, password })
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login: (username, password) => {
          signIn(username, password);
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
