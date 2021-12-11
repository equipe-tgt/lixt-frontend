import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  useToast,
  Text,
  ScrollView,
  Select,
  VStack,
  Box,
  Center,
  HStack,
  Spinner,
  Button,
  Icon,
  List,
  Input,
  Switch,
} from 'native-base';
import DatePicker from '../../components/DatePicker';
import ButtonGroupSelector from '../../components/ButtonGroupSelector';
import { useFocusEffect } from '@react-navigation/native';
import {
  UnityTimes,
  StatisticsType,
  DateParameters,
  StatisticsPeriods,
  getUrl,
} from '../../utils/StatisticsUtils';

import { screenBasicStyle as style } from '../../styles/style';

import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import StatisticsService from '../../services/StatisticsService';
import CategoryService from '../../services/CategoryService';
import ProductService from '../../services/ProductService';
import PurchaseLocalService from '../../services/PurchaseLocalService';
import StatisticsDateInput from '../../components/StatisticsDateInput';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { AntDesign, Ionicons } from '@expo/vector-icons';

export default function StatisticsSettingsScreen(props) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { lists } = useContext(ListContext);
  const [statisticsSettings, setStatisticsSettings] = useState(
    props.route.params?.settings || {
      startDate: null,
      endDate: null,
      selectedUnityTime: UnityTimes.DAILY,
      statisticType: StatisticsType.TIME,
    }
  );
  const [currentParameter, setCurrentParameter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [productDetailConfig, setProductDetailConfig] = useState({
    purchaseLocal: null,
    brand: null,
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPurchaseLocals, setLoadingPurchaseLocals] = useState(false);
  const [userPurchaseLocals, setUserPurchaseLocals] = useState([]);
  const [isSearchByProduct, setIsSearchByProduct] = useState(true);
  const [periodSelected, setPeriodSelected] = useState(
    props.route.params?.extraParams?.periodSelected ||
      StatisticsPeriods.LAST_MONTH
  );

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa (a tela de estatísticas manda para cá)
    if (props.route?.params) {
      const { params } = props.route;

      if (params?.settings) {
        // Caso a tela anterior tenha passado settings o setStatisticsSettings já vai aplicá-lo basta limpar depois
        params.settings = null;
      }
      // Caso a tela tenha passado configurações extra de busca (categoria selecionada, id da lista, esse tipo de coisa que
      // sai do padrão do statisticsSettings)
      if (params?.extraParams) {
        const extraParamsCopy = Object.assign({}, params?.extraParams);
        checkExtraParametersFromRoute(extraParamsCopy);
        getDefaultDateInterval();

        params.extraParams = null;
      }
    }
  });

  useEffect(() => {
    getDefaultDateInterval();
  }, []);

  useEffect(() => {
    if (showMoreFilters && userPurchaseLocals.length === 0) {
      getPurchaseLocalsByUser();
    }
  }, [showMoreFilters]);

  useEffect(() => {
    getDefaultDateInterval();
  }, [periodSelected]);

  const resetValues = () => {
    setSelectedList(null);
    setCurrentParameter(null);
    setProducts([]);
    setSelectedProduct('');
    setSelectedCategory(null);
    setUserPurchaseLocals([]);
  };

  const checkExtraParametersFromRoute = async (extraParams) => {
    // Seleciona automaticamente a categoria da lista de categorias
    // caso receba o param de "selectedCategory" e o mesmo
    // raciocínio vale para o "selectedList" e para os demais

    if (extraParams?.selectedCategory) {
      await getCategories();
      setSelectedCategory(extraParams.selectedCategory);
    }

    if (extraParams?.selectedList) {
      setSelectedList(extraParams?.selectedList);
    }

    if (extraParams?.selectedProduct) {
      setSelectedProduct(extraParams?.selectedProduct);
    }

    if (extraParams?.purchaseLocal) {
      await getPurchaseLocalsByUser();
      setShowMoreFilters(true);
      setProductDetailConfig({
        ...productDetailConfig,
        purchaseLocal: extraParams.purchaseLocal,
      });
    }

    if (extraParams?.brand) {
      setProductDetailConfig({
        ...productDetailConfig,
        brand: extraParams.brand,
      });
    }
  };

  const getCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data } = await CategoryService.getCategories(user);
      setCategories(data);
    } catch (error) {
      console.log({ error });
      useToast().show({
        title: t('errorServerDefault'),
        status: 'error',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const renderDateInterval = () => {
    let intervalText;
    if (statisticsSettings.startDate && statisticsSettings.endDate) {
      intervalText = `${moment(statisticsSettings.startDate).format(
        'DD/MM/yyyy'
      )} ${t('until')} ${moment(statisticsSettings.endDate).format(
        'DD/MM/yyyy'
      )}`;
    } else {
      intervalText = t('noIntervalSelected');
    }

    return <Text>{intervalText}</Text>;
  };

  const getStatisticsData = async () => {
    setLoading(true);
    const request = getStatisticsRequest();

    try {
      const { data } = await request;

      const paramsForStatisticsScreen = {
        settings: Object.assign({}, statisticsSettings),
        dataFromServer: data,
        statisticsName: getStatisticsName(),
      };

      const extraParams = {
        periodSelected,
      };

      switch (statisticsSettings.statisticType) {
        case StatisticsType.CATEGORY:
          extraParams.selectedCategory = selectedCategory;
          break;

        case StatisticsType.LIST:
          extraParams.selectedList = selectedList;
          break;

        case StatisticsType.PRODUCT:
          if (selectedProduct) {
            extraParams.selectedProduct = selectedProduct;
          }
          if (productDetailConfig.purchaseLocal) {
            extraParams.purchaseLocal = productDetailConfig.purchaseLocal;
          }
          if (productDetailConfig.brand) {
            extraParams.brand = productDetailConfig.brand;
          }
          break;

        default:
          break;
      }

      paramsForStatisticsScreen.extraParams = extraParams;

      // Depois de buscar navega de volta para a tela de estatísticas
      props.navigation.navigate('Statistics', paramsForStatisticsScreen);
    } catch (error) {
      console.log({ error });
      useToast().show({
        title: t('errorServerDefault'),
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatisticsRequest = () => {
    let periodFilterObject = {
      startDate: moment(statisticsSettings.startDate).toISOString(),
      endDate: moment(statisticsSettings.endDate).toISOString(),
    };

    switch (statisticsSettings.statisticType) {
      case StatisticsType.PURCHASE_LOCAL:
        return StatisticsService.getPurchaseLocalData(user);

      case StatisticsType.TIME:
        periodFilterObject = {
          ...periodFilterObject,
          unityTime: statisticsSettings.selectedUnityTime,
        };

        return StatisticsService.getExpensesPer(
          getUrl(statisticsSettings.statisticType),
          periodFilterObject,
          user
        );

      case StatisticsType.LIST:
        periodFilterObject = {
          ...periodFilterObject,
          unityTime: statisticsSettings.selectedUnityTime,
          listId: selectedList,
        };
        return StatisticsService.getExpensesPer(
          getUrl(statisticsSettings.statisticType),
          periodFilterObject,
          user
        );

      case StatisticsType.CATEGORY:
        periodFilterObject = {
          minDate: moment(statisticsSettings.startDate).toISOString(),
          maxDate: moment(statisticsSettings.endDate).toISOString(),
        };

        periodFilterObject.category =
          categories.find((cat) => cat.id === selectedCategory)?.name || '';

        return StatisticsService.getExpensesPer(
          getUrl(statisticsSettings.statisticType),
          periodFilterObject,
          user
        );

      case StatisticsType.PRODUCT:
        periodFilterObject = {
          minDate: moment(statisticsSettings.startDate).toISOString(),
          maxDate: moment(statisticsSettings.endDate).toISOString(),
        };

        if (selectedProduct) {
          periodFilterObject.name = selectedProduct;
        }

        if (productDetailConfig?.purchaseLocal) {
          periodFilterObject.purchaseLocalId = Number(
            productDetailConfig.purchaseLocal
          );
        }

        if (productDetailConfig?.brand) {
          periodFilterObject.brand = productDetailConfig.brand;
        }

        if (productDetailConfig?.brand) {
          periodFilterObject.brand = productDetailConfig.brand;
        }

        return StatisticsService.getExpensesPer(
          getUrl(statisticsSettings.statisticType),
          periodFilterObject,
          user
        );

      default:
        break;
    }
  };

  // Função que será disparada caso o tipo de estatística seja o de produto
  // e o usuário estiver digitando o nome do produto
  const searchProducts = async (value) => {
    if (value.length > 2) {
      try {
        setLoadingProducts(true);
        const { data } = await ProductService.getProductByName(value, user);
        setProducts(data);
      } catch (error) {
        useToast().show({
          title: t('errorServerDefault'),
          status: 'warning',
        });
      } finally {
        setLoadingProducts(false);
      }
    } else {
      setProducts([]);
    }
  };

  const getPurchaseLocalsByUser = async () => {
    setLoadingPurchaseLocals(true);
    try {
      const { data } = await PurchaseLocalService.findByUser(user);
      // Se for um local do MapBox (que insre vírgulas entre os trechos do endereço, pega somente o nome do lugar
      // e cria uma substring para o restante do endereço)
      const formattedPlaces = data.map((purchaseLocal) => {
        if (purchaseLocal.name.includes(',')) {
          return {
            ...purchaseLocal,
            name: purchaseLocal.name.slice(0, purchaseLocal.name.indexOf(',')),
            subname: purchaseLocal.name.slice(purchaseLocal.name.indexOf(',')),
          };
        }
        return purchaseLocal;
      });

      setUserPurchaseLocals(formattedPlaces);
    } catch (error) {
      useToast().show({
        title: t('errorServerDefault'),
        status: 'warning',
      });
    } finally {
      setLoadingPurchaseLocals(false);
    }
  };

  // Renderiza quais controles específicos aquela estatística precisa
  // para ser configurada
  // ex.: no de produto deve renderizar o input de nome de produto, no de categoria um select de categorias
  const renderStatisticsSelectors = () => {
    switch (statisticsSettings.statisticType) {
      case StatisticsType.TIME:
        return periodSelected === StatisticsPeriods.CUSTOMIZED ? (
          <Box>
            <VStack>
              <Text fontSize={18} bold mb={2} mt={4}>
                {t('selectPeriodOfAnalysis')}
              </Text>
              <Select
                onValueChange={(val) => {
                  setStatisticsSettings({
                    ...statisticsSettings,
                    selectedUnityTime: val,
                    startDate: null,
                    endDate: null,
                  });
                }}
                selectedValue={statisticsSettings.selectedUnityTime}
              >
                {Object.keys(UnityTimes)
                  .filter(
                    (unityTime) => UnityTimes[unityTime] !== UnityTimes.DEFAULT
                  )
                  .map((unityTime, index) => (
                    <Select.Item
                      value={UnityTimes[unityTime]}
                      label={t(unityTime)}
                      key={index}
                    />
                  ))}
              </Select>
            </VStack>
          </Box>
        ) : null;

      case StatisticsType.LIST:
        return (
          <Box>
            <VStack>
              {periodSelected === StatisticsPeriods.CUSTOMIZED ? (
                <Box>
                  <Text fontSize={18} bold mb={2} mt={4}>
                    {t('selectPeriodOfAnalysis')}
                  </Text>
                  <Select
                    onValueChange={(val) => {
                      setStatisticsSettings({
                        ...statisticsSettings,
                        selectedUnityTime: val,
                        startDate: null,
                        endDate: null,
                      });
                    }}
                    selectedValue={statisticsSettings.selectedUnityTime}
                  >
                    {Object.keys(UnityTimes)
                      .filter(
                        (unityTime) =>
                          UnityTimes[unityTime] !== UnityTimes.DEFAULT
                      )
                      .map((unityTime, index) => (
                        <Select.Item
                          value={UnityTimes[unityTime]}
                          label={t(unityTime)}
                          key={index}
                        />
                      ))}
                  </Select>
                </Box>
              ) : null}

              <Text fontSize={18} bold mb={2} mt={4}>
                {t('selectList')}
              </Text>
              <Select
                selectedValue={selectedList}
                onValueChange={setSelectedList}
              >
                {lists.map((list) => (
                  <Select.Item
                    value={list.id}
                    label={list.nameList}
                    key={list.id}
                  />
                ))}
              </Select>
            </VStack>
          </Box>
        );

      case StatisticsType.CATEGORY:
        return (
          <Box>
            <VStack>
              <Text fontSize={18} bold mb={2} mt={4}>
                {t('selectCategory')}
              </Text>
              <HStack>
                <Select
                  width={loadingCategories ? '90%' : '100%'}
                  isDisabled={loadingCategories}
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  {categories.map((category) => (
                    <Select.Item
                      value={category.id}
                      label={category.name}
                      key={category.id}
                    />
                  ))}
                </Select>
                {loadingCategories ? (
                  <Spinner color="primary.400" size="sm" />
                ) : null}
              </HStack>
            </VStack>
          </Box>
        );

      case StatisticsType.PRODUCT:
        return (
          <Box>
            <Box
              display="flex"
              alignItems="center"
              flexDirection="row"
              mt={4}
              mb={3}
            >
              <Text mr={2}>{t('brand')}</Text>
              <Switch
                isChecked={isSearchByProduct}
                onToggle={() => setIsSearchByProduct(!isSearchByProduct)}
                onTrackColor="dark.50"
                offTrackColor="dark.50"
                onThumbColor="dark.200"
                offThumbColor="dark.200"
              />
              <Text ml={2}>{t('product')}</Text>
            </Box>

            {isSearchByProduct ? (
              <VStack>
                <Text fontSize={18} bold my={4}>
                  {t('productName')}
                </Text>

                <HStack>
                  <Input
                    width={loadingProducts ? '90%' : '100%'}
                    type="text"
                    value={selectedProduct}
                    onChangeText={(value) => {
                      if (productDetailConfig.brand) {
                        setProductDetailConfig({
                          ...productDetailConfig,
                          brand: null,
                        });
                      }
                      setSelectedProduct(value);
                      searchProducts(value);
                    }}
                  />

                  {loadingProducts ? <Spinner size="sm" /> : null}
                </HStack>

                {products && products?.length > 0 ? (
                  <List
                    borderBottomRadius={3}
                    borderTopColor="transparent"
                    space="md"
                  >
                    <ScrollView keyboardShouldPersistTaps="always">
                      {products?.map((product) => (
                        <List.Item
                          testID="products-found"
                          py={4}
                          key={product.id}
                          onPress={() => {
                            setSelectedProduct(product.name);
                            setProducts([]);
                          }}
                          _pressed={{ bg: 'primary.500' }}
                        >
                          {product.name}
                        </List.Item>
                      ))}
                    </ScrollView>
                  </List>
                ) : null}
              </VStack>
            ) : (
              <VStack>
                <Text fontSize={18} bold my={4}>
                  {t('brandName')}
                </Text>

                <HStack>
                  <Input
                    width="100%"
                    type="text"
                    value={productDetailConfig.brand || ''}
                    onChangeText={(value) => {
                      if (selectedProduct) {
                        setSelectedProduct('');
                      }
                      setProductDetailConfig({
                        ...productDetailConfig,
                        brand: value,
                      });
                    }}
                  />
                </HStack>
              </VStack>
            )}

            {/* Mostrar mais filtros */}
            <VStack>
              <Button
                onPress={() => setShowMoreFilters(!showMoreFilters)}
                mt={2}
                size="sm"
                variant="ghost"
                colorScheme="primary"
                startIcon={<Icon size="sm" as={<AntDesign name="filter" />} />}
              >
                {t('moreFilters')}
              </Button>

              {/* Filtros abertos */}
              {showMoreFilters ? (
                <Box>
                  <Box>
                    <Text fontSize={18} bold my={4}>
                      {t('purchaseLocal')}
                    </Text>

                    <HStack>
                      <Select
                        width={
                          loadingPurchaseLocals ||
                          productDetailConfig.purchaseLocal
                            ? '90%'
                            : '100%'
                        }
                        isDisabled={loadingPurchaseLocals}
                        onValueChange={(val) => {
                          setProductDetailConfig({
                            ...productDetailConfig,
                            purchaseLocal: val,
                          });
                        }}
                        selectedValue={productDetailConfig.purchaseLocal}
                      >
                        <Select.Item label="" value=""></Select.Item>
                        {userPurchaseLocals.map((purchaseLocal) => (
                          <Select.Item
                            value={String(purchaseLocal?.id)}
                            label={purchaseLocal?.name}
                            key={purchaseLocal?.id}
                          />
                        ))}
                      </Select>
                      {loadingPurchaseLocals ? <Spinner size="sm" /> : null}
                      {!loadingPurchaseLocals &&
                      productDetailConfig.purchaseLocal ? (
                        <Button
                          onPress={() => {
                            setProductDetailConfig({
                              ...productDetailConfig,
                              purchaseLocal: '',
                            });
                          }}
                          variant="ghost"
                          startIcon={
                            <Ionicons name="close" size={24} color="#777" />
                          }
                        />
                      ) : null}
                    </HStack>
                  </Box>
                </Box>
              ) : null}
            </VStack>
          </Box>
        );
      default:
        break;
    }
  };

  // Verifica se o botão de buscar está desabilitado
  const getIsButtonDisabled = () => {
    // A regra geral é: data inicial e final devem estar selecionadas,
    // outras regras podem ser adicionadas a essa dependendo do tipo de estatística selecionada
    const basicRule =
      !statisticsSettings.startDate || !statisticsSettings.endDate;

    switch (statisticsSettings.statisticType) {
      case StatisticsType.TIME:
        return basicRule;

      case StatisticsType.CATEGORY:
        return basicRule || !selectedCategory;

      case StatisticsType.PRODUCT:
        return (
          basicRule ||
          (isSearchByProduct &&
            (!selectedProduct || !selectedProduct.length)) ||
          (!isSearchByProduct &&
            (!productDetailConfig.brand || !productDetailConfig.brand?.length))
        );

      case StatisticsType.LIST:
        return basicRule || !selectedList;

      case StatisticsType.PURCHASE_LOCAL:
        // até agora a estatística por locais da compra não tem nenhuma regra
        // portanto o botão de buscar não estará desabilitado
        return false;

      default:
        return basicRule;
    }
  };

  const handleStatisticTypeChange = (type) => {
    // Se o tipo de estatística selecionado for CATEGORY já começa a buscar
    // as categorias no banco de dados
    if (type === StatisticsType.CATEGORY) {
      getCategories();
    }

    // Objeto do settings com as modificações
    const modifiedSettingsObject = {
      ...statisticsSettings,
      statisticType: type,
    };

    // Se o tipo de período pré-selecionável selecionado for CUSTOMIZED
    // deixa nula a data inicial e final
    if (periodSelected === StatisticsPeriods.CUSTOMIZED) {
      modifiedSettingsObject.startDate = null;
      modifiedSettingsObject.endDate = null;
    }

    // Quando o tipo de estatística selecionada for CATEGORY ou PRODUCT modifica programaticamente
    // o selectedUnityTime para DEFAULT, pois esses tipos de análises não usam DAILY, WEEKLY nem MONTHLY e
    // portanto podem utilizar o DatePicker no modo padrão
    if (type === StatisticsType.CATEGORY || type === StatisticsType.PRODUCT) {
      modifiedSettingsObject.selectedUnityTime = UnityTimes.DEFAULT;
    }

    setStatisticsSettings(modifiedSettingsObject);
    resetValues();
  };

  const handleMonthChange = (date) => {
    if (currentParameter === DateParameters.START) {
      // garante que pegará o dia definido desde às 00h00min00sec
      setStatisticsSettings({
        ...statisticsSettings,
        startDate: date.startOf('date'),
      });
    } else {
      // garante que pegará o último dia do mês definido até as 23h59min59sec
      setStatisticsSettings({
        ...statisticsSettings,
        endDate: moment(date).endOf('month').endOf('date'),
      });
    }

    setIsSelectorOpen(false);
  };

  const handleDailyChange = (date, dailyCurrentParameter) => {
    if (dailyCurrentParameter === DateParameters.START) {
      // garante que pegará o dia definido desde às 00h00min00sec
      setStatisticsSettings({
        ...statisticsSettings,
        startDate: moment(date).startOf('date'),
      });
    } else {
      // garante que pegará o dia definido até as 23h59min59sec
      setStatisticsSettings({
        ...statisticsSettings,
        endDate: moment(date).endOf('date'),
      });

      setIsSelectorOpen(false);
    }
  };

  const handleDefaultChange = (date) => {
    if (currentParameter === DateParameters.START) {
      // garante que pegará o dia definido desde às 00h00min00sec
      setStatisticsSettings({
        ...statisticsSettings,
        startDate: moment(date).startOf('date'),
      });
    } else {
      // garante que pegará o dia definido até as 23h59min59sec
      setStatisticsSettings({
        ...statisticsSettings,
        endDate: moment(date).endOf('date'),
      });
    }

    setIsSelectorOpen(false);
  };

  const handleWeeklyChange = (date) => {
    if (currentParameter === DateParameters.START) {
      // garante que pegará o dia definido desde às 00h00min00sec
      setStatisticsSettings({
        ...statisticsSettings,
        startDate: moment(date).startOf('date'),
      });
    } else {
      // garante que pegará o dia definido até as 23h59min59sec
      setStatisticsSettings({
        ...statisticsSettings,
        endDate: moment(date).endOf('isoWeek').endOf('date'),
      });
    }

    setIsSelectorOpen(false);
  };

  const handleDateChange = (date, currentParam = null) => {
    switch (statisticsSettings.selectedUnityTime) {
      case UnityTimes.DAILY:
        handleDailyChange(date, currentParam);
        break;

      case UnityTimes.WEEKLY:
        handleWeeklyChange(date);
        break;

      case UnityTimes.MONTHLY:
        handleMonthChange(date);
        break;

      default:
        handleDefaultChange(date);
        break;
    }
  };

  const getStatisticsName = () => {
    let chosenStatisticsString = t(statisticsSettings.statisticType);

    switch (statisticsSettings.statisticType) {
      case StatisticsType.CATEGORY:
        if (selectedCategory) {
          const categoryName =
            categories.find((cat) => cat.id === selectedCategory)?.name || '';
          if (categoryName) {
            chosenStatisticsString += ` - ${categoryName}`;
          }
        }
        break;

      case StatisticsType.LIST:
        if (selectedList) {
          const listName =
            lists.find((list) => list.id === selectedList)?.nameList || '';
          if (listName) {
            chosenStatisticsString += ` - ${listName}`;
          }
        }
        break;

      case StatisticsType.PRODUCT:
        if (selectedProduct) chosenStatisticsString += ` - ${selectedProduct}`;
        break;

      default:
        break;
    }

    return chosenStatisticsString;
  };

  const getDefaultDateInterval = () => {
    let startDate, endDate;
    switch (periodSelected) {
      case StatisticsPeriods.LAST_MONTH:
        startDate = moment()
          .startOf('month')
          .subtract(1, 'month')
          .startOf('date');
        endDate = moment().endOf('month').subtract(1, 'month').endOf('date');
        break;

      case StatisticsPeriods.LAST_FIFTEEN_DAYS:
        startDate = moment().startOf('date').subtract(15, 'days');
        endDate = moment().endOf('date');
        break;

      case StatisticsPeriods.LAST_WEEK:
        startDate = moment()
          .startOf('date')
          .startOf('week')
          .subtract(1, 'week');
        endDate = moment().endOf('date').endOf('week').subtract(1, 'week');
        break;

      default:
        break;
    }

    if (periodSelected !== StatisticsPeriods.CUSTOMIZED) {
      const { statisticType } = statisticsSettings;

      /**
       * Caso o tipo de estatística for TIME ou LIST a unityTime que será usada será a DAILY
       * agora caso o tipo seja CATEGORY ou PRODUCT a unityTime será DEFAULT
       * o tipo de estatística PURCHASE_LOCAL não interage de nenhuma forma com esse método e por
       * isso ele não é levado em consideração
       */
      const selectedUnityTime =
        statisticType === StatisticsType.TIME ||
        statisticType === StatisticsType.LIST
          ? UnityTimes.DAILY
          : UnityTimes.DEFAULT;

      setStatisticsSettings({
        ...statisticsSettings,
        startDate,
        endDate,
        selectedUnityTime,
      });
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView width="90%" mx="auto">
        {/* Seletor de tipo de estatísticas */}
        <Text fontSize={18} bold marginBottom={2}>
          {t('selectAnalysisType')}
        </Text>
        <Select
          onValueChange={handleStatisticTypeChange}
          selectedValue={statisticsSettings.statisticType}
        >
          {Object.keys(StatisticsType).map((tipo, index) => (
            <Select.Item
              disabled={
                StatisticsType[tipo] === StatisticsType.LIST &&
                (!lists || lists?.length === 0)
              }
              value={StatisticsType[tipo]}
              label={t(StatisticsType[tipo])}
              key={index}
            />
          ))}
        </Select>

        {/* Caso a estatística não seja do tipo local da compra, mostra um
        seletor de períodos pré-selecionados */}
        {statisticsSettings.statisticType !== StatisticsType.PURCHASE_LOCAL && (
          <VStack>
            <Box mt={3}>
              <HStack>
                <ButtonGroupSelector
                  options={Object.values(StatisticsPeriods)}
                  translate={t}
                  onSelectOption={setPeriodSelected}
                  selectedOption={periodSelected}
                />
              </HStack>
            </Box>
          </VStack>
        )}

        {renderStatisticsSelectors()}

        {periodSelected === StatisticsPeriods.CUSTOMIZED &&
        statisticsSettings.statisticType !== StatisticsType.PURCHASE_LOCAL ? (
          <VStack mt={2}>
            <Text fontSize={18} bold marginBottom={2}>
              {t('selectDates')}
            </Text>

            {/* Seletor de datas - exibido caso não seja filtragem por local da compra */}
            <StatisticsDateInput
              getDateInterval={renderDateInterval}
              setStatisticsSettings={setStatisticsSettings}
              statisticsSettings={statisticsSettings}
              setIsSelectorOpen={setIsSelectorOpen}
              translate={t}
              setCurrentParameter={setCurrentParameter}
              currentParameter={currentParameter}
            />
          </VStack>
        ) : null}

        <Button
          mt={5}
          isLoading={loading}
          onPress={getStatisticsData}
          isDisabled={getIsButtonDisabled()}
        >
          {t('search')}
        </Button>

        {/* DatePicker */}
        <Center>
          {isSelectorOpen ? (
            <DatePicker
              isSelectorOpen={isSelectorOpen}
              setIsSelectorOpen={setIsSelectorOpen}
              handleDateChange={handleDateChange}
              currentParameter={currentParameter}
              setCurrentParameter={setCurrentParameter}
              selectedUnityTime={statisticsSettings.selectedUnityTime}
              dateConfig={{
                startDate: statisticsSettings.startDate,
                endDate: statisticsSettings.endDate,
              }}
              translate={t}
            />
          ) : null}
        </Center>
      </ScrollView>
    </SafeAreaView>
  );
}

StatisticsSettingsScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
  setDataFromServer: PropTypes.func,
  setSettings: PropTypes.func,
};
