import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, RefreshControl } from 'react-native';
import { Box, Select, Center, Text, ScrollView, useToast } from 'native-base';
import LixtCartList from '../../components/LixtCartList';
import ListService from '../../services/ListService';

import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation } from 'react-i18next';
import { ListContext } from '../../context/ListProvider';
import { AuthContext } from '../../context/AuthProvider';
import { CheckedItemsProvider } from '../../context/CheckedItemsProvider';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

export default function CartScreen(props) {
  const { lists, setLists } = useContext(ListContext);
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [selectedList, setSelectedList] = useState({
    id: 'view-all',
    productsOfList: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  /**
   * @todo atualizar corretamente lista individual após edição
   * @todo implementar visão geral
   * @todo mostrar usuários atribuídos
   * @todo calcular preço total
   */

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa (até agora a de edição do item manda)
    if (props.route.params) {
      // Caso a tela peça para fazer refresh atualiza as listas
      if (props.route.params.refresh) {
        if (selectedList.id !== 'view-all') {
          refreshIndividualList();
        }

        props.route.params.refresh = null;
      }
    }
  });

  useEffect(() => {
    if (isFocused) {
      if (selectedList?.id === 'view-all') {
        setSelectedList({ id: 'view-all', productsOfList: unifyAllProducts() });
      } else {
        setSelectedList(
          lists.find((l) => Number(l.id) === Number(selectedList.id))
        );
      }
    }
  }, [lists]);

  const handleSelectChange = (listId) => {
    if (listId === 'view-all') {
      setSelectedList({ id: 'view-all', productsOfList: unifyAllProducts() });
    } else {
      setSelectedList(lists.find((list) => list.id === Number(listId)));
    }
  };

  const refreshIndividualList = async () => {
    setRefreshing(true);
    try {
      const { data } = await ListService.getListById(selectedList.id, user);

      const editedLists = lists.map((l) =>
        l.id === selectedList.id ? data : l
      );

      setLists(editedLists);
    } catch (error) {
      console.log(error);
      toast.show({
        title: 'Não foi possível buscar a lista atualizada',
        status: 'warning',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const refreshLists = async () => {
    setRefreshing(true);
    try {
      const { data } = await ListService.getLists(user);
      setLists(data);
    } catch (error) {
      console.log(error);
      toast.show({
        title: 'Não foi possível buscar a lista atualizada',
        status: 'warning',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const unifyAllProducts = () => {
    const allProductsOfLists = [];

    // Pega todos os itens inclusos em todas as listas
    for (const list of lists) {
      // Pega os itens caso productsOfList não seja null e possua itens
      if (list.productsOfList && list.productsOfList.length > 0) {
        allProductsOfLists.push(...list.productsOfList);
      }
    }

    const groupedProducts = [];

    for (const productOfList of allProductsOfLists) {
      // Não leva em consideração no agrupamento produtos que foram marcados por outros usuários (ou atribuídos para outros usuários)
      // uma vez que não será possível manipulá-los de nenhuma forma
      if (
        (productOfList.isMarked && productOfList.userWhoMarkedId !== user.id) ||
        (productOfList.assignedUserId &&
          productOfList.assignedUserId !== user.id)
      ) {
        continue;
      }

      // Atributos do produto da lista
      const { id, listId, productId, price, amount, isMarked, product } =
        productOfList;

      // Tenta encontrar se um mesmo produto de listas diferentes já foi incluso em groupedProducts
      const groupedProductIndex = groupedProducts.findIndex(
        (p) => p.productId === productId
      );

      // Caso tenha encontrado um id de produto igual, agrupa no objeto os atributos de
      // id da lista do item atual e o preço do item atual e atualiza a lista do groupedProducts
      if (groupedProductIndex >= 0) {
        const groupedProduct = Object.assign(
          {},
          groupedProducts[groupedProductIndex]
        );

        // groupedProduct.productOfListIds.push(id);
        groupedProduct.productsOfLists.push(productOfList);
        groupedProduct.inLists.push(getSuperficialListDataById(listId));
        groupedProduct.priceAndAmounts.push({
          price: price,
          amount: amount,
        });
        groupedProduct.markings.push({ isMarked: isMarked, listId: listId });
        groupedProducts[groupedProductIndex] = groupedProduct;
      } else {
        // Caso não tenha achado nenhum objeto com id de produto igual ao id de produto do item
        // cria um objeto novo
        const newGroupedProduct = {
          productId: productId,
          // productOfListIds: [id], quando o endpoint de toggle estiver feito usar dessa forma
          productsOfLists: [productOfList],
          inLists: [getSuperficialListDataById(listId)],
          priceAndAmounts: [{ price: price, amount: amount }],
          markings: [{ isMarked: isMarked, listId: listId }],
          product: product,
        };

        groupedProducts.push(newGroupedProduct);
      }
    }
    return groupedProducts;
  };

  const getSuperficialListDataById = (id) => {
    const list = lists.find((l) => l.id === id);

    return {
      id: id,
      name: list.nameList,
    };
  };

  return lists?.length ? (
    <CheckedItemsProvider>
      <SafeAreaView style={style.container}>
        <Box w="90%" mx="auto">
          <Select
            selectedValue={selectedList?.id}
            width="70%"
            onValueChange={handleSelectChange}
            isDisabled={lists.length === 0}
          >
            <Select.Item
              key="view-all"
              value="view-all"
              label="Ver todos os itens"
            />
            {lists.map((list) => (
              <Select.Item
                key={list.id}
                value={list.id}
                label={list.nameList}
              />
            ))}
          </Select>
        </Box>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                selectedList.id === 'view-all'
                  ? refreshLists
                  : refreshIndividualList
              }
            />
          }
        >
          {selectedList && selectedList?.productsOfList?.length ? (
            <LixtCartList
              selectedList={selectedList}
              navigate={props.navigation.navigate}
              userId={user.id}
              refreshList={
                selectedList.id === 'view-all'
                  ? refreshLists
                  : refreshIndividualList
              }
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </CheckedItemsProvider>
  ) : (
    <SafeAreaView style={style.container}>
      <Center w="90%" mx="auto" my="50%">
        <Text textAlign="center">{t('noListsFound')}</Text>
      </Center>
    </SafeAreaView>
  );
}

CartScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};
