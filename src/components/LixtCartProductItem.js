import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getMeasureType } from '../utils/measureTypes';
import { Pressable, Box, HStack, Text, Checkbox, useToast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthProvider';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';
import { ListContext } from '../context/ListProvider';
import NumberStepperInput from './NumberStepperInput';
import ProductOfListService from '../services/ProductOfListService';
import { useTranslation } from 'react-i18next';

const LixtCartProductItem = ({
  product,
  navigate,
  refreshList,
  getUserById,
}) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { setLists, lists } = useContext(ListContext);
  const toast = useToast();
  const { checkItem, changeCheckedAmount } = useContext(CheckedItemsContext);
  const [isChecked, setIsChecked] = useState(product.isMarked);
  const [isDisabled, setIsDisabled] = useState(false);
  const [markedAmount, setMarkedAmount] = useState(0);

  useEffect(() => {
    setIsChecked(product.isMarked);

    // Desabilita o checkbox caso já esteja marcado por outro usuário ou esteja atribuído para outro
    setIsDisabled(
      (product.isMarked && product.userWhoMarkedId !== user.id) ||
        (product.assignedUserId && product.assignedUserId !== user.id)
    );

    if (isChecked) {
      setMarkedAmount(product.markedAmount || product.plannedAmount);
    }
  }, [product]);

  const toggleProductFromSingleList = async (isSelected) => {
    // Se o checbox estiver desabilitado nem continua
    if (isDisabled) return;

    try {
      // Esse endpoint atribui ou desatribui um item para o próprio usuário
      const { data } = await ProductOfListService.toggleItem(
        product.id,
        isSelected,
        user
      );

      // Se a resposta for 1, quer dizer que o usuário atual está responsável por este item
      // caso for 0 quer dizer que algum outro usuário se responsabilizou antes de você atualizar a lista
      if (data === 1) {
        setIsChecked(isSelected);
        product.isMarked = isSelected;
        product.userWhoMarkedId = isSelected ? user.id : null;

        if (!isSelected) {
          product.markedAmount = null;
        }

        setMarkedAmount(product.plannedAmount);
        checkItem(
          {
            id: product.id,
            price: product.price,
            amount: product.plannedAmount,
          },
          isSelected
        );
      } else if (data === 0) {
        toast.show({
          title: t('anotherUserIsResponsible'),
          status: 'warning',
        });

        // Se outro usuário tiver se responsabilizado pelo item dê
        // um refresh na lista para pegar essa atualização
        refreshList();
      }
    } catch (error) {
      toast.show({
        title: t('errorServerDefault'),
        status: 'warning',
      });
    }
  };

  const changeMarkedAmount = async (value) => {
    try {
      await ProductOfListService.changeMarkedAmount(product.id, value, user);

      // Depois da requisição edita a lista atual sem usar o refreshList()
      // para que não seja necessário disparar uma nova requisição
      const listIndex = lists.findIndex((list) => list.id === product.listId);

      // Cria uma cópia da lista atual
      const editedList = Object.assign({}, lists[listIndex]);

      // Edita os productsOfList que há dentro dessa cópia, alterando o
      // valor de itens marcados do produto atual
      editedList.productsOfList = editedList.productsOfList.map((p) => {
        if (p.id === product.id) {
          p.markedAmount = value;
        }
        return p;
      });

      // Substitui a lista atual com a lista editada com os valores alterados
      const editedLists = [...lists];
      editedLists.splice(listIndex, 1, editedList);

      setLists(editedLists);

      // Modifica o valor de itens marcados no context da aplicação
      changeCheckedAmount(product.id, value);
    } catch (error) {
      setMarkedAmount(product.markedAmount);
      toast.show({
        title: t('errorServerDefault'),
        status: 'warning',
      });
    }
  };

  const Amounts = () => {
    // Exibe as quantidades do item, se o usuário tiver marcado uma
    // quantidade diferente da planejada exibe a distinção
    return (
      <Box mt={1}>
        {product.measureType === 'UNITY' ? (
          <Box>
            <Text>
              {isChecked && `${t('planned')}: `}
              {product.plannedAmount} {getMeasureType(product.measureType)}
            </Text>
            {isChecked && (
              <Box>
                <NumberStepperInput
                  labelName="marked"
                  width={170}
                  skin="square"
                  value={markedAmount}
                  color={isDisabled ? '#e6e6e6' : '#0891b2'}
                  inputNumberStepperID={`amount-input-${product.name}`}
                  onChange={(value) => {
                    setMarkedAmount(value);
                    changeMarkedAmount(value);
                  }}
                  min={1}
                  step={1}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Text>
              {isChecked && `${t('planned')}: `}
              {`${product.plannedAmount || 0} x ${
                product.measureValue || 0
              } ${getMeasureType(product.measureType)}`}
            </Text>
            {isChecked && (
              <HStack alignItems="center" width={200}>
                <NumberStepperInput
                  labelName="marked"
                  width={170}
                  skin="square"
                  value={markedAmount}
                  color={isDisabled ? '#e6e6e6' : '#0891b2'}
                  inputNumberStepperID={`amount-input-${product.name}`}
                  onChange={(value) => {
                    setMarkedAmount(value);
                    changeMarkedAmount(value);
                  }}
                  min={1}
                  step={1}
                />
                <Text mt={5}>
                  x {product.measureValue || 0}
                  {getMeasureType(product.measureType)}
                </Text>
              </HStack>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      flexDirection="row"
      key={product.id}
      my={3}
      alignItems="center"
      testID="cart-product-item"
    >
      <Box mr={5}>
        <Checkbox
          isDisabled={isDisabled}
          accessibilityLabel={t('markItem')}
          value={product.isMarked}
          isChecked={isChecked}
          onChange={toggleProductFromSingleList}
          size="md"
          testID="cart-product-item-checkbox"
        />
      </Box>

      <Box>
        <Pressable
          onPress={() => {
            navigate('ProductOfListDetails', {
              product,
              origin: 'Cart',
            });
          }}
        >
          <Text strikeThrough={isChecked} fontWeight="bold">
            {product.name}
          </Text>

          <Text>
            {product.price
              ? `${t('currency')} ${
                  product.price *
                  (product.markedAmount || product.plannedAmount)
                }`
              : `${t('currency')} 0,00`}
          </Text>

          <Amounts />
        </Pressable>

        {/* Se o item estiver atribuído mas não estiver marcado, mostra
        pra quem ele está atribuído */}
        {product.assignedUserId && !product.userWhoMarkedId ? (
          <Text fontSize="sm">
            {t('assignedTo')} {getUserById(product.assignedUserId)}
          </Text>
        ) : null}

        {/* Caso ele esteja marcado e o usuário que marcou não seja o usuário logado
        mostra quem marcou */}
        {product.isMarked && product.userWhoMarkedId !== user.id ? (
          <Text fontSize="sm" mt={2}>
            {t('markedBy')} {getUserById(product.userWhoMarkedId)}
          </Text>
        ) : null}
      </Box>

      {product.amountComment ? (
        <Pressable
          ml="auto"
          mr={5}
          accessibilityLabel={t('commentaries')}
          onPress={() => {
            navigate('Commentaries', { product });
          }}
          p={2}
          flexDirection="row"
          justifyContent="space-around"
        >
          <Text mr={2}>{product.amountComment}</Text>
          <Ionicons name="chatbox-outline" size={24} color="#27272a" />
        </Pressable>
      ) : null}
    </Box>
  );
};

export default LixtCartProductItem;

LixtCartProductItem.propTypes = {
  navigate: PropTypes.func,
  product: PropTypes.object,
  isGeneralViewOpen: PropTypes.bool,
  idSelectedList: PropTypes.any,
  refreshList: PropTypes.func,
  getUserById: PropTypes.func,
};
