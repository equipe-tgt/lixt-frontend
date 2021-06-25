import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ListStack from "./ListStack";
import CartScreen from "../screens/CartScreen";
import ProfileStack from "./ProfileStack";

import { Ionicons } from "@expo/vector-icons";

const Tabs = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tabs.Navigator
      tabBarOptions={{
        style: {
          height: 60,
          borderTopWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
      }}
      initialRouteName="Lists"
    >
      <Tabs.Screen
        name="Lists"
        component={ListStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name="home" size={size} color={color} />;
          },
          tabBarLabel: () => {
            return null;
          },
        }}
      />
      <Tabs.Screen
        name="Carrinho"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name="cart" size={size} color={color} />;
          },
          tabBarLabel: () => {
            return null;
          },
        }}
      />

      <Tabs.Screen
        name="Perfil"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name="person" size={size} color={color} />;
          },
          tabBarLabel: () => {
            return null;
          },
        }}
      />
    </Tabs.Navigator>
  );
}
