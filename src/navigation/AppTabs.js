import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ListStack from './ListStack';
import ProfileStack from './ProfileStack';
import PurchaseStack from './PurchaseStack';

import { Ionicons } from '@expo/vector-icons';

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
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="home" size={size} color={color} />;
          },
          tabBarLabel: () => {
            return null;
          },
        }}
      />
      <Tabs.Screen
        name="Purchase"
        component={PurchaseStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="cart" size={size} color={color} />;
          },
          tabBarLabel: () => {
            return null;
          },
        }}
      />

      <Tabs.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => {
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
