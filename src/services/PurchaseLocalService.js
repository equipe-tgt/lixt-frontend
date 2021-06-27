import BaseService from "./BaseService";

const PurchaseLocalService = {

  createPurchaseLocal: (purchaseLocal, user) => {
    return BaseService.post("/purchaseLocal", purchaseLocal, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

};

export default PurchaseLocalService;
