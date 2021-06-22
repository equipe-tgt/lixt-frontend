import React from "react";
import { StyleSheet } from "react-native";

import Routes from "./src/navigation/Routes";
import { AuthProvider } from "./src/context/AuthProvider";
import { NavigationContainer } from "@react-navigation/native";

import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3498db",
    accent: "#f1c40f",
  },
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <Routes />
        </PaperProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
