/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'native-base';
import moment from 'moment';
import { enUS, ptBR } from 'date-fns/locale';

import CalendarPicker from 'react-native-calendar-picker';
import { getI18n } from 'react-i18next';

import { DateParameters } from '../utils/StatisticsUtils';

export default function DayRangePicker({
  isSelectorOpen,
  setCurrentParameter,
  handleDateChange,
  setIsSelectorOpen,
  translate,
}) {
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
}

DayRangePicker.propTypes = {
  isSelectorOpen: PropTypes.bool,
  setCurrentParameter: PropTypes.func,
  handleDateChange: PropTypes.func,
  currentParameter: PropTypes.number,
  setIsSelectorOpen: PropTypes.func,
  dateConfig: PropTypes.object,
  translate: PropTypes.func,
};
