/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'native-base';
import { enUS, ptBR } from 'date-fns/locale';
import moment from 'moment';
import { getI18n } from 'react-i18next';

import CalendarPicker from 'react-native-calendar-picker';

export default function UniqueDayPicker({
  isSelectorOpen,
  handleDateChange,
  setIsSelectorOpen,
  dateConfig,
  translate,
}) {
  // Define os limites de seleção de data do calendário
  const getMinMaxDate = () => {
    if (dateConfig.startDate || dateConfig.endDate) {
      let limitDate = moment(dateConfig.startDate).add(11, 'months');

      if (limitDate.isAfter(moment())) {
        limitDate = moment();
      }

      const minDate = moment(dateConfig.startDate).add(1, 'day');

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

  const locale = getI18n().language === 'pt_BR' ? ptBR : enUS;

  // Traduz os dias da semana e os meses para a linguagem da aplicação
  const weekdays = [...Array(7).keys()].map((i) =>
    locale.localize.day(i, { width: 'abbreviated' }).slice(0, 3)
  );
  const months = [...Array(31).keys()].map((i) => locale.localize.month(i));

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
            disabledDates={(date) => date.isAfter(moment().endOf('date'))}
            selectedDayColor="#06b6d4"
            onDateChange={handleDateChange}
            weekdays={weekdays}
            months={months}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

UniqueDayPicker.propTypes = {
  isSelectorOpen: PropTypes.bool,
  handleDateChange: PropTypes.func,
  setIsSelectorOpen: PropTypes.func,
  dateConfig: PropTypes.object,
  translate: PropTypes.func,
};
