import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, RefreshControl, Keyboard } from "react-native";
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
  Menu,
  useToast,
  Pressable,
  List,
  Heading,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { screenBasicStyle as style } from "../styles/style";

import { useTranslation } from "react-i18next";
import ListService from "../services/ListService";
import ProductService from "../services/ProductService";
import ProductOfListService from "../services/ProductOfListService";
import { AuthContext } from "../context/AuthProvider";

export default function ListScreen(props) {
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState({ productsOfList: [] });
  const [productName, setProductName] = useState("");
  const [productsFound, setProductsFound] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Ao montar o componente busca as listas e passa a "ouvir" se algum usuário voltou para essa tela
  useEffect(() => {
    fetchLists();
  }, []);

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
      toast.show({
        title: "Não foi possível buscar suas listas",
        status: "warning",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const deleteList = async () => {
    try {
      let listIdToDelete = selectedList.id;
      await ListService.deleteList(listIdToDelete, user);

      // Filtra as listas depois de uma deleção ocorrer
      setLists(lists.filter((list) => list.id !== listIdToDelete));
      setSelectedList(lists[0]);

      toast.info({
        title: "Lista removida",
        status: "success",
      });
    } catch (error) {
      toast.show({
        title: "Não foi possível deletar esta lista",
        status: "warning",
      });
    }
  };

  /**
   * @todo tratar erros das requisições de search/add
   */

  const searchProducts = async (value) => {
    if (value.length > 2) {
      try {
        const { data } = await ProductService.getProductByName(value, user);
        setProductsFound(data);
        console.log(data);
      } catch (error) {
        console.log(error.response);
      }
    } else {
      setProductsFound([]);
    }
  };

  const addToList = async (value, list) => {
    const { name, id, measureType, measureValue } = value;

    const productOfList = {
      listId: list.id,
      productId: id,
      isMarked: false,
      name,
      measureType,
      measureValue,
    };

    try {
      const { data } = await ProductOfListService.createProductOfList(
        productOfList,
        user
      );

      // Insere o produto adicionado em uma cópia da lista atual e depois atribui a lista atual
      let copyOfList = Object.assign({}, list);
      copyOfList.productsOfList.concat(data);

      setSelectedList(copyOfList);

      // Esconde o teclado
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    } finally {
      setProductName("");
      setProductsFound([]);
    }
  };

  const listItemsByCategory = () => {
    if (selectedList) {
      // Agrupa os produtos por categorias
      let groupedProducts = selectedList.productsOfList.reduce(
        (accumlator, currentProductOfList) => {
          accumlator[currentProductOfList.product.category.name] = [
            ...(accumlator[currentProductOfList.product.category.name] || []),
            currentProductOfList,
          ];
          return accumlator;
        },
        {}
      );
      return groupedProducts;
    }
    return {};
  };

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
            setSelectedList(itemValue);
          }}
        >
          {lists.map((list) => (
            <Select.Item key={list.id} label={list.nameList} value={list} />
          ))}
        </Select>
        {/* Botão nova lista */}
        <Button
          variant="link"
          startIcon={<Ionicons name="add-circle" size={35} color="#06b6d4" />}
          onPress={() => {
            props.navigation.navigate("NewList");
          }}
        />

        {/* Menu de contexto */}
        <Menu
          trigger={(triggerProps) => {
            return (
              <Pressable {...triggerProps}>
                <Ionicons size={20} color="#27272a" name="ellipsis-vertical" />
              </Pressable>
            );
          }}
        >
          {/* Só mostra a opção de deletar lista se ele for o dono da lista */}
          {selectedList.ownerId === user.id ? (
            <Menu.Item
              onPress={() => {
                deleteList();
              }}
            >
              Deletar lista
            </Menu.Item>
          ) : null}
        </Menu>
      </HStack>
      <ScrollView
        keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchLists}
            scrollEnabled={productName.length === 0}
          />
        }
      >
        <VStack w="90%" mx="auto">
          {/*  Input de buscas */}
          <FormControl mb={5}>
            <FormControl.Label>{t("search")}</FormControl.Label>
            <Input
              value={productName}
              onChangeText={(value) => {
                setProductName(value);
                searchProducts(value);
              }}
            />
          </FormControl>

          {/* Produtos encontrados */}
          {productsFound.length > 0 ? (
            <List borderBottomRadius={3} space="md">
              <ScrollView keyboardShouldPersistTaps="always">
                {productsFound.map((product) => (
                  <List.Item
                    py={4}
                    key={product.id}
                    onPress={() => {
                      addToList(product, selectedList);
                    }}
                    _pressed={{ bg: "primary.500" }}
                  >
                    {product.name}
                  </List.Item>
                ))}
              </ScrollView>
            </List>
          ) : null}

          {/* Itera por cada categoria dos produtos */}
          {Object.keys(listItemsByCategory()).map((category, index) => {
            return (
              <Box key={index} my={3}>
                <Heading
                  style={{ textTransform: "uppercase", letterSpacing: 4 }}
                  mb={2}
                  fontWeight="normal"
                  size="sm"
                >
                  {category}
                </Heading>

                {/* Mostra todos os produtos pertencentes àquela categoria */}
                {listItemsByCategory()[category].map((p) => {
                  return (
                    <Box
                      key={p.id}
                      my={3}
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box
                        onPress={() => {
                          alert("hi");
                        }}
                      >
                        <Text fontWeight="bold">{p.name}</Text>
                        <Text>
                          {p.measureValue} {p.measureType}
                        </Text>
                        <Text>{p.price ? `R$ ${p.price}` : "R$ 0,00"}</Text>
                      </Box>

                      <Menu
                        trigger={(triggerProps) => {
                          return (
                            <Pressable p={3} {...triggerProps}>
                              <Ionicons
                                color="#27272a"
                                name="ellipsis-vertical"
                              />
                            </Pressable>
                          );
                        }}
                      >
                        <Menu.Item>opção</Menu.Item>
                      </Menu>
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
