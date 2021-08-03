import React, { useState, useContext } from 'react';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { formatRelative } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enUS, ptBR } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { RefreshControl } from 'react-native';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  TextArea,
  View,
  Center,
  Icon,
  Circle,
  KeyboardAvoidingView,
  Pressable,
  Spinner,
  useToast,
} from 'native-base';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';

import CommentaryService from '../../services/CommentaryService';
import ProductOfListService from '../../services/ProductOfListService';
import { AuthContext } from '../../context/AuthProvider';
import { useTranslation } from 'react-i18next';

export default function CommentaryScreen(props) {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [product] = useState(props.route.params.product);
  const [language, setLanguage] = useState(enUS);
  const [commentaries, setCommentaries] = useState([]);
  const [newCommentary, setNewCommentary] = useState('');
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [loadingAdding, setLoadingAdding] = useState(false);

  useFocusEffect(() => {
    if (loadingScreen) {
      getCommentaries();
      getCurrentLanguage();
    }
  });

  const getCommentaries = async () => {
    try {
      const { data } = await ProductOfListService.getProductOfListComments(
        product.id,
        user
      );
      // Organiza comentários por data de envio
      data.sort((a, b) => new Date(b.date) > new Date(a.date));
      setCommentaries(data);
    } catch (error) {
      toast.show({
        title: t('wasntPossibleToRetrieveComments'),
        status: 'warning',
      });
    } finally {
      setLoadingScreen(false);
    }
  };

  const addCommentary = async () => {
    if (newCommentary.length === 0) return;

    // Constrói objeto de comentário para inserir
    const comment = {
      content: newCommentary,
      userId: user.id,
      productOfListId: product.id,
    };

    let title;
    let status;

    setLoadingAdding(true);
    try {
      const { data } = await CommentaryService.addCommentary(comment, user);
      const commentariesCopy = [...commentaries];

      data.user = user;

      commentariesCopy.unshift(data);
      setCommentaries(commentariesCopy);

      status = 'success';
      title = t('commentaryAdded');
    } catch (error) {
      console.log(error);
      status = 'warning';
      title = t('wasntPossibleToAddCommentary');
    } finally {
      toast.show({
        title,
        status,
      });
      setLoadingAdding(false);
      setNewCommentary('');
    }
  };

  const getCurrentLanguage = async () => {
    const language = await AsyncStorage.getItem('language');
    setLanguage(language === 'pt_BR' ? ptBR : enUS);
  };

  // Se a lista não estiver carregando renderiza, caso contrário roda um spinner na tela
  return !loadingScreen ? (
    <KeyboardAvoidingView behavior={'padding'} style={style.container}>
      <ScrollView
        h="85%"
        refreshControl={
          <RefreshControl
            refreshing={loadingScreen}
            onRefresh={getCommentaries}
          />
        }
      >
        {commentaries.length > 0
          ? commentaries.map((c) => (
              <HStack
                key={c.id}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box py={3} w="90%" mx="auto">
                  {user.id === c.user.id ? (
                    <Text fontSize="lg" fontWeight="bold">
                      {t('you')}
                    </Text>
                  ) : (
                    <Box>
                      <Text fontSize="lg" fontWeight="bold">
                        {c.user.name}
                      </Text>
                      <Text fontSize="sm">{`@${c.user.username}`}</Text>
                    </Box>
                  )}

                  <Text mt={2}>{c.content}</Text>
                  <Text fontSize="sm" mt={2}>
                    {formatRelative(moment(c.date).toDate(), new Date(), {
                      locale: language,
                    })}
                  </Text>
                </Box>
              </HStack>
            ))
          : null}
      </ScrollView>
      <HStack
        w="95%"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        space={3}
        style={{ backgroundColor: '#fff' }}
      >
        <TextArea
          isDisabled={loadingAdding}
          maxLength={200}
          totalLines={2}
          value={newCommentary}
          onChangeText={setNewCommentary}
          flex={2}
          placeholder={t('commentaryPlaceholder')}
        />

        {loadingAdding ? (
          <Spinner size="lg" />
        ) : (
          <Pressable
            accessibilityLabel={t('comment')}
            onPress={() => {
              addCommentary();
            }}
          >
            <Circle size={50} bg="primary.400">
              <Icon
                as={<Ionicons name="paper-plane" />}
                color="white"
                size={5}
              />
            </Circle>
          </Pressable>
        )}
      </HStack>
    </KeyboardAvoidingView>
  ) : (
    <View justifyContent="center" style={style.container}>
      <Center>
        <Spinner size="lg"></Spinner>
      </Center>
    </View>
  );
}

CommentaryScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
  idSelectedList: PropTypes.number,
};
