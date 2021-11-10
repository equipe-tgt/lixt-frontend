import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, RefreshControl, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  Center,
  Spinner,
} from 'native-base';
import LixtProductItem from '../../components/LixtProductItem';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { screenBasicStyle as style } from '../../styles/style';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTranslation } from 'react-i18next';
import ListService from '../../services/ListService';
import ProductService from '../../services/ProductService';
import ProductOfListService from '../../services/ProductOfListService';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import ListMembersService from '../../services/ListMembersService';
import ListRemoveModal from '../../components/ListRemoveModal';

export default function ListScreen(props) {
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { lists, setLists } = useContext(ListContext);
  const [selectedList, setSelectedList] = useState({
    productsOfList: [],
    listMembers: [],
    comments: [],
    id: null,
  });
  const [productName, setProductName] = useState('');
  const [productsFound, setProductsFound] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [isListRemoveModalOpen, setIsListRemoveModalOpen] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);

  // Ao montar o componente busca as listas
  useEffect(() => {
    fetchLists();
  }, []);

  // Hook que dispara toda vez que esta tela for focada
  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa
    if (props.route.params) {
      // Caso a tela de nova lista tenha enviado uma lista nova, inclui na lista das listas
      // e seleciona ela automaticamente
      if (props.route.params.newList) {
        const newList = Object.assign({}, props.route.params.newList);
        setLists([...lists, newList]);
        setSelectedList(newList);
        props.route.params.newList = null;
      }

      // Caso a tela de edição de lista tenha enviado uma lista, atualiza a lista de listas
      // e seleciona ela automaticamente
      if (props.route.params.editList) {
        const editList = Object.assign({}, props.route.params.editList);
        const updatedLists = lists.filter(list => list.id !== editList.id);
        setLists([...updatedLists, editList]);
        setSelectedList(editList);
        props.route.params.editList = null;
      }

      // Se o usuário tiver adicionado um novo produto
      // à plataforma, adiciona automaticamente na lista atual
      if (props.route.params.newProduct) {
        addToList(props.route.params.newProduct, selectedList);
        props.route.params.newProduct = null;
      }

      // Se o usuário tiver adicionado um produto por
      // código de barra
      if (props.route.params.foundProductByBarcode) {
        addToList(props.route.params.foundProductByBarcode, selectedList);
        props.route.params.foundProductByBarcode = null;
      }

      // Caso a tela peça para fazer refresh atualiza as listas
      if (props.route.params.refresh) {
        fetchLists();
        props.route.params.refresh = null;
      }
    }
  });

  // Caso as listas do context tenham alguma atualização, atualiza os dados da lista
  // selecionada atual.
  useEffect(() => {
    if (selectedList) {
      const updatedList = lists.find((l) => l.id === selectedList?.id);
      setSelectedList(updatedList);
    }
  }, [JSON.stringify(lists)]);

  /**
   * Ao fechar o modal de confirmação de deleção da lista, verifica se o
   * usuário confirmou a deleção, caso sim: deleta, do contrário não
   * dispara nenhum efeito colateral
   */
  useEffect(() => {
    if (confirmRemoval) {
      deleteList();
    }
  }, [isListRemoveModalOpen]);

  const fetchLists = async () => {
    try {
      // Busca todas as listas do usuário
      const { data } = await ListService.getLists(user);

      // Se o array de listas tiver resultados coloque-os no
      // componente de select e atribua o primeiro resultado para a
      // variável da lista selecionada
      if (data && data.length > 0) {
        setLists([...data]);
        try {
          const lastSelectedList = await AsyncStorage.getItem(
            'lastSelectedList'
          );
          if (lastSelectedList) {
            setSelectedList(
              data.find((list) => list.id === Number(lastSelectedList))
            );
          } else {
            setSelectedList(data[0]);
          }
        } catch (error) {
          console.log({ error });
        }
      } else {
        setLists([]);
      }
    } catch (error) {
      toast.show({
        title: 'Não foi possível buscar suas listas',
        status: 'warning',
      });
    } finally {
      setRefreshing(false);
      setLoadingScreen(false);
    }
  };

  const deleteList = async () => {
    try {
      const listIdToDelete = selectedList.id;

      await ListService.deleteList(listIdToDelete, user);

      // Filtra as listas depois de uma deleção ocorrer
      setLists(lists.filter((list) => list.id !== listIdToDelete));
      setSelectedList(lists[0]);

      setConfirmRemoval(false);

      toast.show({
        title: t('listRemoved'),
        status: 'info',
      });
    } catch (error) {
      toast.show({
        title: t('couldntRemoveList'),
        status: 'warning',
      });
    }
  };

  const leaveList = async () => {
    try {
      // Pega o id do convite atual e faz a deleção do convite
      const { id } = selectedList.listMembers.find(
        (lm) => lm.userId === user.id
      );
      await ListMembersService.deleteInvitation(id, user);

      // Após se desvincular da lista, filtra as listas do usuário de forma
      // que a lista da qual ele se desvinculou não apareça mais
      const editedLists = lists.filter((l) => l.id !== selectedList.id);
      setLists([...editedLists]);
      setSelectedList(lists[0]);

      toast.show({
        status: 'success',
        title: t('youLeft'),
      });
    } catch (error) {
      toast.show({
        status: 'warning',
        title: t('errorServerDefault'),
      });
    }
  };

  const searchProducts = async (value) => {
    if (value.length > 2) {
      try {
        const { data } = await ProductService.getProductByName(value, user);
        setProductsFound(data);
      } catch (error) {
        console.log({ error });
        toast.show({
          title: t('errorServerDefault'),
          status: 'warning',
        });
      }
    } else {
      setProductsFound([]);
    }
  };

  const addToList = async (value, list) => {
    const { name, id, measureType, measureValue } = value;

    // Se o produto já estiver na lista não insere novamente
    if (list?.productsOfList && list?.productsOfList?.length > 0) {
      if (list.productsOfList.find((p) => p.productId === value.id)) {
        toast.show({
          title: t('productAlreadyOnList'),
          status: 'info',
        });
        // Esconde o teclado
        Keyboard.dismiss();
        return;
      }
    }

    const productOfList = {
      listId: list.id,
      productId: id,
      isMarked: false,
      name,
      measureType,
      measureValue,
      product: value,
      plannedAmount: 1,
    };

    try {
      const { data } = await ProductOfListService.createProductOfList(
        productOfList,
        user
      );

      // Faz uma cópia do objeto original e depois atribui ao state com o produto
      // adicionado
      const objCopy = Object.assign({}, selectedList);

      // Se o atributo 'productsOfList' já existe só insere o produto
      // caso não, cria um array com o produto já inserido dentro
      if (objCopy.productsOfList) {
        objCopy.productsOfList.push(data);
      } else {
        objCopy.productsOfList = [data];
      }

      setSelectedList(objCopy);
      editOriginalLists(objCopy);

      // Esconde o teclado
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    } finally {
      setProductName('');
      setProductsFound([]);
    }
  };

  const editOriginalLists = (editedList) => {
    if (lists?.length) {
      const editedLists = lists.map((l) =>
        l.id === editedList.id ? editedList : l
      );

      setLists(editedLists);
    }
  };

  const deleteProductOfList = async (id) => {
    try {
      await ProductOfListService.removeProductOfList(id, user);

      // Faz uma cópia do objeto original e depois atribui ao state com o produto
      // adicionado
      const objCopy = Object.assign({}, selectedList);
      objCopy.productsOfList = objCopy.productsOfList.filter(
        (p) => p.id !== id
      );
      setSelectedList(objCopy);
      editOriginalLists(objCopy);

      toast.show({
        title: t('itemWasRemoved'),
        status: 'info',
      });
    } catch (error) {
      console.log({ error });
      toast.show({
        title: t('couldntRemoveItem'),
        status: 'warning',
      });
    }
  };

  const listItemsByCategory = () => {
    if (selectedList && selectedList?.productsOfList) {
      // Agrupa os produtos por categorias
      const groupedProducts = selectedList.productsOfList.reduce(
        (accumlator, currentProductOfList) => {
          const categoryName =
            currentProductOfList.product?.category?.name || t('others');

          accumlator[categoryName] = [
            ...(accumlator[categoryName] || []),
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

  const storeListId = async (listId) => {
    try {
      await AsyncStorage.setItem('lastSelectedList', String(listId));
    } catch (error) {
      console.log({ error });
      return null;
    }
  };

  return !loadingScreen ? (
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
          testID="select-current-list"
          selectedValue={selectedList?.id}
          width="70%"
          onValueChange={(listId) => {
            setSelectedList(lists.find((list) => list.id === Number(listId)));
            storeListId(listId);
          }}
          isDisabled={lists?.length === 0}
        >
          {lists?.map((list) => (
            <Select.Item key={list.id} value={list.id} label={list.nameList} />
          ))}
        </Select>
        {/* Botão nova lista */}
        <Button
          testID="create-list"
          variant="link"
          startIcon={<Ionicons name="add-circle" size={35} color="#06b6d4" />}
          onPress={() => {
            props.navigation.navigate('NewList');
          }}
        />

        {/* Menu de contexto */}
        {lists?.length && selectedList?.id ? (
          <Menu
            placement="bottom left"
            trigger={(triggerProps) => {
              return (
                <Pressable testID="list-options" {...triggerProps}>
                  <Ionicons
                    size={20}
                    color="#27272a"
                    name="ellipsis-vertical"
                  />
                </Pressable>
              );
            }}
          >
            <Menu.Item
              onPress={() => {
                props.navigation.navigate('EditList', {
                  listId: selectedList.id,
                });
              }}
            >
              {t('editList')}
            </Menu.Item>
            <Menu.Item
              onPress={() => {
                props.navigation.navigate('ListDetails', {
                  list: selectedList,
                });
              }}
            >
              {t('listInfo')}
            </Menu.Item>

            {selectedList?.id && selectedList?.listMembers?.length > 0 ? (
              <Menu.Item
                onPress={() => {
                  props.navigation.navigate('Members', {
                    list: selectedList,
                  });
                }}
              >
                {t('members')}
              </Menu.Item>
            ) : null}

            {/* Só mostra a opção de deletar lista ou convidar se ele for o dono da lista,
          se ele for convidado mostra a opção de deixar a lista */}
            {selectedList && selectedList.ownerId === user.id ? (
              <Box>
                <Menu.Item
                  onPress={() => {
                    props.navigation.navigate('Invite', {
                      list: selectedList,
                    });
                  }}
                >
                  {t('sendInvitation')}
                </Menu.Item>
                <Menu.Item
                  testID="delete-option"
                  onPress={() => {
                    setIsListRemoveModalOpen(true);
                  }}
                >
                  <Text color="red.500">{t('deleteList')}</Text>
                </Menu.Item>
              </Box>
            ) : (
              <Box>
                <Menu.Item testID="leave-list-option" onPress={leaveList}>
                  {t('leaveList')}
                </Menu.Item>
              </Box>
            )}
          </Menu>
        ) : null}
      </HStack>

      {/* Se o usuário possuir listas as mostra, caso não mostre um botão para adicionar a primeira lista */}
      {lists?.length > 0 ? (
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
            <FormControl>
              <FormControl.Label>{t('search')}</FormControl.Label>
              <Input
                testID="input-search-product"
                value={productName}
                onChangeText={(value) => {
                  setProductName(value);
                  searchProducts(value);
                }}
                InputRightElement={
                  <Pressable
                    testID="barcode-reader-search"
                    mr={5}
                    onPress={() => props.navigation.navigate('BarcodeReader')}
                    accessibilityLabel={t('barcodeReader')}
                  >
                    <MaterialCommunityIcons
                      name="barcode-scan"
                      size={34}
                      color="#6b7280"
                    />
                  </Pressable>
                }
              />
            </FormControl>

            {/* Produtos encontrados */}
            {productsFound.length > 0 ? (
              <List
                borderBottomRadius={3}
                borderTopColor="transparent"
                space="md"
              >
                <ScrollView keyboardShouldPersistTaps="always">
                  {productsFound.map((product) => (
                    <List.Item
                      testID="products-found"
                      py={4}
                      key={product.id}
                      onPress={() => {
                        addToList(product, selectedList);
                      }}
                      _pressed={{ bg: 'primary.500' }}
                    >
                      {product.name}
                    </List.Item>
                  ))}
                </ScrollView>
              </List>
            ) : null}

            {/* Se a pessoa não encontrou o produto desejado dá a opção para criar um novo */}
            {productName.length > 3 && productsFound.length === 0 ? (
              <List borderBottomRadius={3} space="md">
                <List.Item
                  testID="option-add-new-product"
                  _pressed={{ bg: 'primary.500' }}
                  onPress={() => {
                    props.navigation.navigate('NewProduct', {
                      productName: productName,
                    });
                    setProductName('');
                  }}
                >
                  {`${t('add')} "${productName}"`}
                </List.Item>
              </List>
            ) : null}

            {/* Itera por cada categoria dos produtos */}
            {Object.keys(listItemsByCategory()).length > 0
              ? Object.keys(listItemsByCategory()).map((category, index) => {
                  return (
                    <Box key={index} my={3}>
                      <Heading
                        style={{ textTransform: 'uppercase', letterSpacing: 4 }}
                        mb={2}
                        fontWeight="normal"
                        size="sm"
                      >
                        {category}
                      </Heading>

                      {/* Mostra todos os produtos pertencentes àquela categoria */}
                      {listItemsByCategory()[category].map((p) => (
                        <LixtProductItem
                          key={p.id}
                          product={p}
                          idSelectedList={selectedList.id}
                          deleteFromList={deleteProductOfList}
                          navigate={props.navigation.navigate}
                        />
                      ))}
                    </Box>
                  );
                })
              : null}
          </VStack>
        </ScrollView>
      ) : (
        <Center w="90%" mx="auto" my="50%">
          <Text textAlign="center">{t('noListsFound')}</Text>
          <Button
            onPress={() => {
              props.navigation.navigate('NewList');
            }}
            marginTop={5}
            paddingX={20}
            paddingY={4}
            testID="create-first-list"
          >
            {t('createMyFirstList')}
          </Button>
        </Center>
      )}

      {isListRemoveModalOpen && (
        <ListRemoveModal
          isOpen={isListRemoveModalOpen}
          closeModal={(val) => {
            setConfirmRemoval(val);
            setIsListRemoveModalOpen(false);
          }}
        />
      )}
    </SafeAreaView>
  ) : (
    <Center style={style.container}>
      <Spinner size="lg" />
      <Text mt={2}>{t('loadingLists')}</Text>
    </Center>
  );
}

ListScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
