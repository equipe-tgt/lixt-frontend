import React, { useContext, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthProvider";
import {
  Button,
  Link,
  Text,
  Input,
  FormControl,
  Center,
  Image,
  Box,
  useToast,
} from "native-base";

import {useTranslation} from 'react-i18next';

// Validação e controle do formulário
import { useFormik } from "formik";
import { LoginSchema } from "../validationSchemas";

export default function LoginScreen(props) {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {t} = useTranslation();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      tryLogin(values);
    },
    validateOnBlur: false,
    validateOnChange: false,
  });

  const tryLogin = async ({ username, password }) => {
    setLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      // Usuário com dados inválidos
      if (error?.response?.status === 401 || error?.response?.status === 400) {
        toast.show({
          title: "Seus dados estão incorretos",
          status: "warning",
        });
      }
      // Erro do servidor
      else {
        toast.show({
          title: t("errorServerDefault"),
          status: "error",
        });
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Center width="90%">
        <Image
          source={require("../../assets/logo_lixt.png")}
          resizeMode="contain"
          width="60%"
          height="14%"
          alt="Lixt logo"
        />

        <FormControl marginTop={10} marginBottom={5}>
          <FormControl.Label>{t("emailOrUsername")}</FormControl.Label>
          <Input
            autoCapitalize="none"
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
          <FormControl.Label>{t("password")}</FormControl.Label>
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

        <Button
          isLoading={loading}
          isLoadingText="Logando"
          marginTop={5}
          paddingX={20}
          paddingY={4}
          onPress={handleSubmit}
        >
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
        <Box style={{ flexDirection: "row" }} mt={5}>
          <Link
            onPress={() => {
              props.navigation.navigate("ForgotPassword");
            }}
          >
            <Text color="blue.500">Esqueci minha senha</Text>
          </Link>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
