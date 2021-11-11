import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CartScreen from '../screens/CartScreen/CartScreen';
import CommentaryScreen from '../screens/CommentaryScreen/CommentaryScreen';
import ProductOfListDeatils from '../screens/ProductOfListDetails/ProductOfListDetails';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';
import PurchaseDetailScreen from '../screens/PurchaseDetailScreen/PurchaseDetailScreen';
import StatisticsScreen from '../screens/StatisticsScreen/StatisticsScreen';

import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

const stackHeaderStyle = {
  shadowOpacity: 0,
  elevation: 0,
  borderBottomWidth: 0,
};

export default function PurchaseStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Cart">
      <Stack.Screen
        name="Cart"
        options={{
          title: t('buy'),
          headerStyle: stackHeaderStyle,
        }}
        component={CartScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Commentaries"
        options={{ title: t('commentaries'), headerStyle: stackHeaderStyle }}
        component={CommentaryScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="ProductOfListDetails"
        options={{ title: t('edit'), headerStyle: stackHeaderStyle }}
        component={ProductOfListDeatils}
      ></Stack.Screen>
      <Stack.Screen
        name="History"
        options={{ title: t('history'), headerStyle: stackHeaderStyle }}
        component={HistoryScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="PurchaseDetail"
        options={{ title: t('purchase'), headerStyle: stackHeaderStyle }}
        component={PurchaseDetailScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Statistics"
        options={{ title: t('statistics'), headerStyle: stackHeaderStyle }}
        component={StatisticsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
