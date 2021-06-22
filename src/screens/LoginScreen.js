import React, { useState, useContext } from "react";
import { SafeAreaView, StyleSheet, View, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";

import { AuthContext } from "../context/AuthProvider";

export default function LoginScreen(props) {
  /**
   * @todo Remover dado inicial do username e password
   */
  const [username, setUsername] = useState("shakira@gmail.com");
  const [password, setPassword] = useState("gipsy123");

  const { login, user } = useContext(AuthContext);

  /**
   * @todo fazer trativa de erros
   */
  const tryLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      alert("Não logou");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/logo_lixt.png")}
        resizeMode="cover"
        style={styles.logo}
      />

      <View style={styles.form}>
        <TextInput
          mode="outlined"
          style={styles.textInput}
          label="Email ou nome de usuário"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          mode="outlined"
          style={styles.textInput}
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <Button mode="contained" title="Login" onPress={tryLogin}>
          <Text style={{ color: "#fff" }}>Login</Text>
        </Button>

        <Text>
          Não tem login?{" "}
          <Button
            uppercase={false}
            onPress={() => {
              props.navigation.navigate("Register");
            }}
          >
            Cadastre-se
          </Button>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logo: {
    marginBottom: 30
  },
  form: {
    height: 60,
    width: "85%",
  },
  textInput: {
    marginBottom: 25,
  },
});
