import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        options={{ title: "Seu Perfil" }}
        component={ProfileScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Settings"
        options={{ title: "Configurações" }}
        component={SettingsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
