import React, { useContext } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Button, Text, Link, VStack, Box } from "native-base";
import { screenBasicStyle, screenBasicStyle as style } from "../styles/style";

import { AuthContext } from "../context/AuthProvider";

export default function ProfileScreen(props) {
  const { logout } = useContext(AuthContext);
  return (
    <SafeAreaView style={screenBasicStyle.container}>
      <VStack>
        <Box marginY={2}>
          <Link
            onPress={() => {
              props.navigation.navigate("Settings");
            }}
          >
            <Text style={styles.settingsText}>Configurações</Text>
          </Link>
        </Box>
        <Box marginY={2}>
          <Link onPress={logout}>
            <Text style={styles.settingsText} color="blue.500">
              Sair
            </Text>
          </Link>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  settingsText: {
    fontSize: 14,
  },
});
