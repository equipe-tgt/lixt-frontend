import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  FormControl,
  ScrollView,
  Radio,
  Button,
  Heading,
  Text,
  Select,
  Box,
  useToast,
} from 'native-base';
import LixtSelect from '../../components/LixtSelect';

import { getI18n, useTranslation } from 'react-i18next';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';

// Validação do formulário
import MeasureTypes, {
  getMeasureType,
  getMeasureValueByLabel,
} from '../../utils/measureTypes';
import { ProductOfListSchema } from '../../validationSchemas/index';
import { useFormik } from 'formik';

import ProductOfListService from '../../services/ProductOfListService';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import LixtMoneyInput from '../../components/LixtMoneyInput';
import LixtNumberInput from '../../components/LixtNumberInput';

export default function ProductOfListDetails(props) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { lists } = useContext(ListContext);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [product] = useState(props.route.params.product);
  const [origin] = useState(props.route.params.origin);
  const [currentList, setCurrentList] = useState({});
  const [userBeingAssignedTo, setUserBeingAssignedTo] = useState({ id: null });
  const [listMembers, setListMembers] = useState([]);

  useEffect(() => {
    getCurrentList();
  }, [product]);

  // Instanciando formik para controlar as validações do formulário
  const { handleChange, handleSubmit, values, errors, setValues } = useFormik({
    initialValues: {
      price: product.price || '',
      plannedAmount: product.plannedAmount ? String(product.plannedAmount) : '',
      measureType: product.measureType
        ? getMeasureType(product.measureType)
        : 'un',
      measureValue: product.measureValue ? String(product.measureValue) : '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: ProductOfListSchema(getI18n().language),
    onSubmit: () => {
      editProductOfList();
    },
  });

  useEffect(() => {
    if (typeof values.price === 'number' && getI18n().language === 'pt_BR') {
      const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
        .format(values.price)
        .replace(/^R\$\s{0,1}/, '');
      setValues({
        ...values,
        price: formattedValue,
      });
    }
  }, []);

  const editProductOfList = async () => {
    setLoading(true);
    const productOfListEdited = formatValuesForRequest();
    try {
      await ProductOfListService.editProductOfList(productOfListEdited, user);

      toast.show({
        title: t('editedWithSuccess'),
        status: 'success',
      });
      // retorna à lista
      props.navigation.navigate(origin, { refresh: true });
    } catch (error) {
      toast.show({
        title: t('unsuccessfullyEdited'),
        status: 'warning',
      });
      setLoading(false);
    }
  };

  const formatValuesForRequest = () => {
    const productOfListEdited = Object.assign({}, props.route.params.product);

    if (values.price) {
      const language = getI18n().language;
      if (language === 'pt_BR') {
        if (typeof values.price === 'number') {
          productOfListEdited.price = values.price;
        } else {
          const dollarFormat = values.price
            .replace(/\./g, ',')
            .replace(/,(\d\d)$/, '.$1');
          productOfListEdited.price = parseFloat(
            dollarFormat.replace(/[^0-9\.]+/g, '')
          );
        }
      } else if (language === 'en_US') {
        productOfListEdited.price =
          typeof values.price === 'number'
            ? values.price
            : parseFloat(values.price.replace(/[^0-9\.]+/g, ''));
      }
    }

    productOfListEdited.plannedAmount =
      !values.plannedAmount || parseInt(values.plannedAmount) <= 0
        ? 1
        : parseInt(values.plannedAmount);

    productOfListEdited.measureType = getMeasureValueByLabel(
      values.measureType
    );

    productOfListEdited.measureValue =
      values.measureType !== 'un' ? parseInt(values.measureValue) : null;

    // Se você for o dono da lista e ela possuir membros, checa pra ver se o item atual
    // está sendo atribuído a alguém
    if (
      currentList.ownerId === user.id &&
      currentList.listMembers &&
      currentList.listMembers.length > 0
    ) {
      productOfListEdited.assignedUserId = userBeingAssignedTo?.userId
        ? userBeingAssignedTo.userId
        : null;
    }
    return productOfListEdited;
  };

  const getCurrentList = () => {
    if (product) {
      const list = lists.find((l) => l.id === product.listId);
      if (list) {
        setCurrentList(list);

        // Verifica se há membros ligados a essa lista, se houver, filtra os que aceitaram participar da lista
        if (
          list?.listMembers?.length > 0 &&
          list?.listMembers.some((lm) => lm.statusListMember === 'ACCEPT')
        ) {
          const usersThatAcceptedInvite = list.listMembers.filter(
            (lm) => lm.statusListMember === 'ACCEPT'
          );

          // Inclui o dono da lista na lista de membros para que seja possível atribuir
          // um item para si próprio também
          const owner = { userId: list.ownerId, user: { name: list.owner } };
          const allUsers = [...usersThatAcceptedInvite, owner];

          setListMembers(allUsers);

          // Se já houver um usuário atribuído para o item atual busca quem é
          // a partir do id
          if (product?.assignedUserId) {
            const member = getMemberById(product.assignedUserId, allUsers);
            if (member) {
              setUserBeingAssignedTo(member);
            } else {
              setUserBeingAssignedTo({ id: null });
            }
          }
        }
      }
    }
  };

  const getMemberById = (userId, members) => {
    return members.find((lm) => lm.userId === Number(userId));
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView>
        <Box w="90%" mx="auto">
          <Heading>
            {`${t('editing')} ${props.route.params.product.name}`}
          </Heading>
          <Button
            px={0}
            mr="auto"
            variant="ghost"
            testID="commentaries-button"
            startIcon={
              <Ionicons name="chatbox-outline" size={35} color="#06b6d4" />
            }
            onPress={() => {
              props.navigation.navigate('Commentaries', { product });
            }}
          >
            {t('comment')}
          </Button>

          <LixtMoneyInput
            labelName="price"
            keyboardType="numeric"
            value={values.price}
            onChangeText={handleChange('price')}
            hasHelperText
            error={errors.price}
            testID="product-of-list-price-input"
          />

          <FormControl my={3}>
            <FormControl.Label>{t('measureType')}</FormControl.Label>
            <Radio.Group
              value={values.measureType}
              onChange={handleChange('measureType')}
              flexDirection="row"
              justifyContent="space-around"
            >
              {Object.keys(MeasureTypes).map((measure) => {
                return (
                  <Radio
                    key={MeasureTypes[measure].value}
                    accessibilityLabel={MeasureTypes[measure].label}
                    value={MeasureTypes[measure].label}
                    my={1}
                  >
                    {MeasureTypes[measure].label}
                  </Radio>
                );
              })}
            </Radio.Group>
          </FormControl>

          {/* Se a unidade de medida do produto não for do tipo "unidade" questiona o valor de mensura,
          Ex.: Produto: Arroz, unidade de medida: KG, valor da mensura: 5 = Arroz 5KG
          */}
          {values.measureType !== 'un' ? (
            <Box marginY={3}>
              <LixtNumberInput
                labelName={t('measureValue')}
                onChangeText={handleChange('measureValue')}
                keyboardType="numeric"
                value={values.measureValue}
                hasHelperText
                error={errors.measureType}
              />
            </Box>
          ) : null}

          <Box marginY={3}>
            <LixtNumberInput
              labelName={t('plannedAmount')}
              onChangeText={handleChange('plannedAmount')}
              keyboardType="numeric"
              value={values.plannedAmount}
            />
          </Box>

          {/* Se o usuário logado for o dono da lista e a lista possuir membros
          dá a opção para o usuário atribuir o item à alguém */}
          {currentList.ownerId === user.id &&
          currentList?.listMembers?.length > 0 &&
          currentList?.listMembers?.some(
            (lm) => lm.statusListMember === 'ACCEPT'
          ) ? (
            <Box my={3}>
              <LixtSelect
                labelName="assignTo"
                isDisabled={loading || product.isMarked}
                selectedValue={userBeingAssignedTo?.userId || null}
                onValueChange={(listMemberUserId) => {
                  if (listMemberUserId) {
                    const member = listMembers.find(
                      (lm) => lm.userId === Number(listMemberUserId)
                    );
                    if (member) {
                      setUserBeingAssignedTo(member);
                    } else {
                      setUserBeingAssignedTo({ id: null });
                    }
                  } else {
                    setUserBeingAssignedTo({ id: null });
                  }
                }}
                selectTestID="select-list-member"
              >
                {/* Item padrão - "Ninguém em específico" */}
                <Select.Item key={null} value={null} label={t('noOne')} />

                {listMembers.map((listMember) => (
                  <Select.Item
                    key={listMember.userId}
                    value={listMember.userId}
                    label={listMember.user.name}
                  />
                ))}
              </LixtSelect>
              {product.isMarked ? (
                <Text fontSize="sm">{t('alreadyChecked')}</Text>
              ) : null}
            </Box>
          ) : null}

          <Button
            isLoading={loading}
            isLoadingText={t('editing')}
            onPress={handleSubmit}
            marginTop={5}
            paddingX={20}
            paddingY={4}
            testID="button-finish-editing-item"
          >
            {t('finish')}
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

ProductOfListDetails.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};
