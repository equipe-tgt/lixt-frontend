/* eslint-disable no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ScrollView, Center, Text } from 'native-base';
import { UnityTimes } from '../utils/StatisticsUtils';
import moment from 'moment';
import { getI18n, useTranslation } from 'react-i18next';

export default function BarChartWrapper({
  monetaryNotation,
  selectedUnityTime,
  preFormattedData,
}) {
  const { t } = useTranslation();

  const formatChartData = () => {
    const labels = [];
    const datasetsItem = {
      data: [],
    };
    let sortedData = [];

    const isPortuguese = getI18n().language === 'pt_BR';

    switch (selectedUnityTime) {
      case UnityTimes.DAILY:
        // Organiza o array por ordem crescente de data
        sortedData = preFormattedData.sort(
          (a, b) => moment(a.time, 'DD/MM') > moment(b.time, 'DD/MM')
        );

        for (const preData of sortedData) {
          // O parâmetro "time" de dia vem como <dia>/<numero-mês>
          const date = moment(preData.time, 'DD/MM');
          labels.push(moment(date).format(isPortuguese ? 'DD/MMM' : 'MMM/DD'));
          datasetsItem.data.push(preData.price);
        }
        break;

      case UnityTimes.WEEKLY:
        const formatString = isPortuguese ? 'DD/MMM' : 'MMM/DD';

        // Rearranja a resposta do servidor para que as semanas que vem como <numero-da-semana>/<ano> sejam
        // objetos de datas concretos
        const completeDatetimeArray = preFormattedData.map((item) => {
          // O parâmetro "time" de semana vem como <numero-da-semana>/<ano>
          const weekNumber = Number(item.time.slice(0, 2));
          const yearNumber = Number(item.time.slice(3));

          const startOfWeek = moment()
            .year(yearNumber)
            .week(weekNumber + 1)
            .day('Monday');

          const endOfWeek = moment(startOfWeek).add(6, 'days');

          const label = `${startOfWeek.format(
            formatString
          )} - ${endOfWeek.format(formatString)}`;

          return {
            label,
            startOfWeek,
            endOfWeek,
            price: item.price,
          };
        });
        sortedData = completeDatetimeArray.sort(
          (a, b) => moment(a.startOfWeek) > moment(b.startOfWeek)
        );

        sortedData.forEach((purchaseData) => {
          labels.push(purchaseData.label);
          datasetsItem.data.push(purchaseData.price);
        });

        break;

      case UnityTimes.MONTHLY:
        // Organiza o array por ordem crescente de data
        sortedData = preFormattedData.sort(
          (a, b) => moment(a.time, 'MM/yyyy') > moment(b.time, 'MM/yyyy')
        );
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

  return preFormattedData && preFormattedData?.length ? (
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
  ) : (
    <Center>
      <Text textAlign="center">{t('noDataFromSelectedPeriod')}</Text>
    </Center>
  );
}

BarChartWrapper.propTypes = {
  monetaryNotation: PropTypes.string,
  selectedUnityTime: PropTypes.string,
  preFormattedData: PropTypes.array,
};
