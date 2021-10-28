import React, { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native';
import { Text, useToast, Spinner } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

import { screenBasicStyle as style } from '../../styles/style';
import { AuthContext } from '../../context/AuthProvider';
import PurchaseService from '../../services/PurchaseService';
import { useTranslation } from 'react-i18next';

export default function HistoryScreen() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(() => {
    fetchPurchases();
  });

  const fetchPurchases = async () => {
    try {
      const { data } = await PurchaseService.getPurchases(user);
      setPurchases(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={style.container}>
        <Spinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={style.container}>
      <Text>Tela do histórico</Text>
    </SafeAreaView>
  );
}
