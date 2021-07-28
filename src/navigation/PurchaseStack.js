import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CartScreen from '../screens/CartScreen/CartScreen';
import NewListScreen from '../screens/NewListScreen/NewListScreen';

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
        name="NewList"
        options={{ title: t('newList'), headerStyle: stackHeaderStyle }}
        component={NewListScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
