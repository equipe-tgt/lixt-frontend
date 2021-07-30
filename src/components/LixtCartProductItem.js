import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { getMeasureType } from '../utils/measureTypes';
import { Pressable, Box, Text, Checkbox, useToast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthProvider';
import ProductOfListService from '../services/ProductOfListService';
import { useTranslation } from 'react-i18next';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const LixtCartProductItem = ({
  product,
  navigate,
  idSelectedList,
  refreshIndividualList,
}) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  // Desabilita o checkbox caso já esteja marcado por outro usuário
  const [isDisabled] = useState(
    product.isMarked && product.userWhoMarkedId !== user.id
  );
  const toggleProductFromSingleList = async (isSelected) => {
    // Se o checbox estiver desabilitado nem continua
    if (isDisabled) return;

    product.isMarked = true;

    // Edita as propriedades de marcação e quem marcou
    const objToEdit = {
      ...product,
      isMarked: isSelected,
      userWhoMarkedId: isSelected ? user.id : null,
    };

    try {
      await ProductOfListService.editProductOfList(objToEdit, user);
      refreshIndividualList();
    } catch (error) {
      console.log(error);
      toast.show({
        title: 'Não foi possível marcar o item',
        status: 'warning',
      });
    }
  };

  return idSelectedList !== 'view-all' ? (
    <Pressable
      flexDirection="row"
      onPress={() => {
        navigate('ProductOfListDetails', {
          product,
          origin: 'Cart',
        });
      }}
      key={product.id}
      my={3}
      alignItems="center"
    >
      <Box mr={5}>
        <Checkbox
          isDisabled={isDisabled}
          accessibilityLabel={t('markItem')}
          value={product.isMarked}
          isChecked={product.isMarked}
          onChange={toggleProductFromSingleList}
          size="md"
        />
      </Box>

      <Box>
        <Text strikeThrough={product.isMarked} fontWeight="bold">
          {product.name}
        </Text>

        {getMeasureType(product.measureType) === 'UN' ? (
          <Box>
            <Text>
              {product.amounnt || 0} {getMeasureType(product.measureType)}
            </Text>

            <Text>{product.price ? `R$ ${product.price}` : 'R$ 0,00'}</Text>
          </Box>
        ) : (
          <Box>
            <Text>
              {`${product.amount || 0} x ${
                product.measureValue
              } ${getMeasureType(product.measureType)}`}
            </Text>

            <Text>{product.price ? `R$ ${product.price}` : 'R$ 0,00'}</Text>
          </Box>
        )}
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
    </Pressable>
  ) : (
    <Pressable>
      <Text>colocar item aqui</Text>
    </Pressable>
  );
};

export default LixtCartProductItem;

LixtCartProductItem.propTypes = {
  navigate: PropTypes.func,
  product: PropTypes.object,
  isGeneralViewOpen: PropTypes.bool,
  idSelectedList: PropTypes.any,
  refreshIndividualList: PropTypes.func,
};
