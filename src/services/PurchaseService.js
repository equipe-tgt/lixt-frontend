import BaseService from './BaseService';

const PurchaseService = {
  createNewPurchase: (purchaseObject, user) => {
    return BaseService.post('/purchase', purchaseObject, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  getPurchases: (user) => {
    return BaseService.get('/purchase/by-user', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default PurchaseService;
