import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, HStack, Button } from 'native-base';
import PropTypes from 'prop-types';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';
import { useTranslation } from 'react-i18next';
import { convertDecimalBasedOnLanguage } from '../utils/convertion'

export default function LixtCalculator({
  items,
  finishPurchase,
  loadingPurchase,
}) {
  const { t } = useTranslation();
  const { checkedItems } = useContext(CheckedItemsContext);

  const [totalPrice, setTotalPrice] = useState(0);

  const getTotalPrice = () => {
    let finalPrice = 0;

    // Se houver itens checados
    if (checkedItems && checkedItems.length > 0) {
      // Calcula o preço total do carrinho acumulando preço * quantidade de
      // todos os itens
      finalPrice = checkedItems.reduce((accumulator, currentItem) => {
        let price = currentItem.price || 0;
        price = price * currentItem.amount;

        return price + accumulator;
      }, 0);
    }
    setTotalPrice(finalPrice);
  };

  // Se mudar quais itens estão checados o componente deve recalcular o valor
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
      testID="lixt-calculator"
    >
      <HStack justifyContent="space-around" alignItems="center">
        <Box flexDirection="row" alignItems="center">
          <Text fontWeight="bold" fontSize="lg">
            Total
          </Text>
          <Text testID="total-price-text" fontSize="lg" ml={2}>
            {convertDecimalBasedOnLanguage(totalPrice)}
          </Text>
        </Box>
        <Button
          testID="button-save-purchase"
          onPress={() => {
            finishPurchase(checkedItems, totalPrice);
          }}
          isLoading={loadingPurchase}
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
  loadingPurchase: PropTypes.bool,
  finishPurchase: PropTypes.func,
};
