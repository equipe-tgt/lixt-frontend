import axios from 'axios';

// Define o valor da URL que será utilizada para consulta da API baseado na variável __DEV__ que informa
// se está em produção ou em desenvolvimento
// USAR SEU IP pegue o valor de ipv4 gerado pelo comando "ipconfig" no cmd

// eslint-disable-next-line no-undef
const BASE_URL = __DEV__
  ? 'http://192.168.1.187:8080'
  : 'https://lixt-ws.azurewebsites.net';
console.log('BASE_URL: ', BASE_URL);

// Para testar o endereço do backe-end em produção mas com o app em desenvolvimento descomente essa linha e
// comente as linhas superiores do BASE_URL
// const BASE_URL = "https://lixt-ws.azurewebsites.net";

/**
 * Cria um objeto customizado do axios para fazer requisições
 * a partir das configurações da aplicação
 * (configurações como endereço da API, etc)
 */
const BaseService = axios.create({
  baseURL: BASE_URL,
});

export default BaseService;
