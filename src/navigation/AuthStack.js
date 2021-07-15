import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

const Stack = createStackNavigator();
export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }}
        component={LoginScreen}
      />
      <Stack.Screen
        name="Register"
        options={{ headerShown: false }}
        component={RegisterScreen}
      />
      <Stack.Screen
        name="ForgotPassword"
        options={{ headerShown: false }}
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}
