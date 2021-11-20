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
  setIsSelectorOpen,
  translate,
  setCurrentParameter,
  currentParameter,
  statisticsSettings,
  setStatisticsSettings,
}) {
  // Se o usuário modificar a data inicial enquanto já houver selecionado uma data final
  // e o tipo de data for mensal ou semanal, limpa o parâmetro da data final
  // isso para evitar a seleção de uma data inicial mais nova que a final
  // o tipo de data diário não precisa disso pois abre o datepicker uma vez para seleção de intervalo
  useEffect(() => {
    if (
      currentParameter === DateParameters.START &&
      statisticsSettings.endDate &&
      (statisticsSettings.selectedUnityTime === UnityTimes.WEEKLY ||
        statisticsSettings.selectedUnityTime === UnityTimes.MONTHLY)
    ) {
      setStatisticsSettings({
        ...statisticsSettings,
        endDate: null,
      });
    }
  }, [statisticsSettings]);

  // Devolve qual o texto será exibido no input de datas
  // baseando-se no tipo de data selecionado
  const getSelectedDateText = (date, param = null) => {
    let formatString;
    if (date) {
      switch (statisticsSettings.selectedUnityTime) {
        case UnityTimes.DAILY:
        case UnityTimes.DEFAULT:
          formatString =
            getI18n().language === 'pt_BR' ? 'DD/MM/yyyy' : 'MM/DD/yyyy';

          return `${moment(date).format(formatString)}`;

        case UnityTimes.WEEKLY:
          formatString =
            getI18n().language === 'pt_BR' ? 'DD/MM/yyyy' : 'MM/DD/yyyy';

          let startOfWeek, endOfWeek;

          // Se o texto for da data inicial, define o início da semana a partir da data informada
          if (param === DateParameters.START) {
            startOfWeek = moment(date).format(formatString);
            endOfWeek = moment(date).add(6, 'days').format(formatString);
          } else {
            // Se o texto for da data final, define o início da semana dele subtraindo 6 dias do valor
            // da data informada
            startOfWeek = moment(date).subtract(6, 'days').format(formatString);
            endOfWeek = moment(date).format(formatString);
          }

          return `${startOfWeek} - ${endOfWeek}`;

        case UnityTimes.MONTHLY:
          return `${moment(date).format('MM/yyyy')}`;

        default:
          break;
      }
    }
  };

  const cleanIntervalButton = () => {
    if (statisticsSettings.startDate || statisticsSettings.endDate) {
      return (
        <Button
          onPress={() =>
            setStatisticsSettings({
              ...statisticsSettings,
              startDate: null,
              endDate: null,
            })
          }
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
    if (
      statisticsSettings.selectedStatisticsType !==
      StatisticsType.PURCHASE_LOCAL
    ) {
      switch (statisticsSettings.selectedUnityTime) {
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
                {statisticsSettings.startDate && statisticsSettings.endDate
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
                  {statisticsSettings.startDate
                    ? getSelectedDateText(
                        statisticsSettings.startDate,
                        DateParameters.START
                      )
                    : translate('initialWeek')}
                </Button>
              </Box>
              <Text textAlign="center" my={1}>
                {translate('until')}
              </Text>
              <Box>
                <Button
                  isDisabled={!statisticsSettings.startDate}
                  variant="outline"
                  startIcon={
                    <Ionicons
                      name="md-calendar-sharp"
                      size={20}
                      color={statisticsSettings.startDate ? '#06b6d4' : '#333'}
                    />
                  }
                  onPress={() => {
                    setCurrentParameter(DateParameters.END);
                    setIsSelectorOpen(true);
                  }}
                >
                  {statisticsSettings.endDate
                    ? getSelectedDateText(
                        statisticsSettings.endDate,
                        DateParameters.END
                      )
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
                  {statisticsSettings.startDate
                    ? getSelectedDateText(statisticsSettings.startDate)
                    : translate('initialDate')}
                </Button>
              </Box>
              <Text my={1} textAlign="center">
                {translate('until')}
              </Text>
              <Box>
                <Button
                  isDisabled={!statisticsSettings.startDate}
                  variant="outline"
                  startIcon={
                    <Ionicons
                      name="md-calendar-sharp"
                      size={20}
                      color={statisticsSettings.startDate ? '#06b6d4' : '#333'}
                    />
                  }
                  onPress={() => {
                    setCurrentParameter(DateParameters.END);
                    setIsSelectorOpen(true);
                  }}
                >
                  {statisticsSettings.endDate
                    ? getSelectedDateText(statisticsSettings.endDate)
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
  setIsSelectorOpen: PropTypes.func,
  translate: PropTypes.func,
  currentParameter: PropTypes.number,
  statisticsSettings: PropTypes.object,
};
