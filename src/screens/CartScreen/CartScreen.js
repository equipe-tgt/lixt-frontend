import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, RefreshControl } from 'react-native';
import {
  Select,
  Center,
  Text,
  ScrollView,
  useToast,
  Menu,
  Pressable,
  HStack,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import LixtCartList from '../../components/LixtCartList';
import LixtCalculator from '../../components/LixtCalculator';
import ListService from '../../services/ListService';
import PurchaseService from '../../services/PurchaseService';
import PurchaseLocalModal from '../../components/PurchaseLocalModal';

import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation } from 'react-i18next';
import { ListContext } from '../../context/ListProvider';
import { AuthContext } from '../../context/AuthProvider';
import { CheckedItemsProvider } from '../../context/CheckedItemsProvider';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

export default function CartScreen(props) {
  const { lists, setLists } = useContext(ListContext);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [selectedList, setSelectedList] = useState({
    id: 'view-all',
    productsOfList: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [checkedItemsFromCalculator, setCheckedItemsFromCalculator] = useState(
    []
  );
  const [totalPriceFromCalculator, setTotalPriceFromCalculator] = useState(0);

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa (até agora a de edição do item manda)
    if (props.route.params) {
      // Caso a tela peça para fazer refresh atualiza as listas
      if (props.route.params.refresh) {
        if (selectedList?.id !== 'view-all') {
          refreshIndividualList();
        }
        props.route.params.refresh = null;
      }
    }
  });

  useEffect(() => {
    refreshLists();
  }, [isFocused]);

  useEffect(() => {
    if (isFocused && lists) {
      if (selectedList && selectedList?.id === 'view-all') {
        setSelectedList({ id: 'view-all', productsOfList: unifyAllProducts() });
      } else {
        const idToFind = selectedList?.id;

        setSelectedList(lists.find((l) => Number(l.id) === Number(idToFind)));
      }
    } else {
      refreshLists();
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
      if (lists?.length) {
        const editedLists = lists.map((l) =>
          l.id === selectedList.id ? data : l
        );

        setLists(editedLists);
      }
    } catch (error) {
      toast.show({
        title: t('errorServerDefault'),
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
      toast.show({
        title: t('errorServerDefault'),
        status: 'warning',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getAllItems = () => {
    // Pega todos os itens inclusos em todas as listas
    const allProductsOfLists = [];
    for (const list of lists) {
      // Pega os itens caso productsOfList não seja null e possua itens
      if (list.productsOfList && list.productsOfList.length > 0) {
        allProductsOfLists.push(...list.productsOfList);
      }
    }
    return allProductsOfLists;
  };

  const unifyAllProducts = () => {
    const allProductsOfLists = getAllItems();

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
      const { listId, productId, isMarked, product } = productOfList;

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

        groupedProduct.productsOfLists.push(productOfList);
        groupedProduct.inLists.push(getSuperficialListDataById(listId));
        groupedProduct.markings.push({
          isMarked: isMarked,
          listId: listId,
        });
        groupedProducts[groupedProductIndex] = groupedProduct;
      } else {
        // Caso não tenha achado nenhum objeto com id de produto igual ao id de produto do item
        // cria um objeto novo
        const newGroupedProduct = {
          productId: productId,
          productsOfLists: [productOfList],
          inLists: [getSuperficialListDataById(listId)],
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

  const getItemOfPurchase = (productOfListOnPurchase) => {
    const {
      productId,
      id,
      name,
      price,
      plannedAmount,
      markedAmount,
      measureType,
      measureValue,
    } = productOfListOnPurchase;

    return {
      id: null,
      productOfListId: id,
      productId,
      name,
      price,
      amount: markedAmount || plannedAmount,
      measureType,
      measureValue,
      purchaseListId: null,
      product: null,
    };
  };

  const getPurchaseObject = (purchaseLocalId) => {
    const allItems = getAllItems();

    const idsToPurchase = checkedItemsFromCalculator.map((ci) => ci.id);

    const itemsOnPurchase = allItems.filter(({ id }) =>
      idsToPurchase.includes(id)
    );

    const purchaseLists = {};

    for (const itemOnPurchase of itemsOnPurchase) {
      const listId = itemOnPurchase.listId;
      const price = itemOnPurchase.price || 0;

      // Se já houver um objeto de agrupamento de itens de compra de uma mesma
      // lista, complementa os dados
      if (purchaseLists[listId]) {
        purchaseLists[listId].itemsOfPurchase.push(
          getItemOfPurchase(itemOnPurchase)
        );
        purchaseLists[listId].partialPurchasePrice +=
          price * (itemOnPurchase.markedAmount || itemOnPurchase.plannedAmount);
      } else {
        // Senão, define um novo objeto para ele e atribui os valores
        purchaseLists[listId] = {};
        purchaseLists[listId].id = null;
        purchaseLists[listId].purchaseId = null;
        purchaseLists[listId].listId = listId;
        purchaseLists[listId].purchaseId = null;
        purchaseLists[listId].partialPurchasePrice =
          price * (itemOnPurchase.markedAmount || itemOnPurchase.plannedAmount);
        purchaseLists[listId].itemsOfPurchase = [
          getItemOfPurchase(itemOnPurchase),
        ];
      }
    }

    return {
      id: null,
      purchaseDate: null,
      purchaseLists: Object.values(purchaseLists),
      purchaseLocal: null,
      purchaseLocalId: purchaseLocalId,
      purchasePrice: totalPriceFromCalculator,
      userId: null,
    };
  };

  const savePurchase = async (purchaseLocalId) => {
    setLoadingPurchase(true);
    const purchaseObject = getPurchaseObject(purchaseLocalId);

    let title;
    let status;

    try {
      await PurchaseService.createNewPurchase(purchaseObject, user);
      title = t('purchaseSaved');
      status = 'success';
    } catch (error) {
      title = t('unsuccessfullySaved');
      status = 'warning';
    } finally {
      toast.show({
        title,
        status,
      });
      setLoadingPurchase(false);
    }
  };

  console.log("lists?.length", lists?.length);

  return lists?.length ? (
    <CheckedItemsProvider>
      <SafeAreaView style={style.container}>
        <HStack
          w="90%"
          mx="auto"
          alignItems="center"
          justifyContent="space-between"
        >
          <Select
            selectedValue={selectedList?.id}
            width="70%"
            onValueChange={handleSelectChange}
            isDisabled={lists?.length === 0}
            testID="select-visualization-mode"
          >
            <Select.Item
              key="view-all"
              value="view-all"
              label={t('seeAllItems')}
            />
            {lists?.length &&
              lists?.map((list) => (
                <Select.Item
                  key={list.id}
                  value={list.id}
                  label={list.nameList}
                />
              ))}
          </Select>

          <Menu
            placement="bottom left"
            trigger={(triggerProps) => {
              return (
                <Pressable
                  testID="product-item-context-menu"
                  p={3}
                  {...triggerProps}
                >
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
              testID="history-item-menu"
              onPress={() => {
                props.navigation.navigate('History');
              }}
            >
              <HStack alignItems="center">
                <Text ml={2}> {t('history')} </Text>
              </HStack>
            </Menu.Item>
          </Menu>
        </HStack>
        <ScrollView
          testID="cart-refresh-control"
          contentContainerStyle={{ paddingBottom: 120 }}
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
          {selectedList && selectedList?.productsOfList?.length > 0 ? (
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
          ) : (
            <Center width="90%" mx="auto" my="50%">
              <Text textAlign="center">{t('noProductsFound')}</Text>
            </Center>
          )}
        </ScrollView>

        {selectedList && selectedList?.productsOfList?.length > 0 && (
          <LixtCalculator
            isGeneralView={selectedList?.id === 'view-all'}
            loadingPurchase={loadingPurchase}
            items={selectedList.productsOfList}
            finishPurchase={(checkedItems, totalPrice) => {
              setTotalPriceFromCalculator(totalPrice);
              setCheckedItemsFromCalculator(checkedItems);
              setShowModal(true);
            }}
          />
        )}

        <PurchaseLocalModal
          showModal={showModal}
          closeModal={(value) => {
            setShowModal(false);
            if (value) {
              savePurchase(value.id);
            }
          }}
        />
      </SafeAreaView>
    </CheckedItemsProvider>
  ) : (
    <SafeAreaView style={style.container}>
      <Center w="90%" mx="auto" my="50%">
        <Text textAlign="center">{t('noListsCreateANewOne')}</Text>
      </Center>
    </SafeAreaView>
  );
}

CartScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};
