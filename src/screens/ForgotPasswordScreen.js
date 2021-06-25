import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

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

// Validação e controle do formulário
import { ResetPasswordSchema } from "../validationSchemas/index";
import { useFormik } from "formik";

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { email: "" },
    validationSchema: ResetPasswordSchema,
    onSubmit: (values) => {
      resetPassword(values);
    },
    validateOnChange: false,
  });

  const resetPassword = () => {};

  return (
    <SafeAreaView style={styles.container}>
      <Center w="90%">
        <Image
          source={require("../../assets/logo_lixt.png")}
          resizeMode="cover"
          alt="Lixt logo"
        />

        <FormControl marginTop={10} marginBottom={5}>
          <FormControl.Label>Email</FormControl.Label>
          <Input
            type="text"
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            value={values.email}
            isInvalid={!!errors.email}
          />
          <FormControl.HelperText>
            <Text
              style={errors.email ? { color: "#fb7185" } : { display: "none" }}
            >
              {errors.email}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <Box>
          <Text textAlign="center">
            Ao clicar no botão enviaremos uma senha provisória para o seu email
          </Text>
          <Button
            isLoading={loading}
            isLoadingText="Enviando senha"
            onPress={handleSubmit}
            paddingX={20}
            paddingY={4}
            mt={5}
          >
            Ok, quero continuar
          </Button>
        </Box>

        <Box style={{ flexDirection: "row" }} mt={5}>
          <Link
            onPress={() => {
              props.navigation.navigate("Login");
            }}
          >
            <Text color="blue.500"> Voltar à tela de login</Text>
          </Link>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
