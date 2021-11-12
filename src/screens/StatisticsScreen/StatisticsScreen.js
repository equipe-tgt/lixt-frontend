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
} from 'native-base';
import moment from 'moment';

import { AuthContext } from '../../context/AuthProvider';
import StatisticsService from '../../services/StatisticsService';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation, getI18n } from 'react-i18next';
import DatePicker from '../../components/DatePicker';

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

  const handleDailyAndWeeklyChange = (date, currentParam) => {
    if (currentParam === DateParameters.START) {
      setDateConfig({ ...dateConfig, startDate: date });
    } else {
      setDateConfig({
        ...dateConfig,
        endDate: date,
      });
      setIsSelectorOpen(false);
    }
  };

  const handleDateChange = (date, currentParam = null) => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
      case UnityTimes.WEEKLY:
        handleDailyAndWeeklyChange(date, currentParam);
        break;

      case UnityTimes.MONTHLY:
        handleMonthChange(date);
        break;

      default:
        break;
    }
  };

  const getSelectedDateText = (date) => {
    if (date) {
      if (selectedUnityTime === UnityTimes.MONTHLY) {
        return <Text>{`${moment(date).format('MM/yyyy')}`}</Text>;
      } else {
        const formatString =
          getI18n().language === 'pt_BR' ? 'DD/MM/yyyy' : 'MM/DD/yyyy';

        return <Text>{`${moment(date).format(formatString)}`}</Text>;
      }
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

  const getDateInput = () => {
    if (selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL) {
      if (selectedUnityTime === UnityTimes.MONTHLY) {
        return (
          <HStack justifyContent="space-around" alignItems="center">
            <Box>
              <Button
                variant="outline"
                onPress={() => {
                  setCurrentParameter(DateParameters.START);
                  setIsSelectorOpen(true);
                }}
              >
                {dateConfig.startDate
                  ? getSelectedDateText(dateConfig.startDate)
                  : t('initialDate')}
              </Button>
            </Box>
            <Text>{t('until')}</Text>
            <Box>
              <Button
                isDisabled={!dateConfig.startDate}
                variant="outline"
                onPress={() => {
                  setCurrentParameter(DateParameters.END);
                  setIsSelectorOpen(true);
                }}
              >
                {dateConfig.endDate
                  ? getSelectedDateText(dateConfig.endDate)
                  : t('finalDate')}
              </Button>
            </Box>

            <IconButton
              onPress={() => setDateConfig({ startDate: null, endDate: null })}
              variant="ghost"
              icon={
                <Icon size="sm" as={<Ionicons name="close" />} color="white" />
              }
            />
          </HStack>
        );
      } else {
        return (
          <Button
            onPress={() => setIsSelectorOpen(true)}
            startIcon={
              <Ionicons name="md-calendar-sharp" size={24} color="white" />
            }
          >
            {dateConfig.startDate && dateConfig.endDate
              ? getDateInterval()
              : t('selectInterval')}
          </Button>
        );
      }
    }
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
                  {getDateInput()}
                </VStack>
              </Box>
            )}

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
