/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'native-base';
import moment from 'moment';
import 'moment/locale/pt-br';

import MonthSelectorCalendar from 'react-native-month-selector';

import { DateParameters } from '../utils/StatisticsUtils';
import { getI18n } from 'react-i18next';

export default function MonthPicker({
  handleDateChange,
  currentParameter,
  setIsSelectorOpen,
  isSelectorOpen,
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

      // na hora de pegar a data mínima, se for MONTHLY pega o mês seguinte do definido como data inicial
      const minDate = moment(dateConfig.startDate).add(1, 'month');

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

  const language = getI18n().language === 'pt_BR' ? 'pt-br' : 'en';

  // Se a busca for do tipo mensal, renderiza o datePicker de seleção de mês
  return (
    <Modal
      isOpen={isSelectorOpen}
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
            localeLanguage={language}
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
}

MonthPicker.propTypes = {
  handleDateChange: PropTypes.func,
  currentParameter: PropTypes.number,
  setIsSelectorOpen: PropTypes.func,
  isSelectorOpen: PropTypes.bool,
  dateConfig: PropTypes.object,
  translate: PropTypes.func,
};
