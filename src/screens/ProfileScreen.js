import React, {useContext} from "react";
import { SafeAreaView, Text } from "react-native";
import { Button } from "react-native-paper";

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
