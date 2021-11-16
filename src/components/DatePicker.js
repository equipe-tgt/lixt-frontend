/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';

import WeekPicker from '../components/WeekPicker';
import MonthPicker from '../components/MonthPicker';

import { UnityTimes } from '../utils/StatisticsUtils';
import DayRangePicker from './DayRangePicker';
import UniqueDayPicker from './UniqueDayPicker';

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
  switch (selectedUnityTime) {
    case UnityTimes.DAILY:
      return (
        <DayRangePicker
          isSelectorOpen={isSelectorOpen}
          handleDateChange={handleDateChange}
          setCurrentParameter={setCurrentParameter}
          setIsSelectorOpen={setIsSelectorOpen}
          translate={translate}
        />
      );

    case UnityTimes.WEEKLY:
      return (
        <WeekPicker
          isSelectorOpen={isSelectorOpen}
          handleDateChange={handleDateChange}
          currentParameter={currentParameter}
          selectedUnityTime={selectedUnityTime}
          setIsSelectorOpen={setIsSelectorOpen}
          dateConfig={dateConfig}
          translate={translate}
        />
      );

    case UnityTimes.MONTHLY:
      return (
        <MonthPicker
          isSelectorOpen={isSelectorOpen}
          setIsSelectorOpen={setIsSelectorOpen}
          dateConfig={dateConfig}
          translate={translate}
          handleDateChange={handleDateChange}
          currentParameter={currentParameter}
        />
      );
    default:
      return (
        <UniqueDayPicker
          setIsSelectorOpen={setIsSelectorOpen}
          isSelectorOpen={isSelectorOpen}
          dateConfig={dateConfig}
          translate={translate}
          handleDateChange={handleDateChange}
        />
      );
  }
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
