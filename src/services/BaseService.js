import axios from "axios";

/**
@todo alterar valor vazio de URL para valor do endereço da API em produção
*/

// Define o valor da URL que será utilizada para consulta da API baseado na variável __DEV__ que informa
// se está em produção ou em desenvolvimento
// USAR SEU IP pegue o valor de ipv4 gerado pelo comando "ipconfig" no cmd
const BASE_URL = __DEV__ ? "http://192.168.1.186:8080" : "";
/**
 * Cria um objeto customizado do axios para fazer requisições
 * a partir das configurações da aplicação
 * (configurações como endereço da API, etc)
 */
const BaseService = axios.create({
  baseURL: BASE_URL,
});

export default BaseService;
