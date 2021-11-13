/* eslint-disable no-case-declarations */
import React, { useState } from 'react';
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
  const [startOfWeek, setStartOfWeek] = useState(undefined);
  const [endOfWeek, setEndOfWeek] = useState(undefined);

  const getMinMaxDate = () => {
    if (dateConfig.startDate || dateConfig.endDate) {
      let limitDate = moment(dateConfig.startDate).add(11, 'months');

      if (limitDate.isAfter(moment())) {
        limitDate = moment();
      }

      return {
        minDate: moment(dateConfig.startDate),
        maxDate: limitDate,
      };
    } else {
      return {
        minDate: moment('01-01-1900', 'DD-MM-YYYY'),
        maxDate: moment(),
      };
    }
  };

  // Se a pessoa selecionar uma data no modo semanal, deve garantir que o usuário vai
  // pegar a semana inteira (segunda a domingo)
  const getWeek = (date) => {
    if (date) {
      // Pega a data da segunda-feira da semana da data escolhida
      const start = moment(date).startOf('isoWeek');

      // Define o início da semana até o fim (segunda a domingo)
      setStartOfWeek(start);
      setEndOfWeek(moment(start).add(6, 'days'));
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

      // Se a busca for do tipo semanal rendereiza o datePicker de seleção de dias,
      // mas com configurações diferentes do DAILY
      case UnityTimes.WEEKLY:
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
                  disabledDates={(date) => date.isAfter(moment())}
                  allowRangeSelection
                  selectedStartDate={startOfWeek}
                  selectedEndDate={endOfWeek}
                  maxRangeDuration={7}
                  selectedRangeStartStyle={{ backgroundColor: '#06b6d4' }}
                  selectedRangeEndStyle={{ backgroundColor: '#06b6d4' }}
                  selectedRangeStyle={{ backgroundColor: '#a5f3fc' }}
                  selectedDayColor="#06b6d4"
                  onDateChange={(value) => {
                    getWeek(value);
                    // Atrasa o fechamento do modal, somente o suficiente para que o usuário
                    // consiga ver a semana selecionada
                    setTimeout(() => {
                      handleDateChange(value);
                    }, 250);
                  }}
                  weekdays={weekdays}
                  months={months}
                />
              </Modal.Body>
            </Modal.Content>
          </Modal>
        );

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
