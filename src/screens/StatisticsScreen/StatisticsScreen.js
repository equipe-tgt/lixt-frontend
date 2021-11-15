/* eslint-disable no-case-declarations */
import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Button,
  Text,
  HStack,
  Box,
  VStack,
  IconButton,
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
  const [loading, setLoading] = useState(false);

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
  }, [selectedStatisticsType]);

  const getStatisticsData = async () => {
    try {
      setLoading(true);
      if (selectedStatisticsType === StatisticsType.PURCHASE_LOCAL) {
        const { data } = await StatisticsService.getPurchaseLocalData(user);
        setdataFromServer(data);
      } else {
        const periodFilterObject = {
          startDate: moment(dateConfig.startDate).toISOString(),
          endDate: moment(dateConfig.endDate).toISOString(),
        };

        if (selectedUnityTime !== UnityTimes.DEFAULT) {
          periodFilterObject.unityTime = selectedUnityTime;
        }

        if (selectedList) {
          periodFilterObject.listId = selectedList;
        }

        const { data } = await StatisticsService.getExpensesPer(
          getUrl(selectedStatisticsType),
          periodFilterObject,
          user
        );

        console.log(data);
        setdataFromServer(data);
      }
    } catch (error) {
      useToast().show({
        title: t('errorServerDefault'),
        status: 'error',
      });
    } finally {
      setLoading(false);
      setIsConfigOpen(false);
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
        endDate: moment(date).endOf('date'), // garante que pegará o dia definido até as 23h59min59sec
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

  const handleWeeklyAndDefaultChange = (date) => {
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

  const handleDateChange = (date, currentParam = null) => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        handleDailyChange(date, currentParam);
        break;

      case UnityTimes.WEEKLY:
        handleWeeklyAndDefaultChange(date);
        break;

      case UnityTimes.MONTHLY:
        handleMonthChange(date);
        break;

      default:
        handleWeeklyAndDefaultChange(date);
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
        return <LineChartWrapper />;
      case StatisticsType.CATEGORY:
        return <LineChartWrapper />;

      default:
        break;
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <View width="90%" mx="auto">
        <VStack mb={5}>
          <Box>
            <HStack mx="auto" alignItems="center">
              <VStack mb={2}>
                <Text fontSize="sm" textAlign="center">
                  {t('chosenStatistics')}
                </Text>
                <Text fontSize="2xl" textAlign="center">
                  {t(selectedStatisticsType)}
                </Text>
              </VStack>

              <IconButton
                ml="auto"
                variant="ghost"
                onPress={() => setIsConfigOpen(true)}
                icon={
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

        {dataFromServer && renderChart()}

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
        />
      </View>
    </SafeAreaView>
  );
}
