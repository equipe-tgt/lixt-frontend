import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createStackNavigator();

const stackHeaderStyle = {
  shadowOpacity: 0,
  elevation: 0,
  borderBottomWidth: 0,
};

export default function ProfileStack() {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        options={{
          title: "Seu Perfil",
          headerStyle: stackHeaderStyle,
        }}
        component={ProfileScreen}
      ></Stack.Screen>
      <Stack.Screen
        name="Settings"
        options={{ title: "Configurações", headerStyle: stackHeaderStyle }}
        component={SettingsScreen}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
