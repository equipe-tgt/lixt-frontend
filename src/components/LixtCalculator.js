import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, HStack, Button } from 'native-base';
import PropTypes from 'prop-types';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';
import { AuthContext } from '../context/AuthProvider';
import { useTranslation } from 'react-i18next';

export default function LixtCalculator({ items, isGeneralView }) {
  const [totalPrice, setTotalPrice] = useState(0);
  const { t } = useTranslation();
  const { checkedItems } = useContext(CheckedItemsContext);
  const { user } = useContext(AuthContext);

  const getTotalPrice = () => {
    if (items && items.length > 0) {
      let productsToCount = [];
      let finalPrice = 0;

      if (isGeneralView) {
        // se a pessoa estiver na visão geral pega todos os productsOfList que estão aglutinados
        productsToCount.push(...items.map((item) => item.productsOfLists));
        productsToCount = productsToCount.flat();
      } else {
        productsToCount = items;
      }

      for (const productToCount of productsToCount) {
        // se está marcado localmente
        if (checkedItems.includes(productToCount.id)) {
          finalPrice += productToCount.price
            ? productToCount.price * productToCount.amount
            : 0;
          continue;
        }

        // se já foi comprado e foi você quem comprou
        if (
          productToCount.isMarked &&
          productToCount.userWhoMarkedId === user.id
        ) {
          finalPrice += productToCount.price
            ? productToCount.price * productToCount.amount
            : 0;
        }
      }
      setTotalPrice(finalPrice);
    }
  };

  useEffect(() => {
    getTotalPrice();
  }, [checkedItems]);

  useEffect(() => {
    getTotalPrice();
  }, [items]);

  return (
    <Box
      position="absolute"
      bottom={5}
      left={5}
      width="90%"
      height="15%"
      minHeight={50}
      borderRadius="md"
      bgColor="#fff"
      shadow={3}
      justifyContent="center"
    >
      <HStack justifyContent="space-around" alignItems="center">
        <Box flexDirection="row" alignItems="center">
          <Text fontWeight="bold" fontSize="lg">
            Total
          </Text>
          <Text fontSize="lg" ml={2}>
            {t('currency')} {totalPrice}
          </Text>
        </Box>
        <Button
          onPress={() => {}}
          isDisabled={items.length === 0}
          variant="outline"
        >
          {t('savePurchase')}
        </Button>
      </HStack>
    </Box>
  );
}

LixtCalculator.propTypes = {
  items: PropTypes.array,
  isGeneralView: PropTypes.bool,
};
