import React, { useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { FormControl, Input, Center, Button } from "native-base";

import { screenBasicStyle as style } from "../styles/style";
import { useTranslation } from "react-i18next";

export default function SendInvitationScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);


  return (
    <SafeAreaView style={style.container}>
      <Center width="90%" mx="auto">
        <FormControl>
          <FormControl.Label>{t("emailOrUsername")}</FormControl.Label>
          <Input autoCapitalize="none" />
        </FormControl>
        <Button
          marginTop={5}
          paddingX={20}
          paddingY={4}
          isLoading={loading}
          isLoadingText="Enviando"
        >
          {t("sendInvitation")}
        </Button>
      </Center>
    </SafeAreaView>
  );
}
