import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, HStack } from 'native-base';

import LixtNumberInput from '../components/LixtNumberInput';
import LixtMoneyInput from './LixtMoneyInput';

export default function LixtReviewItem({ productOfList, modifyItem }) {
  const [amount, setAmount] = useState(productOfList.amount);
  const [priceText, setPriceText] = useState(productOfList.price);
  useEffect(() => {
    if (amount) {
      modifyItem('amount', amount, productOfList);
    }
  }, [amount]);

  useEffect(() => {
    modifyItem('price', convertCurrencyString(priceText), productOfList);
  }, [priceText]);

  const convertCurrencyString = (value) => {
    let parsedValue = value || 0;

    if (typeof value === 'string' && value.includes(',')) {
      const stringFormatted = value?.replace(',', '.');
      parsedValue = parseFloat(stringFormatted);
    }
    return parsedValue;
  };

  return (
    <Box>
      <Text fontWeight="bold" my={2}>
        {`${productOfList.name} - ${
          productOfList.measureType === 'UNITY'
            ? 'UN'
            : productOfList.measureType
        }`}
      </Text>
      <HStack alignItems="center" width="100%" space={3}>
        <Box width="30%">
          <LixtNumberInput
            labelName="amount"
            value={amount.toString()}
            onChangeText={(text) => {
              setAmount(parseInt(text));
            }}
          />
        </Box>

        <Text mt={5}>x</Text>

        <Box width="30%">
          <LixtMoneyInput
            labelName="price"
            onChangeText={setPriceText}
            value={priceText}
          />
        </Box>
      </HStack>
    </Box>
  );
}

LixtReviewItem.propTypes = {
  productOfList: PropTypes.object,
  modifyItem: PropTypes.func,
  language: PropTypes.string,
};
