import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Pressable,
  Box,
  Text,
  Checkbox,
  useToast,
  HStack,
  Spinner,
} from 'native-base';

import { AuthContext } from '../context/AuthProvider';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';
import ProductOfListService from '../services/ProductOfListService';
import { useTranslation } from 'react-i18next';

const LixtCartProductItemGeneral = ({ wrappedProduct }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { checkedItems, checkMultipleItems } = useContext(CheckedItemsContext);
  const toast = useToast();
  const [quantities, setQuantities] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [loadingCheckbox, setLoadingCheckbox] = useState(false);

  useEffect(() => {
    if (wrappedProduct?.productsOfLists) {
      setQuantities(getQuantityObject());
    }

    if (wrappedProduct?.markings) {
      // caso o item esteja marcado em todas as listas, então ele aparecerá
      // como marcado aqui também
      verifyCheckings();
    }
  }, [wrappedProduct]);

  useEffect(() => {
    if (wrappedProduct?.productsOfLists) {
      setQuantities(getQuantityObject());
    }
  }, [checkedItems]);

  const toggleProduct = async (isSelecting) => {
    setLoadingCheckbox(true);
    const modified = [];

    // Para cada productOfList que consta dentro de wrappedProduct
    for (const productOfList of wrappedProduct.productsOfLists) {
      try {
        // Se o usuário estiver marcando todos os itens que tiverem o msm id de produto
        // mas já houverem itens que estão atribuídos ao usuário atual não precisa prosseguir
        // com a requisição pra esses
        // ou se o usuário quer desmarcar todos os itens que tiverem o msm id de produto porém
        // já houverem itens que não estão marcados para o usuário atual não precisa prosseguir
        // Ou seja, marca e desmarca apenas os itens que precisam
        if (
          (isSelecting && productOfList.userWhoMarkedId === user.id) ||
          (!isSelecting && productOfList.userWhoMarkedId !== user.id)
        ) {
          continue;
        }

        const { data } = await ProductOfListService.toggleItem(
          productOfList.id,
          isSelecting,
          user
        );

        if (data === 1) {
          productOfList.userWhoMarkedId = isSelecting ? user.id : null;
          productOfList.isMarked = isSelecting;

          modified.push({
            id: productOfList.id,
            price: productOfList.price,
            amount: productOfList.plannedAmount,
          });
        }

        // Se a resposta for 1, quer dizer que o usuário atual marcou este item
        // caso for 0 quer dizer que algum outro usuário se responsabilizou antes de você atualizar a lista
        else if (data === 0) {
          toast.show({
            title: t('anotherUserIsResponsibleForAnItem'),
            status: 'warning',
          });
        }
      } catch (error) {
        console.log(error);
        toast.show({
          title: t('errorServerDefault'),
          status: 'warning',
        });
      }
    }

    if (modified.length) {
      checkMultipleItems(modified, isSelecting);
      setIsChecked(isSelecting);
    }

    setLoadingCheckbox(false);
  };

  const getQuantityObject = () => {
    let finalAmount = 0;
    let markedProductsAmount = 0;
    let allPrices = 0;

    for (const productOfList of wrappedProduct.productsOfLists) {
      const { markedAmount, plannedAmount, price, isMarked, userWhoMarkedId } =
        productOfList;

      // Se o valor de markedAmount existir ele que é o guia
      // caso contrário usa o valor de plannedAmount
      const currentAmount = markedAmount || plannedAmount;

      finalAmount += currentAmount;
      allPrices += price * currentAmount;

      if (isMarked && userWhoMarkedId === user.id) {
        markedProductsAmount += markedAmount || plannedAmount;
      }
    }

    return {
      price: allPrices,
      amount: finalAmount,
      markedProductsAmount,
    };
  };

  const verifyCheckings = () => {
    const markedExternally = wrappedProduct.markings.every((m) => m.isMarked);
    setIsChecked(markedExternally);
  };

  return wrappedProduct ? (
    <Pressable
      testID="product-item-general"
      flexDirection="row"
      key={wrappedProduct.productId}
      my={3}
      alignItems="center"
    >
      <HStack>
        <Box mr={5} flexDirection="row" alignItems="center">
          {!loadingCheckbox ? (
            <Checkbox
              accessibilityLabel={t('markItem')}
              value={isChecked}
              isChecked={isChecked}
              size="md"
              onChange={toggleProduct}
            />
          ) : (
            <Spinner size="sm" />
          )}
        </Box>

        <Box>
          <Text strikeThrough={isChecked} fontWeight="bold">
            {wrappedProduct.product.name}
          </Text>

          <Box>
            <Text>
              {quantities.markedProductsAmount} / {quantities.amount}
            </Text>

            <Text>
              {quantities.price
                ? `${t('currency')} ${quantities.price}`
                : `${t('currency')} 0,00`}
            </Text>
          </Box>

          <Text width="80%" fontSize="sm">
            {wrappedProduct && wrappedProduct?.inLists
              ? `${t('includedIn')} ${wrappedProduct.inLists
                  .map((l) => l.name)
                  .join(', ')}`
              : null}
          </Text>
        </Box>
      </HStack>
    </Pressable>
  ) : null;
};

export default LixtCartProductItemGeneral;

LixtCartProductItemGeneral.propTypes = {
  wrappedProduct: PropTypes.object,
};
