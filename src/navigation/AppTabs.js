import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { Ionicons } from "@expo/vector-icons";

const Tabs = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tabs.Navigator
      tabBarOptions={{ style: { height: 60 } }}
      initialRouteName="Dashboard"
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
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
        component={ProfileScreen}
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
