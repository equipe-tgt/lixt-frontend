import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Text, FormControl, Select } from "native-base";
import { screenBasicStyle as style } from "../styles/style";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={style.container}>
      <FormControl.Label>Alterar idioma</FormControl.Label>
      <FormControl>
        <Select>
          <Select.Item label="Teste" value="teste" />
        </Select>
      </FormControl>
    </SafeAreaView>
  );
}
