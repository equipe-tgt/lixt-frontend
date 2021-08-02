import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { ScrollView, Text, Box, Button, HStack } from 'native-base';
import LixtReviewItem from '../../components/LixtReviewItem';

import { ListContext } from '../../context/ListProvider';

import { screenBasicStyle as style } from '../../styles/style';

export default function ReviewPurchaseScreen(props) {
  const { lists } = useContext(ListContext);
  const isFocused = useIsFocused();

  const [itemsSortedToPurchase, setItemsSortedToPurchase] = useState({});
  const [itemsFromProps, setItemsFromProps] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (isFocused) {
      const copy = [...props.route.params.productsToPurchase];
      setItemsFromProps(copy);
    }
  }, [isFocused]);

  useEffect(() => {
    sortProductsByList();
    sumPrices();
  }, [itemsFromProps]);

  const sortProductsByList = () => {
    if (itemsFromProps && itemsFromProps?.length) {
      const groupedProducts = itemsFromProps.reduce(
        (accumlator, currentProduct) => {
          accumlator[getListNameById(currentProduct.listId)] = [
            ...(accumlator[getListNameById(currentProduct.listId)] || []),
            currentProduct,
          ];
          return accumlator;
        },
        {}
      );

      setItemsSortedToPurchase(groupedProducts);
    }
  };

  const sumPrices = () => {
    let finalPrice = 0;

    if (itemsFromProps) {
      finalPrice = itemsFromProps.reduce((accumulator, currentItem) => {
        accumulator += currentItem.price
          ? currentItem.price * currentItem.amount
          : 0;
        return accumulator;
      }, 0);
    }

    setFinalPrice(finalPrice);
  };

  const modifyItem = (property, value, item) => {
    const modifiedItems = itemsFromProps.map((i) => {
      if (i.id === item.id) {
        i[property] = value;
      }
      return i;
    });
    setItemsFromProps(modifiedItems);
  };

  const getListNameById = (id) => {
    const foundList = lists.find((l) => l.id === id);
    return foundList ? foundList.nameList : id;
  };

//   const makeNewPurchase = async () => {
//     try {
//     } catch (error) {}
//   };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Itera por cada lista que há itens */}

        {Object.keys(itemsSortedToPurchase).length > 0
          ? Object.keys(itemsSortedToPurchase).map(
              (listIdentification, index) => {
                return (
                  <Box width="90%" mx="auto" key={index} my={3}>
                    <Text mb={3} fontWeight="bold" fontSize="lg">
                      {listIdentification}
                    </Text>

                    {/* Mostra todos os produtos pertencentes a esta lista */}
                    {itemsSortedToPurchase[listIdentification].map((p) => (
                      <LixtReviewItem
                        key={p.id}
                        productOfList={p}
                        modifyItem={modifyItem}
                      />
                    ))}
                  </Box>
                );
              }
            )
          : null}
      </ScrollView>
      <HStack
        width="90%"
        mx="auto"
        justifyContent="space-between"
        my={8}
        bgColor="#fff"
      >
        <Text fontSize={20}>Total</Text>
        <Text fontSize={20} fontWeight="bold">
          R$ {finalPrice}
        </Text>
      </HStack>
      <Button mb={3} width="90%" mx="auto" paddingX={20} paddingY={4}>
        OK!
      </Button>
    </SafeAreaView>
  );
}

ReviewPurchaseScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
