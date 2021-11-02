import React from 'react';
import PropTypes from 'prop-types';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, Text } from 'react-native';
import { screenBasicStyle as style } from '../../styles/style';

export default function PurchaseDetailScreen(props) {
  useFocusEffect(() => {
    if (props.route.params.purchase) {
      console.log(props.route.params.purchase);
    }
  });

  return (
    <SafeAreaView style={style.container}>
      <Text></Text>
    </SafeAreaView>
  );
}

PurchaseDetailScreen.propTypes = {
  route: PropTypes.object,
};
