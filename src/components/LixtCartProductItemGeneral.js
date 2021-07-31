import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Pressable, Box, Text, Checkbox, useToast } from 'native-base';

import { AuthContext } from '../context/AuthProvider';
import ProductOfListService from '../services/ProductOfListService';
import { useTranslation } from 'react-i18next';

const LixtCartProductItemGeneral = ({
  wrappedProduct,
  navigate,
  refreshList,
}) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [quantities, setQuantities] = useState({});
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (wrappedProduct?.priceAndAmounts) {
      setQuantities(getQuantityObject());
    }

    if (wrappedProduct?.markings) {
      console.log(wrappedProduct?.markings);
      setIsChecked(wrappedProduct.markings.every((m) => m));
    }
  }, [wrappedProduct]);

  const sumQuantities = (quantityArray) => {
    let finalValue = 0;

    finalValue = quantityArray.reduce((acc, currentPrice) => {
      return (acc += currentPrice);
    }, 0);

    return finalValue;
  };

  const getQuantityObject = () => {
    let finalAmount = 0;
    const allPrices = [];

    for (const { price, amount } of wrappedProduct?.priceAndAmounts) {
      const amountValue = amount || 1;
      const priceValue = price || 0;

      if (amount) finalAmount += amount;

      allPrices.push(priceValue * amountValue);
    }

    return {
      price: sumQuantities(allPrices),
      amount: finalAmount,
    };
  };

  return wrappedProduct ? (
    <Pressable
      flexDirection="row"
      key={wrappedProduct.productId}
      my={3}
      alignItems="center"
    >
      <Box mr={5}>
        <Checkbox
          accessibilityLabel={t('markItem')}
          value={isChecked}
          isChecked={isChecked}
          size="md"
        />
      </Box>

      <Box>
        <Text strikeThrough={isChecked} fontWeight="bold">
          {wrappedProduct.product.name}
        </Text>

        <Box>
          <Text>qt. {quantities.amount || 0}</Text>

          <Text>{quantities.price ? `R$ ${quantities.price}` : 'R$ 0,00'}</Text>
        </Box>

        <Text fontSize="sm">
          {wrappedProduct && wrappedProduct?.inLists
            ? `${t('includedIn')} ${wrappedProduct.inLists
                .map((l) => l.name)
                .join(', ')}`
            : null}
        </Text>
      </Box>
    </Pressable>
  ) : null;
};

export default LixtCartProductItemGeneral;

LixtCartProductItemGeneral.propTypes = {
  navigate: PropTypes.func,
  wrappedProduct: PropTypes.object,
  refreshList: PropTypes.func,
};
