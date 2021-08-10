import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Heading } from 'native-base';
import LixtCartProductItem from '../components/LixtCartProductItem';
import LixtCartProductItemGeneral from '../components/LixtCartProductItemGeneral';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';

export default function LixtCartList({
  selectedList,
  refreshList,
  navigate,
  userId,
}) {
  const [itemsShownByCategory, setItemsShownByCategory] = useState({});
  const { setCheckedItems } = useContext(CheckedItemsContext);

  useEffect(() => {
    getAllTheCheckedItemsOnThisList();
    listItemsByCategory();
  }, [selectedList]);

  const getAllTheCheckedItemsOnThisList = () => {
    let items = [];
    // Se a visão da lista for geral
    if (selectedList?.id === 'view-all') {
      // Da lista selecionada, pega cada objeto unificado
      for (const groupedProduct of selectedList.productsOfList) {

        // Desse objeto, pegue os itens e apenas pegue os itens 
        // marcados pelo usuário atual
        const everyItem = groupedProduct.productsOfLists
          .flat()
          .filter((item) => item.isMarked && item.userWhoMarkedId === userId);
        items.push(...everyItem);
      }
    } else {
      items = selectedList.productsOfList.filter(
        (item) => item.isMarked && item.userWhoMarkedId === userId
      );
    }

    items = items.map((i) => {
      return {
        id: i.id,
        price: i.price,
        amount: i.amount,
        listId: selectedList?.id,
      };
    });

    setCheckedItems(items);
  };

  const listItemsByCategory = () => {
    if (selectedList && selectedList?.productsOfList?.length) {
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
  };

  const getAssignedUserById = (userId) => {
    const listMembers = selectedList?.listMembers;

    if (selectedList.ownerId === userId) {
      return selectedList.owner;
    }

    const guestUser = listMembers.find((lm) => lm.userId === userId)?.user;
    return guestUser?.name || '';
  };

  return (
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
                {itemsShownByCategory[category].map((p) => {
                  if (selectedList?.id === 'view-all') {
                    return (
                      <LixtCartProductItemGeneral
                        key={p.productId}
                        wrappedProduct={p}
                      />
                    );
                  } else {
                    return (
                      p.id && (
                        <LixtCartProductItem
                          key={p.id}
                          product={p}
                          navigate={navigate}
                          refreshList={refreshList}
                          getAssignedUserById={getAssignedUserById}
                        />
                      )
                    );
                  }
                })}
              </Box>
            );
          })
        : null}
    </VStack>
  );
}

LixtCartList.propTypes = {
  navigate: PropTypes.func,
  selectedList: PropTypes.object,
  refreshList: PropTypes.func,
  userId: PropTypes.number,
};
