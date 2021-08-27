import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  FormControl,
  Input,
  ScrollView,
  Radio,
  Button,
  Heading,
  Text,
  Select,
  useToast,
} from 'native-base';
import LixtSelect from '../../components/LixtSelect';

import { useTranslation } from 'react-i18next';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';

// Validação do formulário
import MEASURE_TYPES, {
  getMeasureType,
  getMeasureValueByLabel,
} from '../../utils/measureTypes';
import { ProductOfListSchema } from '../../validationSchemas/index';
import { useFormik } from 'formik';

import ProductOfListService from '../../services/ProductOfListService';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';

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
  const { handleChange, handleSubmit, values, errors } = useFormik({
    initialValues: {
      price: product.price ? String(product.price) : '',
      amount: product.amount ? String(product.amount) : '',
      measureType: product.measureType
        ? getMeasureType(product.measureType)
        : 'un',
      measureValue: product.measureValue ? String(product.measureValue) : '',
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: ProductOfListSchema,
    onSubmit: () => {
      editProductOfList();
    },
  });

  const editProductOfList = async () => {
    setLoading(true);
    const productOfListEdited = formatValuesForRequest();
    try {
      await ProductOfListService.editProductOfList(productOfListEdited, user);

      toast.show({
        title: 'Produto editado com sucesso',
        status: 'success',
      });
      // retorna à lista
      props.navigation.navigate(origin, { refresh: true });
    } catch (error) {
      console.log({ error });
      toast.show({
        title: 'Não foi possível editar o produto',
        status: 'warning',
      });
      setLoading(false);
    }
  };

  const formatValuesForRequest = () => {
    const productOfListEdited = Object.assign({}, props.route.params.product);
    productOfListEdited.price = values.price
      ? parseFloat(values.price.replace(',', '.'))
      : null;
    productOfListEdited.amount =
      !values.amount || parseInt(values.amount) <= 0
        ? 1
        : parseInt(values.amount);
    productOfListEdited.measureType = getMeasureValueByLabel(
      values.measureType
    );
    productOfListEdited.measureValue =
      values.measureType !== 'un' ? parseInt(values.measureValue) : null;

    console.log(productOfListEdited);

    // Se você for o dono da lista e ela possuir membros, checa pra ver se o item atual
    // está sendo atribuído a alguém
    if (currentList.ownerId === user.id && currentList.listMembers.length > 0) {
      productOfListEdited.assignedUserId = userBeingAssignedTo?.userId
        ? userBeingAssignedTo.userId
        : null;
    }
    return productOfListEdited;
  };

  const getCurrentList = () => {
    if (product) {
      const list = lists.find((l) => l.id === product.listId);
      setCurrentList(list);

      if (list.listMembers.length > 0) {
        // Inclui o dono da lista na lista de membros para que seja possível atribuir
        // um item para si próprio também
        const owner = { userId: list.ownerId, user: { name: list.owner } };
        const allUsers = [...list.listMembers, owner];

        setListMembers(allUsers);

        // Se já houver um usuário atribuído para o item atual busca quem é
        // a partir do id
        if (product?.assignedUserId) {
          setUserBeingAssignedTo(
            getMemberById(product.assignedUserId, allUsers)
          );
        }
      }
    }
  };

  const getMemberById = (userId, members) => {
    if (members.length) {
      return members.find((lm) => lm.userId === Number(userId));
    }
    return { id: null };
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView w="90%" mx="auto">
        <Heading>
          {`${t('editing')} ${props.route.params.product.name}`}
        </Heading>
        <Button
          px={0}
          mr="auto"
          variant="ghost"
          startIcon={
            <Ionicons name="chatbox-outline" size={35} color="#06b6d4" />
          }
          onPress={() => {
            props.navigation.navigate('Commentaries', { product });
          }}
        >
          {t('comment')}
        </Button>

        <FormControl my={3}>
          <FormControl.Label>{t('price')}</FormControl.Label>
          <Input
            keyboardType="numeric"
            value={values.price}
            onChangeText={handleChange('price')}
          />
          <FormControl.HelperText>
            <Text
              style={errors.price ? { color: '#fb7185' } : { display: 'none' }}
            >
              {errors.price}
            </Text>
          </FormControl.HelperText>
        </FormControl>

        <FormControl my={3}>
          <FormControl.Label>{t('measureType')}</FormControl.Label>
          <Radio.Group
            value={values.measureType}
            onChange={handleChange('measureType')}
            flexDirection="row"
            justifyContent="space-around"
          >
            {Object.keys(MEASURE_TYPES).map((measure) => {
              return (
                <Radio
                  key={MEASURE_TYPES[measure].value}
                  accessibilityLabel={MEASURE_TYPES[measure].label}
                  value={MEASURE_TYPES[measure].label}
                  my={1}
                >
                  {MEASURE_TYPES[measure].label}
                </Radio>
              );
            })}
          </Radio.Group>
        </FormControl>

        {/* Se a unidade de medida do produto não for do tipo "unidade" questiona o valor de mensura,
        Ex.: Produto: Arroz, unidade de medida: KG, valor da mensura: 5 = Arroz 5KG
        */}
        {values.measureType !== 'un' ? (
          <FormControl my={3}>
            <FormControl.Label>{t('measureValue')}</FormControl.Label>
            <Input
              value={values.measureValue}
              onChangeText={handleChange('measureValue')}
              keyboardType="numeric"
            />
            <FormControl.HelperText>
              <Text
                style={
                  errors.measureValue
                    ? { color: '#fb7185' }
                    : { display: 'none' }
                }
              >
                {errors.measureValue}
              </Text>
            </FormControl.HelperText>
          </FormControl>
        ) : null}

        <FormControl my={3}>
          <FormControl.Label>{t('amount')}</FormControl.Label>
          <Input
            keyboardType="numeric"
            value={values.amount}
            onChangeText={handleChange('amount')}
          />
        </FormControl>

        {/* Se o usuário logado for o dono da lista e a lista possuir membros
        dá a opção para o usuário atribuir o item à alguém */}
        {currentList.ownerId === user.id &&
        currentList?.listMembers.length > 0 ? (
          <LixtSelect
            labelName="assignTo"
            isDisabled={loading}
            selectedValue={userBeingAssignedTo?.userId || null}
            onValueChange={(listMemberUserId) => {
              if (listMemberUserId) {
                setUserBeingAssignedTo(
                  listMembers.find(
                    (lm) => lm.userId === Number(listMemberUserId)
                  )
                );
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
        ) : null}

        <Button
          isLoading={loading}
          isLoadingText={t('editing')}
          onPress={handleSubmit}
          marginTop={5}
          paddingX={20}
          paddingY={4}
        >
          {t('finish')}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

ProductOfListDetails.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};
