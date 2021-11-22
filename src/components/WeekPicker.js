/* eslint-disable no-case-declarations */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'native-base';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';

import CalendarPicker from 'react-native-calendar-picker';
import { getI18n } from 'react-i18next';
import { DateParameters } from '../utils/StatisticsUtils';

export default function WeekPicker({
  isSelectorOpen,
  handleDateChange,
  setIsSelectorOpen,
  currentParameter,
  dateConfig,
  translate,
}) {
  const [startOfWeek, setStartOfWeek] = useState(undefined);
  const [endOfWeek, setEndOfWeek] = useState(undefined);

  // Define os limites de seleção de data do calendário
  const getMinMaxDate = () => {
    if (dateConfig.startDate || dateConfig.endDate) {
      let limitDate = moment(dateConfig.startDate).add(11, 'months');

      if (limitDate.isAfter(moment())) {
        limitDate = moment();
      }

      // se for WEEKLY, pega o dia inicial acrescido de 7 dias (ou seja, a data mínima é o primeiro dia da semana seguinte)
      const minDate = moment(dateConfig.startDate).add(7, 'days');

      return {
        minDate,
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
      const start = moment(date).startOf('isoWeek').startOf('date');
      const end = moment(start).add(6, 'days').endOf('date');

      // Define o início da semana até o fim (segunda a domingo)
      setStartOfWeek(start);
      setEndOfWeek(end);

      return { start, end };
    }
  };

  const onDateChange = (value) => {
    const { start } = getWeek(value);
    // Atrasa o fechamento do modal, somente o suficiente para que o usuário
    // consiga ver a semana selecionada
    setTimeout(() => {
      handleDateChange(start);
    }, 50);
  };

  const locale = getI18n().language === 'pt_BR' ? ptBR : enUS;

  // Traduz os dias da semana e os meses para a linguagem da aplicação
  const weekdays = [...Array(7).keys()].map((i) =>
    locale.localize.day(i, { width: 'abbreviated' }).slice(0, 3)
  );
  const months = [...Array(31).keys()].map((i) => locale.localize.month(i));

  // Se a busca for do tipo semanal rendereiza o datePicker de seleção de dias,
  // mas com configurações diferentes do DAILY

  return (
    <Modal
      height={450}
      m="auto"
      isOpen={isSelectorOpen}
      onClose={() => setIsSelectorOpen(false)}
      closeOnOverlayClick
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{translate('selectWeek')}</Modal.Header>
        <Modal.Body>
          <CalendarPicker
            width={350}
            disabledDates={(date) => date.isAfter(moment())}
            allowRangeSelection
            minDate={getMinMaxDate().minDate}
            maxDate={getMinMaxDate().maxDate}
            selectedStartDate={startOfWeek}
            selectedEndDate={endOfWeek}
            maxRangeDuration={7}
            selectedRangeStartStyle={{ backgroundColor: '#06b6d4' }}
            selectedRangeEndStyle={{ backgroundColor: '#06b6d4' }}
            selectedRangeStyle={{ backgroundColor: '#a5f3fc' }}
            selectedDayColor="#06b6d4"
            previousTitle={translate('previous')}
            nextTitle={translate('next')}
            onDateChange={onDateChange}
            weekdays={weekdays}
            months={months}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

WeekPicker.propTypes = {
  isSelectorOpen: PropTypes.bool,
  setCurrentParameter: PropTypes.func,
  handleDateChange: PropTypes.func,
  currentParameter: PropTypes.number,
  setIsSelectorOpen: PropTypes.func,
  dateConfig: PropTypes.object,
  translate: PropTypes.func,
};
