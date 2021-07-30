import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  Box,
  Select,
  Center,
  Text,
  ScrollView,
  Heading,
  VStack,
} from 'native-base';
import LixtCartGeneralView from '../../components/LixtCartGeneralView';
import LixtCartIndividualList from '../../components/LixtCartIndividualList';
import ListService from '../../services/ListService';

import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation } from 'react-i18next';
import { ListContext } from '../../context/ListProvider';
import { AuthContext } from '../../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';

export default function CartScreen(props) {
  const { lists, setLists } = useContext(ListContext);
  const { user } = useContext(AuthContext);
  const [selectedList, setSelectedList] = useState({
    id: 'view-all',
    groupedProducts: [],
  });

  const { t } = useTranslation();

  /**
   * @todo atualizar corretamente lista individual após edição
   * @todo implementar visão geral
   * @todo mostrar usuários atribuídos
   * @todo calcular preço total
   */

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa
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
    if (selectedList?.id === 'view-all') {
      setSelectedList({ id: 'view-all', groupedProducts: unifyAllProducts() });
    } else {
      setSelectedList(
        lists.find((l) => Number(l.id) === Number(selectedList.id))
      );
    }
  }, [lists]);

  const handleSelectChange = (listId) => {
    if (listId === 'view-all') {
      setSelectedList({ id: 'view-all', groupedProducts: unifyAllProducts() });
    } else {
      setSelectedList(lists.find((list) => list.id === Number(listId)));
    }
  };

  const refreshIndividualList = async () => {
    try {
      const { data } = await ListService.getListById(selectedList.id, user);

      const editedLists = lists.map((l) =>
        l.id === selectedList.id ? data : l
      );

      setLists(editedLists);
    } catch (error) {
      console.log(error);
    }
  };

  const unifyAllProducts = () => {
    const allProductsOfLists = [];

    // Pega todos os itens inclusos em todas as listas
    for (const list of lists) {
      allProductsOfLists.push(...list.productsOfList);
    }

    const groupedProducts = [];

    for (const productOfList of allProductsOfLists) {
      // Tenta encontrar se um mesmo produto de listas diferentes já foi incluso em groupedProducts
      const groupedProductIndex = groupedProducts.findIndex(
        (p) => p.productId === productOfList.productId
      );

      // Caso tenha encontrado um id de produto igual, agrupa no objeto
      // o id da lista do item atual e o preço do item atual e atualiza a lista do groupedProducts
      if (groupedProductIndex >= 0) {
        const groupedProduct = Object.assign(
          {},
          groupedProducts[groupedProductIndex]
        );
        groupedProduct.listsIds.push(productOfList.listId);
        groupedProduct.prices.push(productOfList.price);
        groupedProducts[groupedProductIndex] = groupedProduct;
      } else {
        // Caso não tenha achado nenhum objeto com id de produto igual ao id de produto do item
        // cria um objeto novo
        const newGroupedProduct = {
          productId: productOfList.productId,
          listsIds: [productOfList.listId],
          prices: [productOfList.price],
          product: productOfList.product,
        };

        groupedProducts.push(newGroupedProduct);
      }
    }

    // setSelectedList({ id: 'view-all', groupedProducts });
    return groupedProducts;
  };

  return lists.length ? (
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
            <Select.Item key={list.id} value={list.id} label={list.nameList} />
          ))}
        </Select>
      </Box>
      <ScrollView>
        {selectedList?.id && selectedList?.id !== 'view-all' ? (
          <LixtCartIndividualList
            selectedList={selectedList}
            navigate={props.navigation.navigate}
            refreshIndividualList={refreshIndividualList}
          />
        ) : (
          <LixtCartGeneralView
            selectedList={selectedList}
            navigate={props.navigation.navigate}
          />
        )}
      </ScrollView>
    </SafeAreaView>
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
