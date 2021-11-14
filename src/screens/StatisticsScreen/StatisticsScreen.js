/* eslint-disable no-case-declarations */
import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Button,
  Text,
  Center,
  HStack,
  Box,
  VStack,
  Modal,
  Select,
  IconButton,
  Icon,
  Alert,
} from 'native-base';
import moment from 'moment';

import { AuthContext } from '../../context/AuthProvider';
import StatisticsService from '../../services/StatisticsService';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation, getI18n } from 'react-i18next';
import DatePicker from '../../components/DatePicker';
import StatisticsDateInput from '../../components/StatisticsDateInput';

import {
  UnityTimes,
  DateParameters,
  StatisticsType,
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

  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isConfigOpen && (!dateConfig.startDate || !dateConfig.endDate)) {
      setDateConfig({
        startDate: null,
        endDate: null,
      });
    }
  }, [isConfigOpen]);

  const getStatisticsData = async () => {
    try {
      if (selectedStatisticsType === StatisticsType.PURCHASE_LOCAL) {
        const { data } = await StatisticsService.getPurchaseLocalData(user);
        console.log(data);
      } else {
        const periodFilterObject = {
          startDate: moment(dateConfig.startDate).toISOString(),
          endDate: moment(dateConfig.endDate).toISOString(),
          unityTime: selectedUnityTime,
        };

        const { data } = await StatisticsService.getExpensesPer(
          selectedStatisticsType,
          periodFilterObject,
          user
        );

        console.log(data);
        const { time } = data[0];
        console.log(time.slice(0, 2));
        const qndEh = moment().day(0).week(time.slice(0, 2));
        console.log(qndEh);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsConfigOpen(false);
    }
  };

  const handleMonthChange = (date) => {
    if (currentParameter === DateParameters.START) {
      setDateConfig({ ...dateConfig, startDate: date });
    } else {
      setDateConfig({
        ...dateConfig,
        endDate: moment(date).add(1, 'month').subtract(1, 'day'),
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

  const handleWeeklyChange = (date) => {
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
        handleWeeklyChange(date);
        break;

      case UnityTimes.MONTHLY:
        handleMonthChange(date);
        break;

      default:
        break;
    }
  };

  const getDateInterval = () => {
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

  return (
    <SafeAreaView style={style.container}>
      <VStack width="90%" mx="auto">
        <Box>
          <HStack width={250} mx="auto" alignItems="center">
            <Text textAlign="center" mr={5}>
              {getDateInterval()}
            </Text>
            <IconButton
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
          <Text textAlign="center">{t(selectedStatisticsType)}</Text>
        </Box>
      </VStack>
      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>{t('settings')}</Modal.Header>
          <Modal.Body>
            {/* Seletor de tipo de estatísticas */}
            <Text fontSize={18} bold marginBottom={2}>
              {t('selectAnalysisType')}
            </Text>
            <Select
              onValueChange={setSelectedStatisticsType}
              selectedValue={selectedStatisticsType}
            >
              {Object.keys(StatisticsType).map((tipo, index) => (
                <Select.Item
                  value={StatisticsType[tipo]}
                  label={t(StatisticsType[tipo])}
                  key={index}
                />
              ))}
            </Select>

            {/* Se o tipo de busca de estatísticas for o de local da compra, 
            não mostra as opções de filtragem por data */}
            {selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL && (
              <Box>
                {/* Seletor de tipo de período de análise */}
                <VStack>
                  <Text fontSize={18} bold mb={2} mt={4}>
                    {t('selectPeriodOfAnalysis')}
                  </Text>
                  <Select
                    onValueChange={(val) => {
                      setSelectedUnityTime(val);
                      setDateConfig({ startDate: null, endDate: null });
                    }}
                    selectedValue={selectedUnityTime}
                  >
                    {Object.keys(UnityTimes).map((unityTime, index) => (
                      <Select.Item
                        value={UnityTimes[unityTime]}
                        label={t(unityTime)}
                        key={index}
                      />
                    ))}
                  </Select>
                </VStack>

                {/* Seletor de datas */}
                <VStack mt={2}>
                  <Text fontSize={18} bold marginBottom={2}>
                    {t('selectDates')}
                  </Text>
                  <StatisticsDateInput
                    getDateInterval={getDateInterval}
                    dateConfig={dateConfig}
                    setDateConfig={setDateConfig}
                    setIsSelectorOpen={setIsSelectorOpen}
                    translate={t}
                    setCurrentParameter={setCurrentParameter}
                    selectedUnityTime={selectedUnityTime}
                    selectedStatisticsType={selectedStatisticsType}
                    currentParameter={currentParameter}
                  />
                </VStack>
              </Box>
            )}

            {/* DatePicker, exibido caso o isSelector seja true */}
            <Center>
              <HStack>
                {isSelectorOpen && (
                  <DatePicker
                    isSelectorOpen={isSelectorOpen}
                    setIsSelectorOpen={setIsSelectorOpen}
                    handleDateChange={handleDateChange}
                    currentParameter={currentParameter}
                    setCurrentParameter={setCurrentParameter}
                    selectedUnityTime={selectedUnityTime}
                    dateConfig={dateConfig}
                    translate={t}
                  />
                )}
              </HStack>
            </Center>
          </Modal.Body>
          <Modal.Footer justifyContent="space-between">
            <Button onPress={() => setIsConfigOpen(false)} variant="link">
              {t('cancel')}
            </Button>
            <Button onPress={getStatisticsData}>{t('search')}</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView>
  );
}
