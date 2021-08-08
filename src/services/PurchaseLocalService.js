import BaseService from './BaseService';

const PurchaseLocalService = {
  /**
   * @todo devido a mudanças na tratativa do escopo está fixo a latitude e longitude
   * até a correção prevista ser implementada
   */
  createNewPurchaseLocal: (name, user) => {
    return BaseService.post(
      '/purchaseLocal',
      {
        name,
        latitude: 23.6666,
        longitude: 20.7778,
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
  },

  findNearBy: (user) => {
    return BaseService.post(
      '/purchaseLocal/find-near',
      {
        latitude: 23.6666,
        longitude: 20.7778,
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
  },
};

export default PurchaseLocalService;
