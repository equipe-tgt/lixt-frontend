import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Heading } from 'native-base';
import LixtCartProductItem from '../components/LixtCartProductItem';
import LixtCartProductItemGeneral from '../components/LixtCartProductItemGeneral';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';
import { useTranslation } from 'react-i18next';

export default function LixtCartList({
  selectedList,
  refreshList,
  navigate,
  userId,
}) {
  const [itemsShownByCategory, setItemsShownByCategory] = useState({});
  const { setCheckedItems } = useContext(CheckedItemsContext);
  const { t } = useTranslation();

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
      // Se a visão for de uma lista só, atribui os itens dessa lista
      // que foram marcados por esse usuário
      items = selectedList.productsOfList.filter(
        (item) => item.isMarked && item.userWhoMarkedId === userId
      );
    }

    // Cria um objeto simplificado do productOfList
    items = items.map((i) => {
      const currentAmount = i.markedAmount || i.plannedAmount;

      return {
        id: i.id,
        price: i.price,
        amount: currentAmount,
        listId: i.listId,
      };
    });

    setCheckedItems(items);
  };

  const listItemsByCategory = () => {
    if (selectedList && selectedList?.productsOfList?.length) {
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
      setItemsShownByCategory(groupedProducts);
    }
  };

  const getUserById = (userToFindId) => {
    const listMembers = selectedList?.listMembers;

    // se o id do usuário que está sendo procurado for igual ao do
    // usuário logado retorna o label 'você'
    if (userToFindId === userId) {
      return t('you').toLowerCase();
    }

    // caso o id seja igual ao do dono da lista, retorna o nome dele
    if (selectedList.ownerId === userToFindId) {
      return selectedList.owner;
    }

    // caso não for nenhuma das alternativas acima, retorna o nome do usuário
    // que estiver na lsita de convidados
    const guestUser = listMembers.find(
      (lm) => lm.userId === userToFindId
    )?.user;
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
                    return p.id ? (
                      <LixtCartProductItem
                        key={p.id}
                        product={p}
                        navigate={navigate}
                        refreshList={refreshList}
                        getUserById={getUserById}
                      />
                    ) : null;
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
