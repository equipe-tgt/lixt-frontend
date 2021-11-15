/* eslint-disable no-case-declarations */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'native-base';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';

import CalendarPicker from 'react-native-calendar-picker';
import MonthSelectorCalendar from 'react-native-month-selector';
import { getI18n } from 'react-i18next';

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

  // Define os limites de seleção de data do calendário
  const getMinMaxDate = () => {
    if (dateConfig.startDate || dateConfig.endDate) {
      let limitDate = moment(dateConfig.startDate).add(11, 'months');

      if (limitDate.isAfter(moment())) {
        limitDate = moment();
      }

      let minDate;

      // Os únicos formatos que usam o minMaxDate são o MONTHLY, WEEKLY e o DEFAULT, portanto
      switch (selectedUnityTime) {
        // na hora de pegar a data mínima, se for MONTHLY pega o mês seguinte do definido como data inicial
        case UnityTimes.MONTHLY:
          minDate = moment(dateConfig.startDate).add(1, 'month');
          break;

        // se for WEEKLY, pega o dia inicial acrescido de 7 dias (ou seja, a data mínima é o primeiro dia da semana seguinte)
        case UnityTimes.WEEKLY:
          minDate = moment(dateConfig.startDate).add(7, 'days');
          break;

        // se for o DEFAULT, pega o dia inicial e soma mais um (ou seja, a data mínima de seleção passa a ser o dia seguinte ao da data inicial)
        case UnityTimes.DEFAULT:
          minDate = moment(dateConfig.startDate).add(1, 'day');
          break;

        default:
          break;
      }

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
            onClose={() => setIsSelectorOpen(false)}
            closeOnOverlayClick
          >
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>{translate('selectInterval')}</Modal.Header>
              <Modal.Body>
                <CalendarPicker
                  width={350}
                  allowRangeSelection
                  previousTitle={translate('previous')}
                  nextTitle={translate('next')}
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
                  onDateChange={(value) => {
                    getWeek(value);
                    // Atrasa o fechamento do modal, somente o suficiente para que o usuário
                    // consiga ver a semana selecionada
                    setTimeout(() => {
                      handleDateChange(value);
                    }, 50);
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
          <Modal
            isOpen={true}
            closeOnOverlayClick={true}
            onClose={() => setIsSelectorOpen(false)}
          >
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>
                {currentParameter === DateParameters.START
                  ? translate('initialDate')
                  : translate('finalDate')}
              </Modal.Header>
              <Modal.Body>
                <MonthSelectorCalendar
                  prevText={translate('previous')}
                  nextText={translate('next')}
                  selectedBackgroundColor="#06b6d4"
                  minDate={getMinMaxDate().minDate}
                  maxDate={getMinMaxDate().maxDate}
                  containerStyle={{
                    backgroundColor: 'transparent',
                  }}
                  selectedDate={
                    currentParameter === DateParameters.START
                      ? dateConfig.startDate || moment()
                      : dateConfig.endDate || moment()
                  }
                  onMonthTapped={(date) => handleDateChange(date)}
                />
              </Modal.Body>
            </Modal.Content>
          </Modal>
        );

      // Se a busca for do tipo DEFAULT
      case UnityTimes.DEFAULT:
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
              <Modal.Header>{translate('selectInterval')}</Modal.Header>
              <Modal.Body>
                <CalendarPicker
                  width={350}
                  minDate={getMinMaxDate().minDate}
                  previousTitle={translate('previous')}
                  nextTitle={translate('next')}
                  disabledDates={(date) => date.isAfter(moment())}
                  selectedDayColor="#06b6d4"
                  onDateChange={handleDateChange}
                  weekdays={weekdays}
                  months={months}
                />
              </Modal.Body>
            </Modal.Content>
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
