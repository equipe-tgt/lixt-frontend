import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Heading } from 'native-base';
import LixtCartProductItem from '../components/LixtCartProductItem';
import LixtCartProductItemGeneral from '../components/LixtCartProductItemGeneral';

export default function LixtCartList({ selectedList, refreshList, navigate }) {
  const [itemsShownByCategory, setItemsShownByCategory] = useState({});

  useEffect(() => {
    listItemsByCategory();
  }, [selectedList]);

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
                        navigate={navigate}
                        refreshList={refreshList}
                        wrappedProduct={p}
                      />
                    );
                  } else {
                    return (
                      <LixtCartProductItem
                        key={p.id}
                        idSelectedList={p.listId}
                        product={p}
                        navigate={navigate}
                        refreshList={refreshList}
                      />
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
};
