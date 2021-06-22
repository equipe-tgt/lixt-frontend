import React, { useState, useEffect, useContext } from "react";
import { View, ActivityIndicator } from "react-native";

import { AuthContext } from "../context/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

export default function Routes() {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doLogin = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          let { username, password } = JSON.parse(userString);
          login(username, password);
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    doLogin();
  }, []);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Se o usuário está autenticado retorne a parte interna da aplicação
  // caso contrário retorne somente as telas de autenticação
  return !!user ? <AppTabs /> : <AuthStack />;
}
