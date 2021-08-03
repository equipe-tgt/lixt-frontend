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
    let modified = [];

    // Para cada productOfList que consta dentro de wrappedProduct
    for (const productOfList of wrappedProduct.productsOfLists) {
      modified.push(productOfList.id);

      try {
        // Se o usuário estiver marcando todos os itens que tiverem o msm id de produto
        // mas já houverem itens que estão atribuídos ao usuário atual não precisa prosseguir
        // com a requisição pra esses
        // ou se o usuário quer desmarcar todos os itens que tiverem o msm id de produto porém
        // já houverem itens que não estão marcados para o usuário atual não precisa prosseguir
        // Ou seja, marca e desmarca apenas os itens que precisam
        if (
          (isSelecting && productOfList.assignedUserId === user.id) ||
          (!isSelecting &&
            !!productOfList.assignedUserId &&
            productOfList.assignedUserId !== user.id)
        ) {
          continue;
        }

        // Esse endpoint atribui ou desatribui um item para o próprio usuário
        const { data } = await ProductOfListService.assignOrUnassignMyself(
          productOfList.id,
          user
        );

        productOfList.assignedUserId = data.assignedUserId;

        // Se a resposta for 1, quer dizer que o usuário atual está responsável por este item
        // caso for 0 quer dizer que algum outro usuário se responsabilizou antes de você atualizar a lista
        if (data === 0) {
          toast.show({
            title: 'Outro usuário se responsabilizou por este item',
            status: 'warning',
          });

          // Se outro usuário tiver se responsabilizado pelo item desmarca localmente
          modified = modified.filter((m) => m === productOfList.id);
        }
      } catch (error) {
        console.log(error);
        toast.show({
          title: 'Não foi possível marcar o item',
          status: 'warning',
        });
      }
    }
    checkMultipleItems(modified, isSelecting);
    setIsChecked(isSelecting);
    setLoadingCheckbox(false);
  };

  const getQuantityObject = () => {
    let finalAmount = 0;
    let markedProductsAmount = 0;
    let allPrices = 0;

    for (const productOfList of wrappedProduct.productsOfLists) {
      finalAmount += productOfList.amount;
      allPrices += productOfList.price * productOfList.amount;

      if (checkedItems.includes(productOfList.id)) {
        markedProductsAmount += productOfList.amount;
      } else if (productOfList.isMarked) {
        markedProductsAmount += productOfList.amount;
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
    const markedLocally = wrappedProduct.productsOfLists.every((p) =>
      checkedItems.includes(p.id)
    );

    // Caso os produtos estejam marcados como veio do servidor mas não estiver no local
    // marca o produto na visualização da tela
    if (markedExternally && !markedLocally) {
      setIsChecked(true);
    } else {
      // caso não, utiliza o valor local para o marcar o item (seja falso ou não)
      setIsChecked(markedLocally);
    }
  };

  return wrappedProduct ? (
    <Pressable
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
              {quantities.price ? `$ ${quantities.price}` : '$ 0,00'}
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
