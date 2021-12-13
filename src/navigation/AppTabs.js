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
      screenOptions={{
        tabBarStyle: {
          height: 60,
          borderTopWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#06b6d4',
        headerShown: false,
      }}
      initialRouteName="ListsStack"
    >
      <Tabs.Screen
        name="ListsStack"
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
        name="PurchaseStack"
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
        name="ProfileStack"
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
