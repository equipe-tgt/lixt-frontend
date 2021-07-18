import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import {
  Button,
  Text,
  Link,
  VStack,
  Box,
  Heading,
  Pressable,
} from 'native-base';
import { screenBasicStyle as style } from '../styles/style';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../context/AuthProvider';
import { ListContext } from '../context/ListProvider';

export default function ProfileScreen(props) {
  const { logout, user } = useContext(AuthContext);
  const { setLists } = useContext(ListContext);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={style.container}>
      <VStack ml={5}>
        <Box my={5}>
          <Heading>{user.name}</Heading>
          <Text fontSize="lg">{user.username}</Text>
        </Box>

        <Box py={5}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('Invitations');
            }}
          >
            <Text fontSize="lg">{t('invitations')}</Text>

            <Ionicons name="chevron-forward" size={16}></Ionicons>
          </Pressable>
        </Box>

        <Box py={5}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('Invite');
            }}
          >
            <Text fontSize="lg">{t('sendInvitation')}</Text>

            <Ionicons name="chevron-forward" size={16}></Ionicons>
          </Pressable>
        </Box>

        <Box py={5}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('UpdatePassword');
            }}
          >
            <Text fontSize="lg">{t('updatePassword')}</Text>

            <Ionicons name="chevron-forward" size={16}></Ionicons>
          </Pressable>
        </Box>

        <Box py={5}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              props.navigation.navigate('Settings');
            }}
          >
            <Text fontSize="lg">{t('settings')}</Text>

            <Ionicons name="chevron-forward" size={16}></Ionicons>
          </Pressable>
        </Box>

        <Box py={5}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              logout();
              setLists([]);
            }}
          >
            <Text fontSize="lg" color="blue.500">
              {t('logout')}
            </Text>
          </Pressable>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
});
