import BaseService from './BaseService';

const ProductService = {
  getProductByName: (name, user) => {
    return BaseService.get(`/product/by-name/${name}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  createProduct: (product, user) => {
    return BaseService.post('/product', product, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default ProductService;
