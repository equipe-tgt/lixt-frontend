import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, Image } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";

export default function RegisterScreen(props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});

  /**
   * @todo colocar mensagens reais
   */
  const validarForm = () => {

    let errorLocal = {};
    if (!name) {
      errorLocal.name = "";
    }
    if (!password || !confirmPassword || password != confirmPassword) {
      errorLocal.password = "";
    }

    setErrors(errorLocal);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../assets/logo_lixt.png")}
        resizeMode="cover"
      />

      <View style={styles.form}>
        <TextInput
          style={styles.textInput}
          mode="outlined"
          label="Nome"
          value={name}
          onChangeText={setName}
        ></TextInput>
        <HelperText padding="none" type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          style={styles.textInput}
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
        ></TextInput>
        <HelperText padding="none" type="error" visible={!!errors.email}>
          {errors.email}
        </HelperText>

        <TextInput
          style={styles.textInput}
          mode="outlined"
          label="Nome de usuário"
          value={username}
          onChangeText={setUsername}
        ></TextInput>
        <HelperText padding="none" type="error" visible={!!errors.username}>
          {errors.username}
        </HelperText>

        <TextInput
          style={styles.textInput}
          mode="outlined"
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        ></TextInput>
        <HelperText padding="none" type="error" visible={!!errors.password}>
          {errors.name}
        </HelperText>

        <TextInput
          style={styles.textInput}
          mode="outlined"
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        ></TextInput>
        <HelperText
          padding="none"
          type="error"
          visible={!!errors.confirmPassword}
        >
          {errors.name}
        </HelperText>

        <Button mode="contained" onPress={validarForm}>
          <Text style={{ color: "#fff" }}>Registrar</Text>
        </Button>

        <Text>
          Já possui uma conta?
          <Button
            uppercase={false}
            onPress={() => {
              props.navigation.navigate("Login");
            }}
          >
            Faça login
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
    marginBottom: 30,
  },
  form: {
    width: "85%",
  },
  textInput: {
    marginBottom: 10,
  },
});
