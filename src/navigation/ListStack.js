import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import ListScreen from "../screens/ListScreen";
import NewListScreen from "../screens/NewListScreen";
import {useTranslation} from 'react-i18next';

const Stack = createStackNavigator();

const stackHeaderStyle = {
  shadowOpacity: 0,
  elevation: 0,
  borderBottomWidth: 0,
};

export default function ListStack() {

  const {t} = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Lists">
      <Stack.Screen
        name="Lists"
        options={{ headerShown: false }}
        component={ListScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="NewList"
        options={{ title: t("newList"), headerStyle: stackHeaderStyle }}
        component={NewListScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
