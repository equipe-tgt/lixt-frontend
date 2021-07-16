import React, { useContext, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthProvider";
import {
  Button,
  Link,
  Text,
  Center,
  Image,
  Box,
  useToast,
} from "native-base";
import { useFormik } from "formik";
import {useTranslation} from 'react-i18next';

// Validação e controle do formulário
import { LoginSchema } from "../../validationSchemas";
import LixtInput from '../../components/LixtInput';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, handleBlur, values, errors } = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: LoginSchema(t),
    onSubmit: (values) => tryLogin(values),
    validateOnBlur: false,
    validateOnChange: false,
  });

  const tryLogin = ({ username, password }) => {
    setLoading(true);

    login(username, password)
      .catch((error) => {
        if (error?.response?.status === 401 || error?.response?.status === 400) {
          toast.show({
            title: t("incorrectData"),
            status: "warning",
          });
        }
        else {
          toast.show({
            title: t("errorServerDefault"),
            status: "error",
          });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Center width="90%">
        <Image
          source={require("../../../assets/logo_lixt.png")}
          resizeMode="contain"
          width="60%"
          height="14%"
          alt="Lixt logo"
        />

        <Box marginTop={10} marginBottom={5} width="100%">
          <LixtInput
            labelName="emailOrUsername"
            error={errors.username}
            onBlur={handleBlur("username")}
            onChangeText={handleChange("username")}
            inputTestID="login-email-or-username"
            errorTestID="error-login-email-or-username"
            autoCapitalize="none"
            type="text"
            value={values.username}
            isInvalid={!!errors.username}
          />
        </Box>

        <LixtInput
          labelName="password"
          error={errors.password}
          onBlur={handleBlur("password")}
          onChangeText={handleChange("password")}
          inputTestID="login-password"
          errorTestID="error-login-password"
          secureTextEntry
          type="password"
          value={values.password}
          isInvalid={!!errors.username}
        />

        <Button
          isLoading={loading}
          isLoadingText={t('loging')}
          marginTop={5}
          paddingX={20}
          paddingY={4}
          onPress={handleSubmit}
          testID="login-button"
        >
          {t('login')}
        </Button>

        <Box style={{ flexDirection: "row" }} mt={5}>
          <Text mr={2}>{t("dontHaveAccount")}</Text>
          <Link onPress={() => navigation.navigate("Register")}>
            <Text color="blue.500">{t("signIn")}</Text>
          </Link>
        </Box>
        <Box style={{ flexDirection: "row" }} mt={5}>
          <Link onPress={() => navigation.navigate("ForgotPassword")}>
            <Text color="blue.500">{t("forgotPassword")}</Text>
          </Link>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
