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
import LixtCartProductItem from '../../components/LixtCartProductItem';
import ListService from '../../services/ListService';

import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation } from 'react-i18next';
import { ListContext } from '../../context/ListProvider';
import { AuthContext } from '../../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';

export default function CartScreen(props) {
  const { lists, setLists } = useContext(ListContext);
  const { user } = useContext(AuthContext);
  const [selectedList, setSelectedList] = useState({ id: 'view-all' });
  const [itemsShownByCategory, setItemsShownByCategory] = useState({});

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
    if (selectedList?.id !== 'view-all') {
      listItemsByCategory();
    }
  }, [selectedList]);

  useEffect(() => {
    if (selectedList?.id !== 'view-all') {
      setSelectedList(
        lists.find((l) => Number(l.id) === Number(selectedList.id))
      );
      listItemsByCategory();
    }
  }, [lists]);

  const listItemsByCategory = () => {
    if (selectedList && selectedList?.productsOfList) {
      // Agrupa os produtos por categorias
      const groupedProducts = selectedList.productsOfList.reduce(
        (accumlator, currentProductOfList) => {
          accumlator[currentProductOfList.product.category.name] = [
            ...(accumlator[currentProductOfList.product.category.name] || []),
            currentProductOfList,
          ];
          return accumlator;
        },
        {}
      );
      setItemsShownByCategory(groupedProducts);
    }
    return {};
  };

  const handleSelectChange = (listId) => {
    if (listId === 'view-all') {
      setSelectedList({ id: 'view-all' });
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
        <VStack w="90%" mx="auto">
          {Object.keys(itemsShownByCategory).length > 0
            ? Object.keys(itemsShownByCategory).map((category, index) => {
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
                    {itemsShownByCategory[category].map((p) => (
                      <LixtCartProductItem
                        key={p.id}
                        idSelectedList={p.listId}
                        product={p}
                        navigate={props.navigation.navigate}
                        refreshIndividualList={refreshIndividualList}
                      />
                    ))}
                  </Box>
                );
              })
            : null}
        </VStack>
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
