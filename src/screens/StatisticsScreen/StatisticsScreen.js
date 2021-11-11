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
import { enUS, ptBR } from 'date-fns/locale';

import { AuthContext } from '../../context/AuthProvider';
import StatisticsService from '../../services/StatisticsService';
import { screenBasicStyle as style } from '../../styles/style';
import { Ionicons } from '@expo/vector-icons';

import CalendarPicker from 'react-native-calendar-picker';
import MonthSelectorCalendar from 'react-native-month-selector';
import { useTranslation, getI18n } from 'react-i18next';

const UnityTimes = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

const DateParameters = {
  START: 0,
  END: 1,
};

const StatisticsType = {
  TIME: 'time',
  PRODUCT: 'product',
  CATEGORY: 'category',
  PURCHASE_LOCAL: 'purchaseLocal',
};

export default function StatisticsScreen() {
  const [dataFromServer, setdataFromServer] = useState(null);
  const [selectedUnityTime, setSelectedUnityTime] = useState('DAILY');
  const [selectedStatisticsType, setselectedStatisticsType] = useState(
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
      const periodFilterObject = {
        startDate: moment(dateConfig.startDate).toISOString(),
        endDate: moment(dateConfig.endDate).toISOString(),
        listId: 1,
        unityTime: selectedUnityTime,
      };

      const { data } = await StatisticsService.getExpensesPer(
        selectedStatisticsType,
        periodFilterObject,
        user
      );
      console.log(data);
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
        endDate: moment(date).add(1, 'month').subtract(1, 'day'),
      });
      setIsSelectorOpen(false);
    }
  };

  const handleDateChange = (date, currentParam = null) => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        handleDailyAndWeeklyChange(date, currentParam);
        break;

      case UnityTimes.MONTHLY:
        handleMonthChange(date);
        break;

      default:
        break;
    }
  };

  const getDatePicker = () => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        const locale = getI18n().language === 'pt_BR' ? ptBR : enUS;

        const weekdays = [...Array(7).keys()].map((i) =>
          locale.localize.day(i, { width: 'abbreviated' }).slice(0, 3)
        );
        const months = [...Array(31).keys()].map((i) =>
          locale.localize.month(i)
        );

        return (
          <Modal
            height={450}
            m="auto"
            isOpen={isSelectorOpen}
            closeOnOverlayClick
          >
            <Modal.Content>
              <Modal.Body>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="bold">{t('selectInterval')}</Text>
                  <IconButton
                    onPress={() => setIsSelectorOpen(false)}
                    variant="ghost"
                    icon={
                      <Icon
                        size="sm"
                        as={<Ionicons name="close" />}
                        color="#333"
                      />
                    }
                  />
                </HStack>
                <CalendarPicker
                  width={350}
                  allowRangeSelection
                  maxRangeDuration={31}
                  disabledDates={(date) => date.isAfter(moment())}
                  selectedDayColor="#06b6d4"
                  onDateChange={(value, currentParameter) => {
                    let current =
                      currentParameter === 'START_DATE'
                        ? DateParameters.START
                        : DateParameters.END;
                    setCurrentParameter(current);
                    handleDateChange(value, current);
                  }}
                  weekdays={weekdays}
                  months={months}
                />
              </Modal.Body>
            </Modal.Content>
          </Modal>
        );

      case UnityTimes.MONTHLY:
        return (
          <Modal background="#fff" isOpen={true} closeOnOverlayClick={true}>
            <Box width="100%" shadow>
              <Text bold textAlign="center" mt={5}>
                {currentParameter === DateParameters.START
                  ? t('initialDate')
                  : t('finalDate')}
              </Text>
              <MonthSelectorCalendar
                selectedBackgroundColor="#06b6d4"
                minDate={getMinMaxDate().minDate}
                maxDate={getMinMaxDate().maxDate}
                containerStyle={{
                  width: '90%',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                selectedDate={
                  currentParameter === DateParameters.START
                    ? dateConfig.startDate || moment()
                    : dateConfig.endDate || moment()
                }
                onMonthTapped={(date) => handleDateChange(date)}
              />
            </Box>
          </Modal>
        );
      case UnityTimes.WEEKLY:
        break;

      default:
        break;
    }
  };

  const getMinMaxDate = () => {
    if (dateConfig.startDate || dateConfig.endDate) {
      switch (selectedUnityTime) {
        case UnityTimes.DAILY:
          return;

        case UnityTimes.MONTHLY:
          // eslint-disable-next-line no-case-declarations
          let limitDate = moment(dateConfig.startDate).add(11, 'months');

          if (limitDate.isAfter(moment())) {
            limitDate = moment();
          }

          return {
            minDate: moment(dateConfig.startDate),
            maxDate: limitDate,
          };

        case UnityTimes.WEEKLY:
          return;

        default:
          break;
      }
    } else {
      return {
        minDate: moment('01-01-1900', 'DD-MM-YYYY'),
        maxDate: moment(),
      };
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
              onValueChange={setselectedStatisticsType}
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
              <HStack>{isSelectorOpen && getDatePicker()}</HStack>
            </Center>
          </Modal.Body>
          <Modal.Footer justifyContent="space-between">
            <Button onPress={() => setIsConfigOpen(false)} variant="link">
              Cancelar
            </Button>
            <Button onPress={getStatisticsData}>Buscar</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView>
  );
}
