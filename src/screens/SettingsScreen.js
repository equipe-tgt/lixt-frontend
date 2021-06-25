import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Text, FormControl, Center, Box, Select } from "native-base";
import { screenBasicStyle as style } from "../styles/style";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={style.container}>
      <Center>
        <Box mt={5} width="90%" mx="auto">
          <FormControl.Label alignSelf="flex-start">
            Alterar idioma
          </FormControl.Label>
          <FormControl>
            <Select>
              <Select.Item label="Teste" value="teste" />
            </Select>
          </FormControl>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
