/* eslint-disable no-case-declarations */
import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Button,
  Text,
  HStack,
  Box,
  VStack,
  Icon,
  useToast,
  View,
} from 'native-base';
import moment from 'moment';

import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import StatisticsService from '../../services/StatisticsService';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';
import BarChartWrapper from '../../components/BarChartWrapper';
import LineChartWrapper from '../../components/LineChartWrapper';

import { useTranslation } from 'react-i18next';
import StatisticsModal from '../../components/StatisticsModal';
import CategoryService from '../../services/CategoryService';
import ProductService from '../../services/ProductService';

import {
  UnityTimes,
  DateParameters,
  StatisticsType,
  getUrl,
} from '../../utils/StatisticsUtils';

export default function StatisticsScreen() {
  const [dataFromServer, setdataFromServer] = useState(null);
  const [selectedUnityTime, setSelectedUnityTime] = useState('DAILY');
  const [selectedStatisticsType, setSelectedStatisticsType] = useState(
    StatisticsType.TIME
  );
  const [dateConfig, setDateConfig] = useState({
    startDate: null,
    endDate: null,
  });
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentParameter, setCurrentParameter] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { user } = useContext(AuthContext);
  const { lists } = useContext(ListContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isConfigOpen && (!dateConfig.startDate || !dateConfig.endDate)) {
      setDateConfig({
        startDate: null,
        endDate: null,
      });
    }
  }, [isConfigOpen]);

  // Quando o tipo de estatística selecionada for CATEGORY ou PRODUCT modifica programaticamente
  // o selectedUnityTime para DEFAULT, pois esses tipos de análises não usam DAILY, WEEKLY nem MONTHLY e
  // portanto podem utilizar o DatePicker no modo padrão
  useEffect(() => {
    if (
      selectedStatisticsType === StatisticsType.CATEGORY ||
      selectedStatisticsType === StatisticsType.PRODUCT
    ) {
      setSelectedUnityTime(UnityTimes.DEFAULT);
    }

    if (selectedStatisticsType === StatisticsType.CATEGORY) {
      getCategories();
    }
  }, [selectedStatisticsType]);

  const getStatisticsData = async () => {
    let request;
    let periodFilterObject;
    try {
      if (selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL) {
        periodFilterObject = {
          startDate: moment(dateConfig.startDate).toISOString(),
          endDate: moment(dateConfig.endDate).toISOString(),
        };
      }

      console.log(periodFilterObject);

      setLoading(true);
      switch (selectedStatisticsType) {
        case StatisticsType.PURCHASE_LOCAL:
          request = StatisticsService.getPurchaseLocalData(user);
          break;

        case StatisticsType.TIME:
          periodFilterObject = {
            ...periodFilterObject,
            unityTime: selectedUnityTime,
          };

          request = StatisticsService.getExpensesPer(
            getUrl(selectedStatisticsType),
            periodFilterObject,
            user
          );
          break;

        case StatisticsType.LIST:
          periodFilterObject = {
            ...periodFilterObject,
            unityTime: selectedUnityTime,
            listId: selectedList,
          };
          request = StatisticsService.getExpensesPer(
            getUrl(selectedStatisticsType),
            periodFilterObject,
            user
          );
          break;

        case StatisticsType.CATEGORY:
          periodFilterObject = {
            minDate: moment(dateConfig.startDate).toISOString(),
            maxDate: moment(dateConfig.endDate).toISOString(),
          };

          periodFilterObject.category = categories.find(
            (cat) => cat.id === selectedCategory
          )?.name;

          request = StatisticsService.getExpensesPer(
            getUrl(selectedStatisticsType),
            periodFilterObject,
            user
          );
          break;

        case StatisticsType.PRODUCT:
          periodFilterObject.name = selectedProduct;
          request = StatisticsService.getExpensesPer(
            getUrl(selectedStatisticsType),
            periodFilterObject,
            user
          );
          break;

        default:
          break;
      }

      const { data } = await request;
      console.log(data);
      setdataFromServer(data);
    } catch (error) {
      console.log({ error });
      useToast().show({
        title: t('errorServerDefault'),
        status: 'error',
      });
    } finally {
      setLoading(false);
      setIsConfigOpen(false);
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

  const handleMonthChange = (date) => {
    if (currentParameter === DateParameters.START) {
      setDateConfig({
        ...dateConfig,
        startDate: date.startOf('date'), // garante que pegará o dia definido desde às 00h00min00sec
      });
    } else {
      setDateConfig({
        ...dateConfig,
        endDate: moment(date).endOf('month').endOf('date'), // garante que pegará o dia definido até as 23h59min59sec
      });
    }
    setIsSelectorOpen(false);
  };

  const handleDailyChange = (date, dailyCurrentParameter) => {
    if (dailyCurrentParameter === DateParameters.START) {
      setDateConfig({
        ...dateConfig,
        startDate: moment(date).startOf('date'), // garante que pegará o dia definido desde às 00h00min00sec
      });
    } else {
      setDateConfig({
        ...dateConfig,
        endDate: moment(date).endOf('date'), // garante que pegará o dia definido até as 23h59min59sec
      });
      setIsSelectorOpen(false);
    }
  };

  const handleDefaultChange = (date) => {
    if (currentParameter === DateParameters.START) {
      setDateConfig({
        ...dateConfig,
        startDate: moment(date).startOf('date'), // garante que pegará o dia definido desde às 00h00min00sec
      });
    } else {
      setDateConfig({
        ...dateConfig,
        endDate: moment(date).endOf('date'), // garante que pegará o dia definido até as 23h59min59sec
      });
    }
    setIsSelectorOpen(false);
  };

  const handleWeeklyChange = (date) => {
    if (currentParameter === DateParameters.START) {
      setDateConfig({
        ...dateConfig,
        startDate: moment(date).startOf('date'), // garante que pegará o dia definido desde às 00h00min00sec
      });
    } else {
      setDateConfig({
        ...dateConfig,
        endDate: moment(date).endOf('isoWeek').endOf('date'), // garante que pegará o dia definido até as 23h59min59sec
      });
    }
    setIsSelectorOpen(false);
  };

  const handleDateChange = (date, currentParam = null) => {
    switch (selectedUnityTime) {
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

  const renderDateInterval = () => {
    let intervalText;
    if (dateConfig.startDate && dateConfig.endDate) {
      intervalText = `${moment(dateConfig.startDate).format('DD/MM/yyyy')} ${t(
        'until'
      )} ${moment(dateConfig.endDate).format('DD/MM/yyyy')}`;
    } else {
      intervalText = t('noIntervalSelected');
    }

    return <Text>{intervalText}</Text>;
  };

  const searchProducts = async (value) => {
    if (value.length > 2) {
      try {
        setLoadingProducts(true);
        const { data } = await ProductService.getProductByName(value, user);
        console.log(data);
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

  const renderChart = () => {
    switch (selectedStatisticsType) {
      case StatisticsType.PURCHASE_LOCAL:
        return;
      case StatisticsType.TIME:
      case StatisticsType.LIST:
        return (
          <BarChartWrapper
            selectedUnityTime={selectedUnityTime}
            monetaryNotation={t('currency')}
            preFormattedData={dataFromServer}
            translate={t}
          />
        );
      case StatisticsType.PRODUCT:
        return (
          <LineChartWrapper
            selectedUnityTime={UnityTimes.DAILY}
            preFormattedData={dataFromServer}
            monetaryNotation={t('currency')}
          />
        );
      case StatisticsType.CATEGORY:
        return (
          <LineChartWrapper
            monetaryNotation={t('currency')}
            preFormattedData={dataFromServer}
            selectedUnityTime={UnityTimes.MONTHLY}
          />
        );

      default:
        break;
    }
  };

  const getStatisticsName = () => {
    let chosenStatisticsString = t(selectedStatisticsType);

    switch (selectedStatisticsType) {
      case StatisticsType.CATEGORY:
        if (selectedCategory) {
          const categoryName = categories.find(
            (cat) => cat.id === selectedCategory
          )?.name;
          chosenStatisticsString += `- ${categoryName}`;
        }
        break;

      case StatisticsType.LIST:
        if (selectedList) {
          const listName = lists.find(
            (list) => list.id === selectedList
          )?.nameList;

          chosenStatisticsString += `- ${listName}`;
        }
        break;

      case StatisticsType.PRODUCT:
        if (selectedProduct) chosenStatisticsString += `- ${selectedProduct}`;
        break;

      default:
        break;
    }

    return chosenStatisticsString;
  };

  return (
    <SafeAreaView style={style.container}>
      <View width="90%" mx="auto">
        <VStack mb={5}>
          <Box>
            <HStack mx="auto" alignItems="center" maxWidth="80%">
              <VStack mb={2}>
                <Text fontSize="sm" textAlign="center">
                  {t('chosenStatistics')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  {getStatisticsName()}
                </Text>
              </VStack>

              <Button
                variant="ghost"
                onPress={() => setIsConfigOpen(true)}
                startIcon={
                  <Icon
                    size="sm"
                    as={<Ionicons name="settings" />}
                    color="light.600"
                  />
                }
              />
            </HStack>

            {/*  Caso o tipo de estatísticas seja uma relacionada com datas (qualquer uma que não seja a PURCHASE_LOCAL)
            e não houver um intervalo de datas selecionado, mostra uma mensagem indicando isso e um botão
          */}
            {selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL &&
            !dateConfig.startDate &&
            !dateConfig.endDate ? (
              <Box mt={3}>
                <Text fontSize="sm" textAlign="center" mr={5}>
                  {renderDateInterval()}
                </Text>
                <Button mt={2} size="sm" onPress={() => setIsConfigOpen(true)}>
                  {t('selectOne')}
                </Button>
              </Box>
            ) : null}

            {/*  Caso o tipo de estatísticas seja uma relacionada com datas (qualquer uma que não seja a PURCHASE_LOCAL)
            e tenha o intervalo de datas
          */}
            {selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL &&
            dateConfig.startDate &&
            dateConfig.endDate ? (
              <Box>
                <Text fontSize="sm" textAlign="center" mr={5}>
                  {renderDateInterval()}
                </Text>
              </Box>
            ) : null}
          </Box>
        </VStack>

        {dataFromServer &&
          dateConfig.startDate &&
          dateConfig.endDate &&
          renderChart()}

        <StatisticsModal
          isConfigOpen={isConfigOpen}
          setIsConfigOpen={setIsConfigOpen}
          setSelectedStatisticsType={setSelectedStatisticsType}
          selectedStatisticsType={selectedStatisticsType}
          selectedUnityTime={selectedUnityTime}
          setSelectedUnityTime={setSelectedUnityTime}
          setDateConfig={setDateConfig}
          translate={t}
          setCurrentParameter={setCurrentParameter}
          currentParameter={currentParameter}
          renderDateInterval={renderDateInterval}
          getStatisticsData={getStatisticsData}
          handleDateChange={handleDateChange}
          dateConfig={dateConfig}
          isSelectorOpen={isSelectorOpen}
          setIsSelectorOpen={setIsSelectorOpen}
          selectedList={selectedList}
          setSelectedList={setSelectedList}
          lists={lists}
          loading={loading}
          categories={categories}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          loadingCategories={loadingCategories}
          searchProducts={searchProducts}
          products={products}
          setSelectedProduct={setSelectedProduct}
          selectedProduct={selectedProduct}
          setProducts={setProducts}
          loadingProducts={loadingProducts}
        />
      </View>
    </SafeAreaView>
  );
}
