import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import {
  Button,
  Text,
  HStack,
  StatusBar,
  Box,
  Select,
  Input,
  FormControl,
  VStack,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { screenBasicStyle as style } from "../styles/style";

import { AuthContext } from "../context/AuthProvider";

export default function ListScreen(props) {
  const { user } = useContext(AuthContext);

  const [lists, setLists] = useState([{}]);
  const [selectedList, setSelectedList] = useState({});
  const [productName, setProductName] = useState("");

  useEffect(() => {});

  return (
    <SafeAreaView style={style.container}>
      {/* Header com o select de listas e opções da lista */}
      <StatusBar barStyle="dark-content" />
      <Box safeAreaTop />
      <HStack
        py={2}
        mt={2}
        height="15%"
        width="90%"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
      >
        <Select width="70%">
          <Select.Item label="Teste" value="teste" />
        </Select>
        <Button
          variant="link"
          startIcon={<Ionicons name="add-circle" size={35} color="#06b6d4" />}
          onPress={() => {
            props.navigation.navigate("NewList");
          }}
        />
        <Button
          variant="ghost"
          startIcon={
            <Ionicons size={20} color="#27272a" name="ellipsis-vertical" />
          }
        />
      </HStack>

      <VStack w="90%" mx="auto">
        {/*  Input de buscas */}
        <FormControl>
          <FormControl.Label>Buscar</FormControl.Label>
          <Input value={productName} onChangeText={setProductName} />
        </FormControl>
      </VStack>
    </SafeAreaView>
  );
}
