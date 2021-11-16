/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ScrollView } from 'native-base';
import { UnityTimes } from '../utils/StatisticsUtils';
import moment from 'moment';
import { getI18n } from 'react-i18next';

export default function BarChartWrapper({
  monetaryNotation,
  selectedUnityTime,
  preFormattedData,
}) {
  const formatChartData = () => {
    const labels = [];
    const datasetsItem = {
      data: [],
    };

    const isPortuguese = getI18n().language === 'pt_BR';

    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        for (const preData of preFormattedData) {
          // O parâmetro "time" de dia vem como <dia>/<numero-mês>
          const date = moment(preData.time, 'DD/MM');
          labels.push(moment(date).format(isPortuguese ? 'DD/MMM' : 'MMM/DD'));
          datasetsItem.data.push(preData.price);
        }
        break;

      case UnityTimes.WEEKLY:
        for (const preData of preFormattedData) {
          const formatString = isPortuguese ? 'DD/MMM' : 'MMM/DD';

          // O parâmetro "time" de semana vem como <numero-da-semana>/<ano>
          const weekNumber = Number(preData.time.slice(0, 2));
          const yearNumber = Number(preData.time.slice(3));

          const startOfWeek = moment()
            .year(yearNumber)
            .week(weekNumber + 1)
            .day('Monday');

          const endOfWeek = moment(startOfWeek).add(6, 'days');

          const label = `${startOfWeek.format(
            formatString
          )} - ${endOfWeek.format(formatString)}`;

          labels.push(label);
          datasetsItem.data.push(preData.price);
        }
        break;

      case UnityTimes.MONTHLY:
        for (const preData of preFormattedData) {
          // O parâmetro "time" de mês vem como <numero-mês>/<ano> e queremos como <abreviação-nome-mês>/<ano>
          const month = moment(preData.time, 'MM/yyyy').format('MMM/yyyy');

          labels.push(month);
          datasetsItem.data.push(preData.price);
        }
        break;

      default:
        break;
    }

    return {
      labels,
      datasets: [datasetsItem],
    };
  };

  const chartData = formatChartData();

  return (
    <ScrollView horizontal={true}>
      <BarChart
        data={chartData}
        width={Dimensions.get('window').width}
        height={400}
        yAxisLabel={monetaryNotation}
        verticalLabelRotation={30}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          barPercentage: 0.7,
          height: 5000,
          fillShadowGradient: `rgba(6, 182, 212, 1)`,
          fillShadowGradientOpacity: 1,
          decimalPlaces: 0, // optional, defaults to 2dp
          color: () => `rgba(6, 182, 212, 1)`,
          labelColor: () => `rgba(0, 0, 0, 1)`,

          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#e3e3e3',
            strokeDasharray: '10',
          },
        }}
      />
    </ScrollView>
  );
}

BarChartWrapper.propTypes = {
  monetaryNotation: PropTypes.string,
  selectedUnityTime: PropTypes.string,
  preFormattedData: PropTypes.array,
};