/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, Button, VStack, IconButton, Icon } from 'native-base';
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
}) {
  // Devolve qual o texto será exibido no input de datas
  // baseando-se no tipo de data selecionado
  const getSelectedDateText = (date) => {
    let formatString;
    if (date) {
      switch (selectedUnityTime) {
        case UnityTimes.DAILY:
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

  const getDateInput = () => {
    if (selectedStatisticsType !== StatisticsType.PURCHASE_LOCAL) {
      switch (selectedUnityTime) {
        // Input único de seleção de intervalo
        case UnityTimes.DAILY:
          return (
            <Button
              onPress={() => setIsSelectorOpen(true)}
              startIcon={
                <Ionicons name="md-calendar-sharp" size={24} color="white" />
              }
            >
              {dateConfig.startDate && dateConfig.endDate
                ? getDateInterval()
                : translate('selectInterval')}
            </Button>
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

              <IconButton
                onPress={() =>
                  setDateConfig({ startDate: null, endDate: null })
                }
                variant="ghost"
                icon={
                  <Icon
                    size="sm"
                    as={<Ionicons name="close" />}
                    color="white"
                  />
                }
              />
            </VStack>
          );

        // Input composto de seleção de datas
        // (um para a seleção do mês inicial e um para a seleção do mês final)
        case UnityTimes.MONTHLY:
          return (
            <VStack>
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

              <IconButton
                onPress={() =>
                  setDateConfig({ startDate: null, endDate: null })
                }
                variant="ghost"
                icon={
                  <Icon
                    size="sm"
                    as={<Ionicons name="close" />}
                    color="white"
                  />
                }
              />
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
};
