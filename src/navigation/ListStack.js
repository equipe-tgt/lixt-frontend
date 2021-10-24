import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ListScreen from '../screens/ListScreen/ListScreen';
import NewListScreen from '../screens/NewListScreen/NewListScreen';
import NewProductScreen from '../screens/NewProductScreen/NewProductScreen';
import ProductOfListDetails from '../screens/ProductOfListDetails/ProductOfListDetails';
import SendInvitationScreen from '../screens/SendInvitationScreen/SendInvitationScreen';
import ListDetailsScreen from '../screens/ListDetailsScreen/ListDetailsScreen';
import MembersListScreen from '../screens/MembersListScreen/MembersListScreen';
import CommentaryScreen from '../screens/CommentaryScreen/CommentaryScreen';
import BarcodeReaderScreen from '../screens/BarcodeScreen/BarcodeReaderScreen';

import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

const stackHeaderStyle = {
  shadowOpacity: 0,
  elevation: 0,
  borderBottomWidth: 0,
};

export default function ListStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Lists">
      <Stack.Screen
        name="Lists"
        options={{ headerShown: false }}
        component={ListScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="NewList"
        options={{ title: t('newList'), headerStyle: stackHeaderStyle }}
        component={NewListScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="ProductOfListDetails"
        options={{ title: t('edit'), headerStyle: stackHeaderStyle }}
        component={ProductOfListDetails}
      ></Stack.Screen>
      <Stack.Screen
        name="NewProduct"
        options={{ title: t('newProduct'), headerStyle: stackHeaderStyle }}
        component={NewProductScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="ListDetails"
        options={{ title: t('listInfo'), headerStyle: stackHeaderStyle }}
        component={ListDetailsScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Invite"
        options={{ title: t('sendInvitation'), headerStyle: stackHeaderStyle }}
        component={SendInvitationScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Members"
        options={{ title: t('members'), headerStyle: stackHeaderStyle }}
        component={MembersListScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Commentaries"
        options={{ title: t('commentaries'), headerStyle: stackHeaderStyle }}
        component={CommentaryScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="BarcodeReader"
        options={{ title: t('barcodeReader'), headerStyle: stackHeaderStyle }}
        component={BarcodeReaderScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
