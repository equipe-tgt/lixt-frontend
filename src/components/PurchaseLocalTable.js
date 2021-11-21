import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  Center,
  Text,
  Accordion,
  Box,
  HStack,
  Pressable,
  Button,
  Icon,
} from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';

import { getI18n } from 'react-i18next';

const SortingOrders = {
  ASC: 0,
  DESC: 1,
};

const SortingOptions = {
  LAST_PURCHASE: 'lastPurchase',
  PURCHASE_AMOUNT: 'purchaseAmount',
  TOTAL_SPENT: 'totalValue',
};

export default function PurchaseLocalTable({ preFormattedData, translate }) {
  const [formattedData, setFormattedData] = useState([]);
  const [currentSortingOption, setCurrentSortingOption] = useState(
    SortingOptions.LAST_PURCHASE
  );
  const [currentSortingOrder, setCurrentSortingOrder] = useState(
    SortingOrders.DESC
  );

  useEffect(() => {
    getFormattedData();
  }, [preFormattedData]);

  useEffect(() => {
    sortList();
  }, [currentSortingOption, currentSortingOrder]);

  const getFormattedData = () => {
    const formattedData = preFormattedData.map((preData) => {
      const nameAndSubname = getFormattedPurchaseLocalName(
        preData.purchaseLocalName
      );

      return {
        ...preData,
        ...nameAndSubname,
      };
    });
    sortList(formattedData);
  };

  const sortList = (list = null) => {
    const copy = list || [...formattedData];
    copy.sort((a, b) => {
      if (currentSortingOrder === SortingOrders.ASC) {
        return a[currentSortingOption] > b[currentSortingOption];
      }
      return a[currentSortingOption] < b[currentSortingOption];
    });
    setFormattedData(copy);
  };

  const getFormattedPurchaseLocalName = (val) => {
    if (val.includes(',')) {
      return {
        name: val.slice(0, val.indexOf(',')),
        subname: val.slice(val.indexOf(',') + 1),
      };
    }
    return {
      name: val,
    };
  };

  const isOptionSelected = (option) => {
    return SortingOptions[option] === currentSortingOption;
  };

  const changeCurrentOrder = () => {
    if (currentSortingOrder === SortingOrders.ASC) {
      setCurrentSortingOrder(SortingOrders.DESC);
    } else {
      setCurrentSortingOrder(SortingOrders.ASC);
    }
  };

  const formatDate = (val) => {
    const formatString =
      getI18n().language === 'pt_BR' ? 'DD/MM/yyyy' : 'MM/DD/yyyy';

    return moment(val).format(formatString);
  };

  return preFormattedData.length > 0 ? (
    <SafeAreaView>
      <HStack width="80%" alignItems="center" mb={3}>
        <HStack justifyContent="space-around">
          {Object.keys(SortingOptions).map((option, index) => (
            <Pressable
              backgroundColor={isOptionSelected(option) ? '#22d3ee' : '#fff'}
              borderRadius={isOptionSelected(option) ? 4 : 0}
              py={4}
              px={3}
              key={index}
              onPress={() => {
                setCurrentSortingOption(SortingOptions[option]);
              }}
            >
              <Text
                fontSize={12}
                color={isOptionSelected(option) ? '#fff' : '#333'}
              >
                {translate(SortingOptions[option])}
              </Text>
            </Pressable>
          ))}
        </HStack>

        <Button
          ml={5}
          variant="outline"
          onPress={changeCurrentOrder}
          startIcon={
            <Icon
              size={4}
              as={
                <AntDesign
                  name={
                    currentSortingOrder === SortingOrders.ASC
                      ? 'arrowup'
                      : 'arrowdown'
                  }
                />
              }
            />
          }
        />
      </HStack>
      <Accordion>
        {formattedData.map((data) => (
          <Accordion.Item key={data.name}>
            <Accordion.Summary
              _expanded={{ backgroundColor: 'primary.200' }}
              py={5}
            >
              <Box width="90%">
                <Text fontSize={16} width="60%">
                  {data.name}
                </Text>
                {data?.subname && (
                  <Text width="75%" fontSize={12}>
                    {data?.subname}
                  </Text>
                )}
              </Box>

              <Accordion.Icon />
            </Accordion.Summary>
            <Accordion.Details>
              <HStack mb={3} flexWrap="wrap">
                <Box width="33.3%" py={2}>
                  <Text>Valor total</Text>
                  <Text>{data.totalValue}</Text>
                </Box>

                <Box width="33.3%" py={2}>
                  <Text>Valor médio</Text>
                  <Text>{data.averageValue}</Text>
                </Box>

                <Box width="33.3%" py={2}>
                  <Text>Qtd. de compras</Text>
                  <Text>{data.purchaseAmount}</Text>
                </Box>

                <Box width="33.3%" py={2}>
                  <Text>Primeira compra</Text>
                  <Text>{formatDate(data.firstPurchase)}</Text>
                </Box>

                <Box width="33.3%" py={2}>
                  <Text>Última compra</Text>
                  <Text>{formatDate(data.lastPurchase)}</Text>
                </Box>
              </HStack>
            </Accordion.Details>
          </Accordion.Item>
        ))}
      </Accordion>
    </SafeAreaView>
  ) : (
    <Center>
      <Text textAlign="center">{translate('noPurchaseLocalsFound')}</Text>
    </Center>
  );
}

PurchaseLocalTable.propTypes = {
  preFormattedData: PropTypes.array,
  translate: PropTypes.func,
};
