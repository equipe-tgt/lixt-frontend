import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
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
  Checkbox,
  InfoIcon,
  Tooltip,
  Menu
} from 'native-base';
import { screenBasicStyle as style } from '../../styles/style';
import { AntDesign, Ionicons } from '@expo/vector-icons';

import CommentaryService from '../../services/CommentaryService';
import ProductOfListService from '../../services/ProductOfListService';
import { AuthContext } from '../../context/AuthProvider';
import { useTranslation } from 'react-i18next';
import AuthService from '../../services/AuthService';
import RemoveCommentaryModal from '../../components/RemoveCommentaryModal';

export default function CommentaryScreen(props) {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const toast = useToast();

  const [product] = useState(props.route.params.product);
  const [language, setLanguage] = useState(enUS);

  const [commentariesList, setCommentariesList] = useState({
    global: [],
    notGlobal: []
  });
  const [globalCommentariesOrder, setGlobalCommentariesOrder] = useState();
  const [commentaryInformation, setCommentaryInformation] = useState({
    content: "",
    isGlobal: false,
    isGlobalPublic: false
  })

  const [loadingScreen, setLoadingScreen] = useState(true);
  const [loadingAdding, setLoadingAdding] = useState(false);
  const [commentaryToBeRemoved, setCommentaryToBeRemoved] = useState(null);

  useEffect(() => {
    if (loadingScreen) getUserData();
  }, []);

  useEffect(() => {
    if (globalCommentariesOrder !== undefined && loadingScreen) {
      getCommentaries();
      getCurrentLanguage();
    }
  }, [globalCommentariesOrder])
  
  const getUserData = async () => {
    try {
      const response = await AuthService.getUserData()
      const { globalCommentsChronOrder } = response.data;
      if (globalCommentsChronOrder === true) {
        setGlobalCommentariesOrder("date");
      } else if (globalCommentsChronOrder === false) {
        setGlobalCommentariesOrder("user");
      }
    } catch (error) {
      setGlobalCommentariesOrder("date")
    }
  }

  const getCommentaries = async () => {
    try {
      const { data } = await ProductOfListService.getProductOfListComments(
        product.id,
        user
      );
      const {
        commentsDto: commentsArray,
        globalCommentsDto: globalCommentsArray,
      } = data;

      if (globalCommentariesOrder === "date") {
        orderByDate(globalCommentsArray, commentsArray);
      } else {
        orderByUserAndDate(globalCommentsArray, commentsArray);
      }
    } catch (error) {
      toast.show({
        title: 'Não foi possível buscar os comentários',
        status: 'warning',
      });
    } finally {
      setLoadingScreen(false);
    }
  };

  const addGlobalCommentary = async () => {
    const { content, isGlobalPublic } = commentaryInformation;
    if (content.trim().length === 0) return;

    const comment = {
      content,
      userId: user.id,
      productId: product.productId,
      isPublic: isGlobalPublic
    }

    let title;
    let status;

    setLoadingAdding(true);
    try {
      const { data } = await CommentaryService.addGlobalCommentary(comment, user);
      const globalCommentariesCopy = [...commentariesList.global];
      globalCommentariesCopy.unshift(data);

      if (globalCommentariesOrder === "date") {
        orderByDate(globalCommentariesCopy, commentariesList.notGlobal);
      } else {
        orderByUserAndDate(globalCommentariesCopy, commentariesList.notGlobal);
      }

      status = 'success';
      title = t("addGlobalCommentarySuccess");
    } catch (error) {
      status = 'warning';
      title = t("addGlobalCommentaryFail");
    } finally {
      toast.show({
        title,
        status,
      });
      setLoadingAdding(false);
      setCommentaryInformation({
        content: "",
        isGlobal: false,
        isGlobalPublic: false
      });
    }
  };

  const addCommentary = async () => {
    if (commentaryInformation.content.trim().length === 0) return;

    // Constrói objeto de comentário para inserir
    const comment = {
      content: commentaryInformation.content,
      userId: user.id,
      productOfListId: product.id,
    };

    let title;
    let status;

    setLoadingAdding(true);
    try {
      const { data } = await CommentaryService.addCommentary(comment, user);
      const commentariesCopy = [...commentariesList.notGlobal];
      commentariesCopy.unshift(data);

      if (globalCommentariesOrder === "date") {
        orderByDate(commentariesList.global, commentariesCopy);
      } else {
        orderByUserAndDate(commentariesList.global, commentariesCopy);
      }

      status = 'success';
      title = t("addCommentarySuccess");
    } catch (error) {
      status = 'warning';
      title = t("addCommentaryFail");
    } finally {
      toast.show({
        title,
        status,
      });
      setLoadingAdding(false);
      setCommentaryInformation({
        content: "",
        isGlobal: false,
        isGlobalPublic: false
      });
    }
  };

  const changeGlobalCommentariesOrder = async (order) => {
    if (globalCommentariesOrder !== "date" && order === "date") {
      try {
        await AuthService.putGlobalCommentsPreference({
          ...user,
          globalCommentsChronOrder: true
        });
      } catch (e) {}
      finally {
        orderByDate(commentariesList.global, commentariesList.notGlobal);
      }
    } else if (globalCommentariesOrder !== "user" && order === "user") {
      try {
        await AuthService.putGlobalCommentsPreference({
          ...user,
          globalCommentsChronOrder: false
        });
      } catch (e) {}
      finally {
        orderByUserAndDate(commentariesList.global, commentariesList.notGlobal);
      }
    }
  }

  const orderByDate = (globalCommentaries, commentaries) => {
    const globalCommentariesOrdered = [...globalCommentaries]
    globalCommentariesOrdered.sort((a, b) => new Date(a.date) - new Date(b.date));
    const commentariesOrdered = [...commentaries];
    commentariesOrdered.sort((a, b) => new Date(a.date) - new Date(b.date));

    setCommentariesList({
      global: globalCommentariesOrdered,
      notGlobal: commentariesOrdered
    });
  }

  const orderByUserAndDate = (globalCommentaries, commentaries) => {
    const globalCommentariesByUserOrdered = globalCommentaries
      .filter(comment => comment.userId === user.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const globalCommentariesByMembersOrdered = globalCommentaries
      .filter(comment => comment.userId !== user.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const commentariesByUserOrdered = commentaries
      .filter(comment => comment.userId === user.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const commentariesByMembersOrdered = commentaries
      .filter(comment => comment.userId !== user.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setCommentariesList({
      global: [
        ...globalCommentariesByUserOrdered,
        ...globalCommentariesByMembersOrdered
      ],
      notGlobal: [
        ...commentariesByUserOrdered,
        ...commentariesByMembersOrdered
      ]
    });
  }

  const getCurrentLanguage = async () => {
    const language = await AsyncStorage.getItem('language');
    setLanguage(language === 'pt_BR' ? ptBR : enUS);
  };

  const removeCommentary = async (commentary) => {
    let title;
    let status;

    try {
      await CommentaryService.removeCommentary(commentary.id, user);
      const commentariesCopy = commentariesList.notGlobal.filter(c => c.id !== commentary.id);

      setCommentariesList({
        ...commentariesList,
        notGlobal: commentariesCopy
      });

      status = 'success';
      title = t('removeCommentarySuccess');
    } catch (error) {
      status = 'warning';
      title = t('removeCommentaryFail');
    } finally {
      toast.show({
        title,
        status,
      });
    }
  }

  const removeGlobalCommentary = async (commentary) => {
    let title;
    let status;

    try {
      await CommentaryService.removeGlobalCommentary(commentary.id, user);
      const globalCommentariesCopy = commentariesList.global.filter(c => c.id !== commentary.id);

      setCommentariesList({
        ...commentariesList,
        global: globalCommentariesCopy
      });

      status = 'success';
      title = t('removeGlobalCommentarySuccess');
    } catch (error) {
      status = 'warning';
      title = t('removeGlobalCommentaryFail');
    } finally {
      toast.show({
        title,
        status,
      });
    }
  }

  const onRemoveCommentary = async () => {
    if (commentaryToBeRemoved) {
      if (commentaryToBeRemoved.isGlobal) {
        await removeGlobalCommentary(commentaryToBeRemoved);
      } else {
        await removeCommentary(commentaryToBeRemoved);
      }
    }
    setCommentaryToBeRemoved(false);
  }

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
        <Box py={3} w="90%" mx="auto">
          {
            commentariesList.global.length > 0 || commentariesList.notGlobal.length > 0 ? (
              <Box display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center" marginY={15}>
                <Menu
                  trigger={(triggerProps) => (
                    <Pressable testID="settings-button" {...triggerProps}>
                      <Ionicons name="settings" size={24} color="gray" />
                    </Pressable>
                  )}
                >
                  <Menu.Item testID="order-by-date-button" onPress={() => changeGlobalCommentariesOrder("date")}>{t("orderByDate")}</Menu.Item>
                  <Menu.Item testID="order-by-user-button" onPress={() => changeGlobalCommentariesOrder("user")}>{t("orderByUser")}</Menu.Item>
                </Menu>
              </Box>
            ) : null
          }
          {
            commentariesList.global.length > 0 ? ( 
              <Text
                fontWeight="normal"
                style={{ textTransform: 'uppercase', letterSpacing: 4 }}
              >
                {t('globalCommentaries')}
              </Text>
            ) : null
          }
          {commentariesList.global.length > 0
            ? commentariesList.global.map((c, index) => (
                <HStack
                  key={c.id}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box mt={4} width="100%" pb={2} style={{ borderBottom: index < commentariesList.global.length - 1 ? "1px solid #d4d4d4" : "" }}>
                    {user.id === c.userId ? (
                      <Box display="flex" flexDirection="row">
                        <Text fontSize="md" mr={2} fontWeight="bold">
                          {t('you')}
                        </Text>
                        {
                          !c.isPublic ? (
                            <Tooltip label={t("globalPrivateCommentary")} placement="right">
                              <Box>
                                <Icon as={<AntDesign name="lock" />} size="5" mt="0.5" color="muted.500" />
                              </Box>
                            </Tooltip>
                          ) : null
                        }
                        <Box ml={2}>
                          <Ionicons name="trash" size={20} color="gray" onPress={() => setCommentaryToBeRemoved({
                            ...c,
                            isGlobal: true
                          })} />
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Text fontSize="md" fontWeight="bold">
                          {c.user.name}
                        </Text>
                        <Text fontSize="sm">{`@${c.user.username}`}</Text>
                      </Box>
                    )}

                    <Text mt={1}>{c.content}</Text>
                    <Text fontSize="sm" mt={1} textAlign="right">
                      {formatRelative(moment(c.date).toDate(), new Date(), {
                        locale: language,
                      })}
                    </Text>
                  </Box>
                </HStack>
              ))
            : null}

          {
            commentariesList.notGlobal.length > 0 ? (
              <Text
                fontWeight="normal"
                marginY={15}
                style={{ textTransform: 'uppercase', letterSpacing: 4 }}
              >
                {t('nonGlobalCommentaries')}
              </Text>
            ) : null
          }
          {commentariesList.notGlobal.length > 0
            ? commentariesList.notGlobal.map((c, index) => (
                <HStack
                  key={c.id}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box mt={4} width="100%" pb={2} style={{ borderBottom: index < commentariesList.notGlobal.length - 1 ? "1px solid #d4d4d4" : "" }}>
                    {user.id === c.user.id ? (
                      <Box display="flex" flexDirection="row">
                        <Text fontSize="md" fontWeight="bold">
                          {t('you')}
                        </Text>
                        <Box ml={2}>
                          <Ionicons name="trash" size={20} color="gray" onPress={() => setCommentaryToBeRemoved({
                            ...c,
                            isGlobal: false
                          })} />
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Text fontSize="md" fontWeight="bold">
                          {c.user.name}
                        </Text>
                        <Text fontSize="sm">{`@${c.user.username}`}</Text>
                      </Box>
                    )}

                    <Text mt={1}>{c.content}</Text>
                    <Text fontSize="sm" mt={1} textAlign="right">
                      {formatRelative(moment(c.date).toDate(), new Date(), {
                        locale: language,
                      })}
                    </Text>
                  </Box>
                </HStack>
              ))
            : null}
        </Box>
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
          value={commentaryInformation.content}
          onChangeText={(value) => setCommentaryInformation({
            ...commentaryInformation,
            content: value
          })}
          flex={2}
          placeholder={t('commentaryPlaceholder')}
        />

        {loadingAdding ? (
          <Spinner size="lg" />
        ) : (
          <Pressable
            accessibilityLabel={t('comment')}
            testID="add-commentary-button"
            onPress={() => {
              if (commentaryInformation.isGlobal) {
                addGlobalCommentary();
              } else {
                addCommentary();
              }
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
      <HStack
        w="95%"
        my={3}
        mx="auto"
        flexDirection="column"
        space={3}
        style={{ backgroundColor: '#fff' }}
      >
        <Checkbox
          isChecked={commentaryInformation.isGlobal}
          onChange={(value) => setCommentaryInformation({
            ...commentaryInformation,
            isGlobal: value
          })}
        >
          <Text ml={1}>{t('isGlobalCommentary')}</Text>
        </Checkbox>
        {
          commentaryInformation.isGlobal ? (
            <Box display="flex" flexDirection="row" alignItems="center">
              <Checkbox
                isChecked={commentaryInformation.isGlobalPublic}
                onChange={(value) => setCommentaryInformation({
                  ...commentaryInformation,
                  isGlobalPublic: value
                })}
                mt={2}
                mr={2}
              >
                <Text ml={1}>{t("isPublic")}</Text>
              </Checkbox>
              <Box ml={1}>
                <Tooltip label={t("isPublicTooltip")} placement="right">
                  <InfoIcon size="5" mt="0.5" color="muted.500" />
                </Tooltip>
              </Box>
            </Box>
          ) : null
        }

      <RemoveCommentaryModal
        isOpen={!!commentaryToBeRemoved}
        closeModal={(val) => {
          if (val) {
            onRemoveCommentary();
          } else {
            setCommentaryToBeRemoved(null);
          }
        }}
      />
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
