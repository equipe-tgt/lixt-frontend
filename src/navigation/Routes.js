import React, { useState, useEffect, useContext } from 'react';
import SplashScreen from '../screens/SplashScreen/SplashScreen';

import { useToast } from 'native-base';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../context/AuthProvider';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import WithAxios from '../utils/AxiosWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';

export default function Routes() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    gatherUserData();
  }, []);

  const gatherUserData = async () => {
    try {
      // Tenta pegar o valor da chave "tokens" do AsyncStorage
      const tokensString = await AsyncStorage.getItem('tokens');

      // Caso exista, usa o valor do refreshToken para gerar um
      // token novo e apartir do token novo requisita as informações do usuário
      // e as salva em contexto
      if (tokensString) {
        const { refreshToken } = JSON.parse(tokensString);

        const { data } = await AuthService.refreshToken(refreshToken);
        const userResponse = await UserService.getUser(data.access_token);

        // Armazena o novo access_token no AsyncStorage
        await AsyncStorage.setItem(
          'tokens',
          JSON.stringify({ refreshToken, accessToken: data.access_token })
        );

        const { id, email, name, username } = userResponse.data;

        setUser({
          id,
          username,
          email,
          name,
          token: data.access_token,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      // Se for um erro de servidor
      if (error?.response?.status) {
        useToast().show({
          status: 'warning',
          title: t('errorServerDefault'),
        });
      }
      // Se for um erro do AsynStorage
      else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  // Se o usuário está autenticado retorne a parte interna da aplicação
  // caso contrário retorne somente as telas de autenticação
  return !!user ? (
    // O componente WithAxios envolve a parte interna da aplicação, este componente
    <WithAxios>
      <AppTabs />
    </WithAxios>
  ) : (
    <AuthStack />
  );
}
