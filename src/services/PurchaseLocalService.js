import BaseService from './BaseService';

const PurchaseLocalService = {
  createNewPurchaseLocal: (purchaseLocal, user) => {
    return BaseService.post('/purchaseLocal', purchaseLocal, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  findNearBy: (coordinates, user) => {
    return BaseService.post('/purchaseLocal/find-near', coordinates, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  findByUser: (user) => {
    return BaseService.get('/purchaseLocal/by-user', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default PurchaseLocalService;
