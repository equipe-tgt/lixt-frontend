import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { FontAwesome5, Entypo } from '@expo/vector-icons';
import { format } from 'date-fns';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { Box, Text, HStack, Accordion, ScrollView } from 'native-base';
import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation, getI18n } from 'react-i18next';
import { convertDecimalBasedOnLanguage } from '../../utils/convertion';

export default function PurchaseDetailScreen(props) {
  const { t } = useTranslation();
  const [purchase, setPurchase] = useState({
    purchasePrice: 0,
    purchaseLists: [],
  });

  useFocusEffect(() => {
    if (props.route.params.purchase) {
      setPurchase(props.route.params.purchase);
    } else {
      props.navigation.navigate('History');
    }
  });

  const getFormattedPurchaseDate = (date) => {
    return format(moment(date).toDate(), 'P', {
      locale: getI18n().language === 'pt_BR' ? ptBR : enUS,
    });
  };

  const getTotalOfItems = () => {
    if (purchase.purchaseLists.length > 0) {
      return purchase.purchaseLists.reduce((acc, currentPurchaseList) => {
        return acc + getAmountFromItems(currentPurchaseList.itemsOfPurchase);
      }, 0);
    }
    return 0;
  };

  const getAmountFromItems = (itemsOfPurchase) => {
    return itemsOfPurchase.reduce((acc, currentItemOfPurchase) => {
      return acc + currentItemOfPurchase.amount;
    }, 0);
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView>
        {/* Dados gerais da compra */}
        <Box mt={5} alignItems="center">
          <Text testID="purchase-price-text" bold fontSize={42}>
            {convertDecimalBasedOnLanguage(purchase.purchasePrice)}
          </Text>

          <HStack alignItems="center">
            <FontAwesome5 name="calendar-check" size={16} color="#4b5563" />
            <Text color="coolGray.600" ml={2}>
              {t('purchaseMadeIn')}
            </Text>
          </HStack>

          <Text width="80%" textAlign="center" testID="purchase-date">
            {getFormattedPurchaseDate(purchase.purchaseDate)}
          </Text>

          <HStack alignItems="center" mt={2}>
            <Entypo name="shop" size={16} color="#4b5563" />
            <Text color="coolGray.600" ml={2}>
              {t('purchaseLocal')}:
            </Text>
          </HStack>

          <Text
            testID="purchase-local-text"
            fontSize="sm"
            width="80%"
            textAlign="center"
          >
            {purchase?.purchaseLocal?.name}
          </Text>
        </Box>

        <HStack mx="auto" width="90%" justifyContent="space-around" my={5}>
          <Box>
            <Text testID="purchase-total-items" textAlign="center">
              {t('totalAmountItems')}
            </Text>
            <Text textAlign="center">{getTotalOfItems()}</Text>
          </Box>
          <Box>
            <Text textAlign="center">{t('includedLists')}</Text>
            <Text testID="purchase-lists" textAlign="center">
              {purchase.purchaseLists.length}
            </Text>
          </Box>
        </HStack>

        {/* Accordion das listas de itens */}
        <Text bold ml={5}>
          {t('purchaseLists')}
        </Text>
        {purchase.purchaseLists.length > 0 ? (
          <Accordion
            testID="purchase-lists-details"
            width="95%"
            mx="auto"
            mt={3}
          >
            {purchase.purchaseLists.map((purchaseList) => {
              return (
                <Accordion.Item key={purchaseList.id}>
                  <Accordion.Summary
                    _expanded={{ backgroundColor: 'primary.200' }}
                    py={5}
                  >
                    <Box>
                      <Text bold fontSize={20}>
                        {purchaseList.nameList}
                      </Text>
                      <Text>
                        {convertDecimalBasedOnLanguage(
                          purchaseList.partialPurchasePrice || 0
                        )}
                      </Text>
                    </Box>
                    <Accordion.Icon />
                  </Accordion.Summary>
                  <Accordion.Details>
                    {purchaseList.itemsOfPurchase.map((item) => (
                      <Box my={2} key={item.id}>
                        <Text bold>{item.name}</Text>
                        <Text color="gray.500">{`${t('purchasedAmount')}: ${
                          item.amount
                        }`}</Text>
                        <Text color="gray.500">
                          {convertDecimalBasedOnLanguage(item.price || 0)}
                        </Text>
                      </Box>
                    ))}
                  </Accordion.Details>
                </Accordion.Item>
              );
            })}
          </Accordion>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

PurchaseDetailScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
