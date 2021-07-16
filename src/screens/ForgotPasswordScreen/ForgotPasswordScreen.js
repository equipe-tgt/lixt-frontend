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

import UserService from "../../services/UserService";
import {useTranslation} from 'react-i18next';
import LixtInput from '../../components/LixtInput';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

import { ResetPasswordSchema } from "../../validationSchemas/index";
import { useFormik } from "formik";

export default function ForgotPasswordScreen(props) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { email: "" },
    validationSchema: ResetPasswordSchema(t),
    onSubmit: () => resetPassword(),
    validateOnChange: false,
  });

  const resetPassword = () => {
    setLoading(true);
    UserService.resetPassword(values.email)
      .then(() => {
        toast.show({
          title: t("emailSuccessfullySend"),
          status: "success",
        });
        props.navigation.navigate("Login");
      })
      .catch((error) => {
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
      }).finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Center w="90%">
        <Image
          source={require("../../../assets/logo_lixt.png")}
          resizeMode="contain"
          width="60%"
          height="14%"
          alt="Lixt logo"
        />

        <Box marginTop={10} marginBottom={5} width="100%">
          <LixtInput
            labelName="Email"
            error={errors.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            inputTestID="forgot-password-email"
            errorTestID="error-forgot-password-email"
            type="text"
            value={values.email}
            isInvalid={!!errors.email}
            autoCapitalize="none"
          />
        </Box>

        <Box>
          <Text textAlign="center">
            {t('sendResetPasswordEmail')}
          </Text>
          <Button
            isLoading={loading}
            isLoadingText={t("sendingMail")}
            onPress={handleSubmit}
            paddingX={20}
            paddingY={4}
            mt={5}
            testID="forgot-password-button"
          >
            {t("okContinue")}
          </Button>
        </Box>

        <Box style={{ flexDirection: "row" }} mt={5}>
          <Link onPress={() => props.navigation.navigate("Login")} >
            <Text color="blue.500">{t("backToLoginScreen")}</Text>
          </Link>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
