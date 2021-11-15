/* eslint-disable no-case-declarations */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text, Box, Button, VStack, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { getI18n } from 'react-i18next';

import {
  UnityTimes,
  StatisticsType,
  DateParameters,
} from '../utils/StatisticsUtils';

export default function StatisticsDateInput({
  getDateInterval,
  dateConfig,
  selectedUnityTime,
  selectedStatisticsType,
  setIsSelectorOpen,
  translate,
  setCurrentParameter,
  setDateConfig,
  currentParameter,
}) {
  // Se o usuário modificar a data inicial enquanto já houver selecionado uma data final
  // e o tipo de data for mensal ou semanal, limpa o parâmetro da data final
  // isso para evitar a seleção de uma data inicial mais nova que a final
  // o tipo de data diário não precisa disso pois abre o datepicker uma vez para seleção de intervalo
  useEffect(() => {
    if (
      currentParameter === DateParameters.START &&
      dateConfig.endDate &&
      (selectedUnityTime === UnityTimes.WEEKLY ||
        selectedUnityTime === UnityTimes.MONTHLY)
    ) {
      setDateConfig({
        ...dateConfig,
        endDate: null,
      });
    }
  }, [dateConfig]);

  // Devolve qual o texto será exibido no input de datas
  // baseando-se no tipo de data selecionado
  const getSelectedDateText = (date) => {
    let formatString;
    if (date) {
      switch (selectedUnityTime) {
        case UnityTimes.DAILY:
        case UnityTimes.DEFAULT:
          formatString =
            getI18n().language === 'pt_BR' ? 'DD/MM/yyyy' : 'MM/DD/yyyy';

          return `${moment(date).format(formatString)}`;

        case UnityTimes.WEEKLY:
          formatString =
            getI18n().language === 'pt_BR' ? 'DD/MM/yyyy' : 'MM/DD/yyyy';

          const startOfWeek = moment(date).format(formatString);

          const endOfWeek = moment(date).add(6, 'days').format(formatString);
          return `${startOfWeek} - ${endOfWeek}`;

        case UnityTimes.MONTHLY:
          return `${moment(date).format('MM/yyyy')}`;

        default:
          break;
      }
    }
  };

  const cleanIntervalButton = () => {
    if (dateConfig.startDate || dateConfig.endDate) {
      return (
        <Button
          onPress={() => setDateConfig({ startDate: null, endDate: null })}
          variant="ghost"
          colorScheme="warmGray"
          startIcon={<Icon size="sm" as={<Ionicons name="close" />} />}
        >
          {translate('clear')}
        </Button>
      );
    }
  };

  const getDateInput = () => {
    if (selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL) {
      switch (selectedUnityTime) {
        // Input único de seleção de intervalo
        case UnityTimes.DAILY:
          return (
            <Box>
              <Button
                variant="outline"
                onPress={() => setIsSelectorOpen(true)}
                startIcon={
                  <Ionicons
                    name="md-calendar-sharp"
                    size={24}
                    color="#06b6d4"
                  />
                }
              >
                {dateConfig.startDate && dateConfig.endDate
                  ? getDateInterval()
                  : translate('selectInterval')}
              </Button>
              {cleanIntervalButton()}
            </Box>
          );

        // Input composto de seleção de datas
        // (um para a seleção da semana inicial e um para a seleção da semana final)
        case UnityTimes.WEEKLY:
          return (
            <VStack>
              <Box>
                <Button
                  startIcon={
                    <Ionicons
                      name="md-calendar-sharp"
                      size={20}
                      color="#06b6d4"
                    />
                  }
                  variant="outline"
                  onPress={() => {
                    setCurrentParameter(DateParameters.START);
                    setIsSelectorOpen(true);
                  }}
                >
                  {dateConfig.startDate
                    ? getSelectedDateText(dateConfig.startDate)
                    : translate('initialWeek')}
                </Button>
              </Box>
              <Text textAlign="center" my={1}>
                {translate('until')}
              </Text>
              <Box>
                <Button
                  isDisabled={!dateConfig.startDate}
                  variant="outline"
                  startIcon={
                    <Ionicons
                      name="md-calendar-sharp"
                      size={20}
                      color={dateConfig.startDate ? '#06b6d4' : '#333'}
                    />
                  }
                  onPress={() => {
                    setCurrentParameter(DateParameters.END);
                    setIsSelectorOpen(true);
                  }}
                >
                  {dateConfig.endDate
                    ? getSelectedDateText(dateConfig.endDate)
                    : translate('finalWeek')}
                </Button>
              </Box>
              {cleanIntervalButton()}
            </VStack>
          );

        // Input composto de seleção de datas
        // (um para a seleção do mês inicial e um para a seleção do mês final)
        case UnityTimes.MONTHLY:
        case UnityTimes.DEFAULT:
          return (
            <VStack>
              <Box>
                <Button
                  startIcon={
                    <Ionicons
                      name="md-calendar-sharp"
                      size={20}
                      color="#06b6d4"
                    />
                  }
                  variant="outline"
                  onPress={() => {
                    setCurrentParameter(DateParameters.START);
                    setIsSelectorOpen(true);
                  }}
                >
                  {dateConfig.startDate
                    ? getSelectedDateText(dateConfig.startDate)
                    : translate('initialDate')}
                </Button>
              </Box>
              <Text my={1} textAlign="center">
                {translate('until')}
              </Text>
              <Box>
                <Button
                  isDisabled={!dateConfig.startDate}
                  variant="outline"
                  startIcon={
                    <Ionicons
                      name="md-calendar-sharp"
                      size={20}
                      color={dateConfig.startDate ? '#06b6d4' : '#333'}
                    />
                  }
                  onPress={() => {
                    setCurrentParameter(DateParameters.END);
                    setIsSelectorOpen(true);
                  }}
                >
                  {dateConfig.endDate
                    ? getSelectedDateText(dateConfig.endDate)
                    : translate('finalDate')}
                </Button>
              </Box>

              {cleanIntervalButton()}
            </VStack>
          );

        default:
          break;
      }
    }
  };

  return getDateInput();
}

StatisticsDateInput.propTypes = {
  getDateInterval: PropTypes.func,
  dateConfig: PropTypes.object,
  selectedUnityTime: PropTypes.string,
  selectedStatisticsType: PropTypes.string,
  setIsSelectorOpen: PropTypes.func,
  translate: PropTypes.func,
  setCurrentParameter: PropTypes.func,
  setDateConfig: PropTypes.func,
  currentParameter: PropTypes.number,
};
