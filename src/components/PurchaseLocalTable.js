import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  Text,
  Accordion,
  Box,
  HStack,
  VStack,
  Pressable,
  Button,
  Icon,
} from 'native-base';
import { AntDesign, Entypo } from '@expo/vector-icons';
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

export default function PurchaseLocalTable({
  preFormattedData,
  translate,
  monetaryNotation,
}) {
  const [formattedData, setFormattedData] = useState([]);
  const [currentSortingOption, setCurrentSortingOption] = useState(
    SortingOptions.LAST_PURCHASE
  );
  const [currentSortingOrder, setCurrentSortingOrder] = useState(
    SortingOrders.DESC
  );

  // Ao receber a prop dos dados do servidor começa a formatar e seta
  // o formattedData
  useEffect(() => {
    (async () => {
      const firstFormatted = await getFormattedData(preFormattedData);
      setFormattedData(firstFormatted);
    })();
  }, [preFormattedData]);

  // Ao modificar o parâmetro de listagem ou a ordenação, ordena e
  // organiza a lista
  useEffect(() => {
    setFormattedData(sortList());
  }, [currentSortingOption, currentSortingOrder]);

  // Pega todos os itens e aqueles que tiverem subname (nome da rua, número da casa e etc por conta
  // da API do MapBox) separa entre name e subname e aglutina num objeto com o restante dos dados
  // método usado somente na primeira vez que passa os dados pra cá
  const getFormattedData = async (data) => {
    const localFormattedData = data.map((preData) => {
      const nameAndSubname = getFormattedPurchaseLocalName(
        preData.purchaseLocalName
      );

      return {
        ...preData,
        ...nameAndSubname,
      };
    });
    return sortList(localFormattedData);
  };

  // O parâmetro list só é preenchido na primeira vez que renderiza o componente
  // depois o valor que será usado será formattedData (que passa de um array vazio para um preenchido
  // e ordenado no final da rendereização)
  const sortList = (list = null) => {
    const copy = list || [...formattedData];
    return copy.sort((a, b) => {
      if (currentSortingOrder === SortingOrders.ASC) {
        return a[currentSortingOption] > b[currentSortingOption];
      }
      return a[currentSortingOption] < b[currentSortingOption];
    });
  };

  // Caso o nome do local da compra tiver vírgula quer dizer que veio do MapBox
  // e aí separa o nome do estabelecimento pelo que vem até a primeira vírgula e o restante
  // "subname" é o endereço. Caso o nome não tiver vírgula, só retorna
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

  return (
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
              <HStack width="90%" alignItems="center">
                <Entypo name="shop" size={18} color="#4b5563" />

                <Box ml={3}>
                  <Text fontSize={16} width="60%">
                    {data.name}
                  </Text>
                  {data?.subname && (
                    <Text width="65%" fontSize={12}>
                      {data?.subname}
                    </Text>
                  )}
                </Box>
              </HStack>

              <Accordion.Icon />
            </Accordion.Summary>
            <Accordion.Details>
              <VStack mb={3} flexWrap="wrap">
                <Box py={2}>
                  <Text fontWeight="bold">{translate('totalValue')}</Text>
                  <Text>{`${monetaryNotation} ${data.totalValue}`}</Text>
                </Box>

                <Box py={2}>
                  <Text fontWeight="bold">{translate('averageValue')}</Text>
                  <Text>{`${monetaryNotation} ${data.averageValue}`}</Text>
                </Box>

                <Box py={2}>
                  <Text fontWeight="bold">{translate('purchaseAmount')}</Text>
                  <Text>{data.purchaseAmount}</Text>
                </Box>

                <Box py={2}>
                  <Text fontWeight="bold">{translate('firstPurchase')}</Text>
                  <Text>{formatDate(data.firstPurchase)}</Text>
                </Box>

                <Box py={2}>
                  <Text fontWeight="bold">{translate('lastPurchase')}</Text>
                  <Text>{formatDate(data.lastPurchase)}</Text>
                </Box>
              </VStack>
            </Accordion.Details>
          </Accordion.Item>
        ))}
      </Accordion>
    </SafeAreaView>
  );
}

PurchaseLocalTable.propTypes = {
  preFormattedData: PropTypes.array,
  translate: PropTypes.func,
  monetaryNotation: PropTypes.string,
};
