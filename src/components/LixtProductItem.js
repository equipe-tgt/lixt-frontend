import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getMeasureType } from '../utils/measureTypes';
import { Pressable, Box, Menu, Text } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { convertDecimalBasedOnLanguage } from '../utils/convertion';

const LixtProductItem = ({
  product,
  navigate,
  idSelectedList,
  deleteFromList,
}) => {
  const { t } = useTranslation();
  const [markedAndPlannedDiffer] = useState(
    product.markedAmount && product.markedAmount !== product.plannedAmount
  );

  const Amounts = () => {
    // Exibe as quantidades do item, se o usuário tiver marcado uma
    // quantidade diferente da planejada exibe a distinção
    return (
      <Box mt={1}>
        {product.measureType === 'UNITY' ? (
          <Box>
            <Text>
              {markedAndPlannedDiffer ? `${t('planned')}: ` : null}
              {product.plannedAmount} {getMeasureType(product.measureType)}
            </Text>
            {markedAndPlannedDiffer ? (
              <Text>
                {`${t('marked')}: `}
                {product.markedAmount} {getMeasureType(product.measureType)}
              </Text>
            ) : null}
          </Box>
        ) : (
          <Box>
            <Text>
              {markedAndPlannedDiffer ? `${t('planned')}: ` : null}
              {`${product.plannedAmount || 0} x ${
                product.measureValue || 0
              } ${getMeasureType(product.measureType)}`}
            </Text>
            {markedAndPlannedDiffer ? (
              <Text>
                {`${t('marked')}: `}
                {`${product.markedAmount || 0} x ${
                  product.measureValue || 0
                } ${getMeasureType(product.measureType)}`}
              </Text>
            ) : null}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Pressable
      key={product.id}
      my={3}
      onPress={() => {
        navigate('ProductOfListDetails', {
          product,
          origin: 'Lists',
        });
      }}
    >
      <Box w="100%">
        <Text fontWeight="bold">{product.name}</Text>
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Amounts />

          <Text mt={1}>
            {product.price
              ? convertDecimalBasedOnLanguage(
                  product.price *
                    (product.markedAmount || product.plannedAmount)
                )
              : convertDecimalBasedOnLanguage('0,00')}
          </Text>
        </Box>

        <Box>
          {product.amountComment ? (
            <Pressable
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

        <Menu
          trigger={(triggerProps) => {
            return (
              <Pressable
                testID="product-item-context-menu"
                p={3}
                {...triggerProps}
              >
                <Ionicons size={18} color="#27272a" name="ellipsis-vertical" />
              </Pressable>
            );
          }}
        >
          <Menu.Item
            onPress={() => {
              navigate('Commentaries', { product, idSelectedList });
            }}
          >
            {t('comment')}
          </Menu.Item>
          <Menu.Item
            testID="remove-product-from-list-menu"
            onPress={() => {
              deleteFromList(product.id);
            }}
          >
            {t('remove')}
          </Menu.Item>
        </Menu>
      </Box>
    </Pressable>
  );
};

export default LixtProductItem;

LixtProductItem.propTypes = {
  navigate: PropTypes.func,
  deleteFromList: PropTypes.func,
  product: PropTypes.object,
  idSelectedList: PropTypes.number,
};
