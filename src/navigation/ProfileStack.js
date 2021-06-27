import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import UpdatePasswordScreen from "../screens/UpdatePasswordScreen";

import {useTranslation} from 'react-i18next';

const Stack = createStackNavigator();

const stackHeaderStyle = {
  shadowOpacity: 0,
  elevation: 0,
  borderBottomWidth: 0,
};

export default function ProfileStack() {

  const {t} = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        options={{
          title: t("yourProfile"),
          headerStyle: stackHeaderStyle,
        }}
        component={ProfileScreen}
      ></Stack.Screen>

      <Stack.Screen
        name="UpdatePassword"
        options={{
          title: t("updatePassword"),
          headerStyle: stackHeaderStyle,
        }}
        component={UpdatePasswordScreen}
      ></Stack.Screen>

      <Stack.Screen
        name="Settings"
        options={{ title: t("settings"), headerStyle: stackHeaderStyle }}
        component={SettingsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
