import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import { Box, Select, Center, Text, Button } from 'native-base';
import { LixtSelect } from '../../components/LixtSelect';
import { screenBasicStyle as style } from '../../styles/style';

import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';

export default function CartScreen(props) {
  const { lists, setLists } = useContext(ListContext);
  const { selectedList, setSelectedList } = useState({});

  const { t } = useTranslation();

  return (
    <SafeAreaView style={style.container}>
      {lists.length ? (
        <Box w="90%" mx="auto">
          {/* <LixtSelect
            labelName={t('selectList')}
            selectedValue={selectedList}
            onValueChange={(listId) => {
              setSelectedList(lists.find((list) => list.id === Number(listId)));
            }}
            selectTestID="cart-select-list"
          >
            {lists.map((list) => (
              <Select.Item
                key={list.id}
                value={list.id}
                label={list.nameList}
              />
            ))}
          </LixtSelect> */}
        </Box>
      ) : (
        <Center w="90%" mx="auto" my="50%">
          <Text textAlign="center">{t('noListsFound')}</Text>
          <Button
            onPress={() => {
              props.navigation.navigate('NewList');
            }}
            marginTop={5}
            paddingX={20}
            paddingY={4}
          >
            {t('createMyFirstList')}
          </Button>
        </Center>
      )}
    </SafeAreaView>
  );
}

CartScreen.propTypes = {
  navigation: PropTypes.object,
};
