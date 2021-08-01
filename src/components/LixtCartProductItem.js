import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getMeasureType } from '../utils/measureTypes';
import { Pressable, Box, Text, Checkbox, useToast } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthProvider';
import { CheckedItemsContext } from '../context/CheckedItemsProvider';
import ProductOfListService from '../services/ProductOfListService';
import { useTranslation } from 'react-i18next';

const LixtCartProductItem = ({
  product,
  navigate,
  refreshList,
  getAssignedUserById,
}) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const { checkedItems, checkItem } = useContext(CheckedItemsContext);
  const [isChecked, setIsChecked] = useState(product.isMarked);

  useEffect(() => {
    const localCheck = verifyIfWasLocallyChecked();

    // Caso o produto esteja marcado no produto que veio do servidor mas não estiver no local
    // marca o produto na visualização da tela
    if (product.isMarked && !localCheck) {
      setIsChecked(true);
    } else {
      // caso não, utiliza o valor local para o marcar o item (seja falso ou não)
      setIsChecked(localCheck);
    }
  }, [checkedItems]);

  // Desabilita o checkbox caso já esteja marcado por outro usuário ou esteja atribuído para outro
  const [isDisabled] = useState(
    (product.isMarked && product.userWhoMarkedId !== user.id) ||
      (product.assignedUserId && product.assignedUserId !== user.id)
  );

  const toggleProductFromSingleList = async (isSelected) => {
    // Se o checbox estiver desabilitado nem continua
    if (isDisabled) return;

    // Checa o item localmente
    checkItem(product.id, isSelected);

    try {
      // Esse endpoint atribui ou desatribui um item para o próprio usuário
      const { data } = await ProductOfListService.assignOrUnassignMyself(
        product.id,
        user
      );

      // Se a resposta for 1, quer dizer que o usuário atual está responsável por este item
      // caso for 0 quer dizer que algum outro usuário se responsabilizou antes de você atualizar a lista
      if (data === 0) {
        toast.show({
          title: 'Outro usuário se responsabilizou por este item',
          status: 'warning',
        });

        // Se outro usuário tiver se responsabilizado pelo item desmarca localmente
        checkItem(product.id, false);
        refreshList();
      }
    } catch (error) {
      toast.show({
        title: 'Não foi possível atribuir este item a você',
        status: 'warning',
      });
    }
  };

  const verifyIfWasLocallyChecked = () => {
    let checkedLocalValue = false;
    if (checkedItems && checkedItems.find((i) => i === product.id)) {
      checkedLocalValue = true;
    }

    return checkedLocalValue;
  };

  return (
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
          isChecked={isChecked}
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
              {product.amount} {getMeasureType(product.measureType)}
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

        {product.assignedUserId && product.assignedUserId !== user.id ? (
          <Text fontSize="sm">
            atribuído a {getAssignedUserById(product.assignedUserId)}
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
    </Pressable>
  );
};

export default LixtCartProductItem;

LixtCartProductItem.propTypes = {
  navigate: PropTypes.func,
  product: PropTypes.object,
  isGeneralViewOpen: PropTypes.bool,
  idSelectedList: PropTypes.any,
  refreshList: PropTypes.func,
  getAssignedUserById: PropTypes.func,
};
