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

import UserService from "../services/UserService";
import {useTranslation} from 'react-i18next';

// Validação e controle do formulário
import { ResetPasswordSchema } from "../validationSchemas/index";
import { useFormik } from "formik";

export default function ForgotPasswordScreen(props) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {t} = useTranslation();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { email: "" },
    validationSchema: ResetPasswordSchema,
    onSubmit: () => {
      resetPassword();
    },
    validateOnChange: false,
  });

  const resetPassword = async () => {
    setLoading(true);
    try {
      await UserService.resetPassword(values.email);
      toast.show({
        title: t("emailSuccessfullySend"),
        status: "success",
      });
      props.navigation.navigate("Login");
    } catch (error) {
      if (error.response.status === 404) {
        toast.show({
          title: t("userDoesntExists"),
          status: "warning",
        });
      } else {
        toast.show({
          title: t("errorServerDefault"),
          status: "warning",
        });
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Center w="90%">
        <Image
          source={require("../../assets/logo_lixt.png")}
          resizeMode="contain"
          width="60%"
          height="14%"
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
            autoCapitalize="none"
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
            isLoadingText={t("sendingMail")}
            onPress={handleSubmit}
            paddingX={20}
            paddingY={4}
            mt={5}
          >
            {t("okContinue")}
          </Button>
        </Box>

        <Box style={{ flexDirection: "row" }} mt={5}>
          <Link
            onPress={() => {
              props.navigation.navigate("Login");
            }}
          >
            <Text color="blue.500">{t("backToLoginScreen")}</Text>
          </Link>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});