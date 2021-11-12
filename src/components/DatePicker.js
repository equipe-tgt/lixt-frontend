/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';

import { Text, HStack, Box, Modal, IconButton, Icon } from 'native-base';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';

import CalendarPicker from 'react-native-calendar-picker';
import MonthSelectorCalendar from 'react-native-month-selector';
import { getI18n } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { UnityTimes, DateParameters } from '../utils/StatisticsUtils';

export default function DatePicker({
  isSelectorOpen,
  setCurrentParameter,
  handleDateChange,
  currentParameter,
  selectedUnityTime,
  setIsSelectorOpen,
  dateConfig,
  translate,
}) {
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

  const getDatePicker = () => {
    const locale = getI18n().language === 'pt_BR' ? ptBR : enUS;

    // Traduz os dias da semana e os meses para a linguagem da aplicação
    const weekdays = [...Array(7).keys()].map((i) =>
      locale.localize.day(i, { width: 'abbreviated' }).slice(0, 3)
    );
    const months = [...Array(31).keys()].map((i) => locale.localize.month(i));

    switch (selectedUnityTime) {
      // Se a busca for do tipo diário renderiza o datePicker de seleção de
      // dias
      case UnityTimes.DAILY:
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
                  <Text fontWeight="bold">{translate('selectInterval')}</Text>
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
                    const current =
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

      case UnityTimes.WEEKLY:
        break;

      // Se a busca for do tipo mensal, renderiza o datePicker de seleção de mês
      case UnityTimes.MONTHLY:
        return (
          <Modal background="#fff" isOpen={true} closeOnOverlayClick={true}>
            <Box width="100%" shadow>
              <Text bold textAlign="center" mt={5}>
                {currentParameter === DateParameters.START
                  ? translate('initialDate')
                  : translate('finalDate')}
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

      default:
        break;
    }
  };

  return getDatePicker();
}

DatePicker.propTypes = {
  isSelectorOpen: PropTypes.bool,
  setCurrentParameter: PropTypes.func,
  handleDateChange: PropTypes.func,
  currentParameter: PropTypes.number,
  selectedUnityTime: PropTypes.string,
  setIsSelectorOpen: PropTypes.func,
  dateConfig: PropTypes.object,
  translate: PropTypes.func,
};
