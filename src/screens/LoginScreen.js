import React, { useContext } from "react";
import { SafeAreaView, StyleSheet, Image } from "react-native";
import { AuthContext } from "../context/AuthProvider";
import {
  Button,
  Link,
  Text,
  Input,
  FormControl,
  Center,
  Box,
} from "native-base";

// Validação e controle do formulário
import { useFormik } from "formik";
import { LoginSchema } from "../validationSchemas";

export default function LoginScreen(props) {
  const { login } = useContext(AuthContext);

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      console.log(values);
      tryLogin(values);
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  /**
   * @todo fazer trativa de erros
   */
  const tryLogin = async ({ username, password }) => {
    try {
      await login(username, password);
    } catch (error) {
      alert("Não logou");
    }
  };

  return (
    <SafeAreaView>
      <Center width="90%">
        <Image
          source={require("../../assets/logo_lixt.png")}
          resizeMode="cover"
        />

        <FormControl marginTop={10} marginBottom={5}>
          <FormControl.Label>Email ou nome de usuário</FormControl.Label>
          <Input
            type="text"
            onChangeText={handleChange("username")}
            onBlur={handleBlur("username")}
            value={values.username}
            isInvalid={!!errors.username}
          />
          <FormControl.HelperText>
            <Text
              style={
                errors.username ? { color: "#fb7185" } : { display: "none" }
              }
            >
              {errors.username}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl>
          <FormControl.Label>Senha</FormControl.Label>
          <Input
            type="password"
            onBlur={handleBlur("password")}
            onChangeText={handleChange("password")}
            secureTextEntry={true}
            value={values.password}
            isInvalid={!!errors.password}
          />
          <FormControl.HelperText isInvalid={!!errors.password}>
            <Text
              style={
                errors.password ? { color: "#fb7185" } : { display: "none" }
              }
            >
              {errors.password}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <Button marginTop={5} paddingX={20} paddingY={4} onPress={handleSubmit}>
          Login
        </Button>

        <Box style={{ flexDirection: "row" }} mt={5}>
          <Text mr={2}>Não tem login?</Text>
          <Link
            onPress={() => {
              props.navigation.navigate("Register");
            }}
          >
            <Text color="blue.500">Cadastre-se</Text>
          </Link>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
