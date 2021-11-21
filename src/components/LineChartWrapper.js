import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView, Center, Text } from 'native-base';
import { Dimensions } from 'react-native';
import { getI18n, useTranslation } from 'react-i18next';

import { UnityTimes } from '../utils/StatisticsUtils';

export default function LineChartWrapper({
  monetaryNotation,
  selectedUnityTime,
  preFormattedData,
}) {
  const { t } = useTranslation();

  const formatChartData = () => {
    const isPortuguese = getI18n().language === 'pt_BR';

    const labels = [];
    const datasetsItem = {
      data: [],
    };

    let sortedData;

    // Organizando array por ordem de data crescente
    if (selectedUnityTime === UnityTimes.MONTHLY) {
      sortedData = preFormattedData.sort(
        (a, b) => moment(a.month, 'MM/yyyy') > moment(b.month, 'MM/yyyy')
      );
    } else {
      sortedData = preFormattedData.sort(
        (a, b) => moment(a.date) > moment(b.date)
      );
    }

    for (const preData of sortedData) {
      if (selectedUnityTime === UnityTimes.MONTHLY) {
        const month = moment(preData.month, 'MM/yyyy').format('MMM/yyyy');
        labels.push(month);
        datasetsItem.data.push(preData.price);
      } else {
        labels.push(
          moment(preData.date).format(
            isPortuguese ? 'DD/MM/yyyy' : 'MM/DD/yyyy'
          )
        );
        datasetsItem.data.push(preData.price);
      }
    }

    return {
      labels,
      datasets: [datasetsItem],
    };
  };
  const chartData = formatChartData();

  return preFormattedData && preFormattedData?.length ? (
    <ScrollView horizontal={true}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width}
        height={450}
        verticalLabelRotation={30}
        yAxisLabel={monetaryNotation}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          fillShadowGradient: '#fff',
          fillShadowGradientOpacity: 1,
          decimalPlaces: 2, // optional, defaults to 2dp
          labelColor: (opacity = 255) => '#333',
          color: () => '#22d3ee',
        }}
        bezier
      />
    </ScrollView>
  ) : (
    <Center>
      <Text textAlign="center">{t('noDataFromSelectedPeriod')}</Text>
    </Center>
  );
}

LineChartWrapper.propTypes = {
  monetaryNotation: PropTypes.string,
  selectedUnityTime: PropTypes.string,
  preFormattedData: PropTypes.array,
};
