import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';
import { SafeAreaView } from 'react-native';
import {
  Text,
  useToast,
  Spinner,
  FlatList,
  HStack,
  Pressable,
  Heading,
  Box,
} from 'native-base';
import { Entypo } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { screenBasicStyle as style } from '../../styles/style';
import { AuthContext } from '../../context/AuthProvider';
import PurchaseService from '../../services/PurchaseService';
import { useTranslation, getI18n } from 'react-i18next';

export default function HistoryScreen(props) {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(() => {
    fetchPurchases();
  });

  const getFormattedPurchaseDate = (date) => {
    return format(moment(date).toDate(), 'P', {
      locale: getI18n().language === 'pt_BR' ? ptBR : enUS,
    });
  };

  const getFormattedPurchaseLocalName = (name) => {
    // Se for um nome composto com o endereço pega somente o primeiro nome
    // que é o nome do estabelecimento
    if (name.includes(',')) {
      return name.slice(0, name.indexOf(','));
    }
    return name;
  };

  const fetchPurchases = async () => {
    try {
      const { data } = await PurchaseService.getPurchases(user);

      if (data && data.length > 0) {
        // Ordenando pela compra mais nova
        data.sort(
          (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
        );

        setPurchases(data);
      }
    } catch (error) {
      toast.show({
        title: t('errorServerDefault'),
        status: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={style.container}>
        <Spinner />
      </SafeAreaView>
    );
  }

  return purchases.length > 0 ? (
    <SafeAreaView style={style.container}>
      <FlatList
        keyExtractor={(item) => String(item.id)}
        data={purchases}
        testID="purchases-list"
        renderItem={({ item }) => (
          <Pressable
            testID="purchase-list-item"
            onPress={() => {
              props.navigation.navigate('PurchaseDetail', {
                purchase: item,
              });
            }}
            ml={5}
            py={3}
          >
            <Text
              fontSize="sm"
              mb={1}
              color="coolGray.800"
              alignSelf="flex-start"
            >
              {getFormattedPurchaseDate(item.purchaseDate)}
            </Text>
            <Heading size="lg">
              {t('currency')}
              {item.purchasePrice}
            </Heading>
            <HStack mt={1} alignItems="center">
              <Entypo name="shop" size={18} color="#4b5563" />
              <Text width={250} fontSize="sm" ml={2} color="coolGray.600">
                {getFormattedPurchaseLocalName(item?.purchaseLocal?.name)}
              </Text>
            </HStack>
          </Pressable>
        )}
      />
    </SafeAreaView>
  ) : (
    <Box alignItems="center" justifyContent="center" style={style.container}>
      <Text>{t('noPurchasesYet')}</Text>
    </Box>
  );
}

HistoryScreen.propTypes = {
  navigation: PropTypes.object,
};
