import React, { useState, useContext } from "react";
import { SafeAreaView, Text } from "react-native";
import { FormControl, Input, Center, Button } from "native-base";

import { screenBasicStyle as style } from "../styles/style";
import { useTranslation } from "react-i18next";

import { AuthContext } from "../context/AuthProvider";
import { useFormik } from "formik";
import { InviteSchema } from "../validationSchemas";

export default function SendInvitationScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { t } = useTranslation();

  const { handleChange, handleSubmit, handleBlur, values, errors, touched } =
    useFormik({
      initialValues: {
        username: "",
      },
      validateOnChange: false,
      validateOnBlur: false,
      validationSchema: InviteSchema,
      onSubmit: () => {},
    });

  const sendInvitation = async () => {};

  return (
    <SafeAreaView style={style.container}>
      <Center width="90%" mx="auto">
        <FormControl>
          <FormControl.Label>{t("emailOrUsername")}</FormControl.Label>
          <Input
            autoCapitalize="none"
            disabled={loading}
            onBlur={handleBlur("username")}
            onChangeText={handleChange("username")}
            error={!!errors.username}
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
        <Button
          marginTop={5}
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Enviando"
          onPress={handleSubmit}
        >
          {t("sendInvitation")}
        </Button>
      </Center>
    </SafeAreaView>
  );
}
