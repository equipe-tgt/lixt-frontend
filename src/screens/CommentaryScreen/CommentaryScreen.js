import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  TextArea,
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
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { useTranslation } from 'react-i18next';

export default function CommentaryScreen(props) {
  const { user } = useContext(AuthContext);
  const { lists, setLists } = useContext(ListContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [product] = useState(props.route.params.product);
  const [commentaries, setCommentaries] = useState(product.comments);
  const [newCommentary, setNewCommentary] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(() => {
    sortCommentaries();
  });

  const addCommentary = async () => {
    if (newCommentary.length === 0) return;

    const comment = {
      content: newCommentary,
      userId: user.id,
      productOfListId: product.id,
    };

    let title;
    let status;

    setLoading(true);
    try {
      const { data } = await CommentaryService.addCommentary(comment, user);
      const commentariesCopy = [...commentaries];

      data.user = user;

      commentariesCopy.push(data);
      setCommentaries(commentariesCopy);
      sortCommentaries();

      status = 'success';
      title = 'Comentário adicionado';
    } catch (error) {
      console.log(error);
      status = 'warning';
      title = 'Não foi possível adicionar o comentário';
    } finally {
      toast.show({
        title,
        status,
      });
      setLoading(false);
      setNewCommentary('');
    }
  };

  const sortCommentaries = () => {
    commentaries.sort((a, b) => moment(b.date) - moment(a.date));
  };

  return (
    <KeyboardAvoidingView behavior={'padding'} style={style.container}>
      <ScrollView h="85%">
        {commentaries.map((c) => (
          <HStack key={c.id} alignItems="center" justifyContent="space-between">
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
                {moment(c.date).format('DD/MM/YYYY HH:mm')}
              </Text>
            </Box>
          </HStack>
        ))}
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
          isDisabled={loading}
          maxLength={200}
          totalLines={2}
          value={newCommentary}
          onChangeText={setNewCommentary}
          flex={2}
          placeholder="Comprar suco no extra"
        />

        {loading ? (
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
  );
}

CommentaryScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
  idSelectedList: PropTypes.number,
};
