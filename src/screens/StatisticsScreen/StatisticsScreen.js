import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import {
  Button,
  Text,
  Center,
  HStack,
  Box,
  Heading,
  VStack,
  Modal,
  Select,
} from 'native-base';
import moment from 'moment';

import { AuthContext } from '../../context/AuthProvider';
import StatisticsService from '../../services/StatisticsService';
import { screenBasicStyle as style } from '../../styles/style';
import { Entypo } from '@expo/vector-icons';

import DateTimePicker from '@react-native-community/datetimepicker';
import MonthSelectorCalendar from 'react-native-month-selector';

// import { useTranslation, getI18n } from 'react-i18next';
// import { ptBR } from 'date-fns/locale';

const UnityTimes = {
  DAILY: 'DAILY',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
};

const DateParameters = {
  START: 0,
  END: 1,
};

const StatisticsType = {
  TIME: 'time',
  PRODUCT: 'product',
  CATEGORY: 'category',
};

export default function StatisticsScreen() {
  const [dataFromServer, setdataFromServer] = useState(null);
  const [selectedUnityTime, setSelectedUnityTime] = useState('MONTHLY');
  const [selectedStatisticsType, setselectedStatisticsType] = useState(
    StatisticsType.TIME
  );
  const [dateConfig, setDateConfig] = useState({
    startDate: null,
    endDate: null,
  });
  const [minMaxDate, setMinMaxDate] = useState({
    minDate: moment('01-01-1900', 'DD-MM-YYYY'),
    maxDate: null,
  });
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentParameter, setCurrentParameter] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const getStatisticsData = async () => {
    try {
      const periodFilterObject = {
        endDate: moment(dateConfig.endDate).toISOString(),
        listId: 1,
        startDate: moment(dateConfig.startDate).toISOString(),
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

  useEffect(() => {
    console.log(dateConfig);
  }, [dateConfig]);

  const handleDateChange = (date) => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        break;

      case UnityTimes.MONTHLY:
        if (currentParameter === DateParameters.START) {
          setDateConfig({ ...dateConfig, startDate: date });
        } else {
          setDateConfig({
            ...dateConfig,
            endDate: moment(date).add(1, 'month').subtract(1, 'day'),
          });
        }
        break;

      default:
        break;
    }

    setIsSelectorOpen(false);
    getMinMaxDate();
  };

  const getDatePicker = () => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        break;
      case UnityTimes.MONTHLY:
        return (
          <Box width="100%" shadow>
            <Text bold textAlign="center" mt={5}>
              {currentParameter === DateParameters.START
                ? 'Data inicial'
                : 'Data final'}
            </Text>
            <MonthSelectorCalendar
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
        );
      case UnityTimes.WEEKLY:
        break;

      default:
        break;
    }
  };

  const getMinMaxDate = () => {
    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        break;

      case UnityTimes.MONTHLY:
        break;

      default:
        break;
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <Heading ml={5}>Estatísticas - teste</Heading>

      <Button onPress={() => setIsConfigOpen(true)}>Configurar busca</Button>

      <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Configurações</Modal.Header>
          <Modal.Body>
            <Text fontSize={18} bold marginBottom={2}>
              Selecionar tipo de análise
            </Text>
            <Select selectedValue={selectedStatisticsType}>
              {Object.keys(StatisticsType).map((tipo, index) => (
                <Select.Item
                  value={StatisticsType[tipo]}
                  label={StatisticsType[tipo]}
                  key={index}
                />
              ))}
            </Select>

            <Text fontSize={18} bold marginBottom={2}>
              Selecionar período de análise
            </Text>
            <Select selectedValue={selectedUnityTime}>
              {Object.keys(UnityTimes).map((unityTime, index) => (
                <Select.Item
                  value={UnityTimes[unityTime]}
                  label={UnityTimes[unityTime]}
                  key={index}
                />
              ))}
            </Select>

            <VStack mt={2}>
              <Text fontSize={18} bold marginBottom={2}>
                Selecionar datas
              </Text>
              <HStack justifyContent="space-around">
                <Box>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setCurrentParameter(DateParameters.START);
                      setIsSelectorOpen(true);
                    }}
                  >
                    Data inicial
                  </Button>
                  <Text>{`${moment(dateConfig?.startDate).format(
                    'MM/yyyy'
                  )}`}</Text>
                </Box>

                <Box>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setCurrentParameter(DateParameters.END);
                      setIsSelectorOpen(true);
                    }}
                  >
                    Data final
                  </Button>
                  <Text>{`${moment(dateConfig?.endDate).format(
                    'MM/yyyy'
                  )}`}</Text>
                </Box>
              </HStack>
            </VStack>
            <Center>
              <HStack>{isSelectorOpen && getDatePicker()}</HStack>
            </Center>
          </Modal.Body>
          <Modal.Footer justifyContent="space-between">
            <Button onPress={() => setIsConfigOpen(false)} variant="link">
              Cancelar
            </Button>
            <Button onPress={getStatisticsData}>Salvar</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView>
  );
}
