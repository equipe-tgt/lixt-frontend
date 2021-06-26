import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, RefreshControl } from "react-native";
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
  ScrollView,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { screenBasicStyle as style } from "../styles/style";

import ListService from "../services/ListService";
import { AuthContext } from "../context/AuthProvider";

export default function ListScreen(props) {
  const { user } = useContext(AuthContext);

  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState({});
  const [productName, setProductName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLists = async () => {
    try {
      // Busca todas as listas do usuário
      const { data } = await ListService.getLists(user);

      // Se o array de listas tiver resultados coloque-os no
      // componente de select e atribua o primeiro resultado para a
      // variável da lista selecionada
      if (data.length > 0) {
        setLists([...data]);
        setSelectedList(data[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

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
        {/* Select de listas no header */}
        <Select
          selectedValue={selectedList}
          width="70%"
          onValueChange={(itemValue) => {
            console.log(itemValue);
            setSelectedList(itemValue);
          }}
        >
          {lists.map((list) => (
            <Select.Item key={list.id} label={list.nameList} value={list} />
          ))}
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchLists} />
        }
      >
        <VStack w="90%" mx="auto">
          {/*  Input de buscas */}
          <FormControl>
            <FormControl.Label>Buscar</FormControl.Label>
            <Input value={productName} onChangeText={setProductName} />
          </FormControl>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
