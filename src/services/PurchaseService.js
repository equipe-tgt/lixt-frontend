import BaseService from './BaseService';

const PurchaseService = {
  createNewPurchase: (purchaseObject, user) => {
    return BaseService.post('/purchase', purchaseObject, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default PurchaseService;
