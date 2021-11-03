import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { FontAwesome5 } from '@expo/vector-icons';
import { format } from 'date-fns';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';

import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { Box, Text, HStack, Accordion, ScrollView, Tabs } from 'native-base';
import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation, getI18n } from 'react-i18next';

export default function PurchaseDetailScreen(props) {
  const { t } = useTranslation();
  const [purchase, setPurchase] = useState({
    purchasePrice: 0,
    purchaseLists: [],
  });
  const [purchaseItems, setPurchaseItems] = useState([]);

  useFocusEffect(() => {
    if (props.route.params.purchase) {
      console.log(props.route.params.purchase);
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
        <Box mt={5} alignItems="center">
          <Text bold fontSize={42}>
            {t('currency')}
            {purchase.purchasePrice}
          </Text>

          <HStack alignItems="center">
            <FontAwesome5 name="calendar-check" size={16} color="#4b5563" />
            <Text color="coolGray.600" ml={2}>
              {t('purchaseMadeIn')}
            </Text>
          </HStack>

          <Text width="80%" textAlign="center">
            {getFormattedPurchaseDate(purchase.purchaseDate)}
          </Text>

          <HStack alignItems="center" mt={2}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#4b5563" />
            <Text color="coolGray.600" ml={2}>
              {t('purchaseLocal')}:
            </Text>
          </HStack>

          <Text width="80%" mt={2} textAlign="center">
            {purchase?.purchaseLocal?.name}
          </Text>
        </Box>

        <HStack mx="auto" width="90%" justifyContent="space-around" mb={5}>
          <Box>
            <Text textAlign="center">{t('totalAmountItems')}</Text>
            <Text textAlign="center">{getTotalOfItems()}</Text>
          </Box>
          <Box>
            <Text textAlign="center">{t('includedLists')}</Text>
            <Text textAlign="center">{purchase.purchaseLists.length}</Text>
          </Box>
        </HStack>

        <Text bold ml={5}>
          {t('purchaseLists')}
        </Text>
        {purchase.purchaseLists.length > 0 && (
          <Accordion width="95%" mx="auto" mt={3}>
            {purchase.purchaseLists.map((purchaseList) => {
              return (
                <Accordion.Item key={purchaseList.id}>
                  <Accordion.Summary py={5}>
                    <Text bold fontSize="lg">
                      {purchaseList.listId}
                    </Text>
                    <Accordion.Icon />
                  </Accordion.Summary>
                  <Accordion.Details>
                    {purchaseList.itemsOfPurchase.map((item) => (
                      <Box my={2} key={item.id}>
                        <Text bold>{item.name}</Text>
                        <Text>{`${t('amount')} ${item.amount}`}</Text>
                        <Text>{`${t('price')} ${t('currency')} ${
                          item.price || 0
                        }`}</Text>
                      </Box>
                    ))}
                  </Accordion.Details>
                </Accordion.Item>
              );
            })}
          </Accordion>
        )}
        {/* <Tabs isFitted>
          <Tabs.Bar>
            <Tabs.Tab>Resumo</Tabs.Tab>
            <Tabs.Tab>Detalhado</Tabs.Tab>
          </Tabs.Bar>
          <Tabs.Views>
            <Tabs.View>
              <Box>
                <Text>{t('totalAmount')}</Text>
                <Text>{getTotalOfItems()}</Text>
              </Box>
              <Box>
                <Text>{t('amountOfLists')}</Text>
                <Text>{purchase.purchaseLists.length}</Text>
              </Box>
            </Tabs.View>
            <Tabs.View>
              {purchase.purchaseLists.length > 0 && (
                <Accordion defaultIndex={[0]} mt={3}>
                  {purchase.purchaseLists.map((purchaseList) => {
                    return (
                      <Accordion.Item key={purchaseList.id}>
                        <Accordion.Summary py={5}>
                          <Text bold fontSize="lg">
                            {purchaseList.listId}
                          </Text>
                          <Accordion.Icon />
                        </Accordion.Summary>
                        <Accordion.Details>
                          {purchaseList.itemsOfPurchase.map((item) => (
                            <Box my={2} key={item.id}>
                              <Text bold>{item.name}</Text>
                              <Text>{`${t('amount')} ${item.amount}`}</Text>
                              <Text>{`${t('price')} ${t('currency')} ${
                                item.price || 0
                              }`}</Text>
                            </Box>
                          ))}
                        </Accordion.Details>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              )}
            </Tabs.View>
          </Tabs.Views>
        </Tabs> */}
      </ScrollView>
    </SafeAreaView>
  );
}

PurchaseDetailScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
