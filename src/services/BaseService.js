import axios from "axios";
import { Base64 } from "../utils/base64";

/**
@todo alterar valor vazio de URL para valor do endereço da API em produção
*/

// Define o valor da URL que será utilizada para consulta da API baseado na variável __DEV__ que informa
// se está em produção ou em desenvolvimento
// USAR SEU IP pegue o valor de ipv4 gerado pelo comando "ipconfig" no cmd
const BASE_URL = __DEV__ ? "http://192.168.1.186:8080" : "";

// Valores de acesso da API
const clientId = "client";
const secretId = "123456";

const stringAcesso = `${clientId}:${secretId}`;

/**
 * Cria um objeto customizado do axios para fazer requisições
 * a partir das configurações da aplicação
 * (configurações como endereço da API, etc)
 */
const BaseService = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Basic ${Base64.btoa(stringAcesso)}`,
  },
});

export default BaseService;
