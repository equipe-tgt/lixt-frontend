import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { Button, Text, HStack, StatusBar, Box, Container, Select } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { screenBasicStyle as style } from "../styles/style";

import { AuthContext } from "../context/AuthProvider";

export default function ListScreen(props) {
  const { user } = useContext(AuthContext);

  const [lists, setLists] = useState([{}]);
  const [selectedList, setSelectedList] = useState({});

  useEffect(() => {});

  return (
    <SafeAreaView style={screenBasicStyle.container}>
      <StatusBar barStyle="dark-content" />
      <Box safeAreaTop />
      <HStack
        bg="#6200ee"
        px={1}
        py={2}
        height="15%"
        justifyContent="space-between"
        alignItems="center"
      >
        <HStack>
          <Button
            variant="link"
            startIcon={<Ionicons name="add-circle" size={35} color="#06b6d4" />}
            onPress={() => {
              props.navigation.navigate("NewList");
            }}
          />
        </HStack>
      </HStack>
      <Text>Home</Text>
      <Button
        onPress={() => {
          console.log(user);
        }}
      >
        Seu user
      </Button>
    </SafeAreaView>
  );
}
