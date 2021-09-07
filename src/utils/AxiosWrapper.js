import { useContext, useMemo } from 'react';
import BaseService from '../services/BaseService';
import { AuthContext } from '../context/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';

const WithAxios = ({ children }) => {
  const { setUser, user } = useContext(AuthContext);

  useMemo(() => {
    // A cada resposta que o service pegar verifica:
    // se a resposta deu sucesso só prossegue
    // caso a resposta dê erro e o erro for 401, renova o token e tenta de novo
    BaseService.interceptors.response.use(
      (response) => response,
      (err) => {
        return new Promise(async (resolve, reject) => {
          // Pega a requisição original (que deu erro)
          const originalReq = err.config;

          if (err.response.status === 401 && err.config && !err.config._retry) {
            // Se a flag de retentativa não estiver marcada como true agora marca
            originalReq._retry = true;

            // Pega o refreshToken que tá armazenado no AsyncStorage
            const tokenString = await AsyncStorage.getItem('tokens');
            const { refreshToken } = JSON.parse(tokenString);

            try {
              // Faz a requisição de renovação do token
              const { data } = await AuthService.refreshToken(refreshToken);

              // Armazena o novo access_token no AsyncStorage
              await AsyncStorage.setItem(
                'tokens',
                JSON.stringify({ refreshToken, accessToken: data.access_token })
              );

              // Atualiza o token do usuário que está no AuthContext
              const userWithNewToken = Object.assign({}, user);
              userWithNewToken.token = data.access_token;
              setUser(userWithNewToken);

              // Refaz a requisição original com o novo token
              originalReq.headers[
                'Authorization'
              ] = `Bearer ${data.access_token}`;
              return resolve(originalReq);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(err);
            setUser(null);
          }
        });
      }
    );
  }, [setUser]);

  return children;
};

export default WithAxios;
