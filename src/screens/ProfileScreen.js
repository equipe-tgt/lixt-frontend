import React, { useContext } from "react";
import { SafeAreaView } from "react-native";
import { Button, Text } from "native-base";

import { AuthContext } from "../context/AuthProvider";

export default function ProfileScreen(props) {
  const { logout } = useContext(AuthContext);
  return (
    <SafeAreaView>
      <Text>Perfil</Text>
      <Button onPress={logout}>
        <Text>logout</Text>
      </Button>
    </SafeAreaView>
  );
}
