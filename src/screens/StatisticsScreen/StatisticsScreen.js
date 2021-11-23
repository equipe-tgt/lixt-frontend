/* eslint-disable no-case-declarations */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import {
  Button,
  Text,
  HStack,
  Box,
  VStack,
  Icon,
  ScrollView,
  View,
  Center,
} from 'native-base';
import moment from 'moment';

import { screenBasicStyle as style } from '../../styles/style';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BarChartWrapper from '../../components/BarChartWrapper';
import LineChartWrapper from '../../components/LineChartWrapper';

import PeakCard from '../../components/PeakCard';

import { useTranslation, getI18n } from 'react-i18next';

import { UnityTimes, StatisticsType } from '../../utils/StatisticsUtils';
import PurchaseLocalTable from '../../components/PurchaseLocalTable';

export default function StatisticsScreen(props) {
  const { t } = useTranslation();

  const [dataFromServer, setdataFromServer] = useState(null);
  const [statisticsSettings, setStatisticsSettings] = useState({
    startDate: null,
    endDate: null,
    selectedUnityTime: UnityTimes.DAILY,
    statisticType: StatisticsType.TIME,
  });
  const [statisticsSettingsExtraParams, setStatisticsSettingsExtraParams] =
    useState({});

  const [statisticsName, setStatisticsName] = useState(
    t(statisticsSettings.statisticType)
  );

  useFocusEffect(() => {
    // Verifica se alguma tela enviou props para essa (a tela de config de estatísticas manda para cá)
    if (props.route?.params) {
      const { params } = props.route;

      if (
        params?.settings &&
        params?.dataFromServer &&
        params?.statisticsName
      ) {
        // Caso a tela anterior tenha passado settings
        setStatisticsSettings(params.settings);
        setdataFromServer(params.dataFromServer);
        setStatisticsName(params.statisticsName);
      }

      // Caso a tela tenha passado configurações extra de busca (categoria selecionada, id da lista, esse tipo de coisa que
      // sai do padrão do statisticsSettings)
      if (params?.extraParams) {
        setStatisticsSettingsExtraParams(params?.extraParams);
      }
    }
  });

  const renderDateInterval = () => {
    let intervalText;
    if (statisticsSettings.startDate && statisticsSettings.endDate) {
      intervalText = `${moment(statisticsSettings.startDate).format(
        'DD/MM/yyyy'
      )} ${t('until')} ${moment(statisticsSettings.endDate).format(
        'DD/MM/yyyy'
      )}`;
    } else {
      intervalText = t('noIntervalSelected');
    }

    return <Text>{intervalText}</Text>;
  };

  const renderChart = () => {
    switch (statisticsSettings.statisticType) {
      case StatisticsType.TIME:
      case StatisticsType.LIST:
        return (
          <BarChartWrapper
            selectedUnityTime={statisticsSettings.selectedUnityTime}
            monetaryNotation={t('currency')}
            preFormattedData={dataFromServer}
            translate={t}
          />
        );
      case StatisticsType.PRODUCT:
        return (
          <LineChartWrapper
            selectedUnityTime={UnityTimes.DAILY}
            preFormattedData={dataFromServer}
            monetaryNotation={t('currency')}
          />
        );
      case StatisticsType.CATEGORY:
        return (
          <LineChartWrapper
            monetaryNotation={t('currency')}
            preFormattedData={dataFromServer}
            selectedUnityTime={UnityTimes.MONTHLY}
          />
        );

      case StatisticsType.PURCHASE_LOCAL:
        return dataFromServer.length > 0 ? (
          <PurchaseLocalTable
            preFormattedData={dataFromServer}
            translate={t}
            monetaryNotation={t('currency')}
          />
        ) : (
          <Center>
            <Text textAlign="center">{t('noPurchaseLocalsFound')}</Text>
          </Center>
        );

      default:
        break;
    }
  };

  const formatDate = (data) => {
    const isPortuguese = getI18n().language === 'pt_BR';

    switch (statisticsSettings.selectedUnityTime) {
      case UnityTimes.DAILY:
        // O parâmetro "time" de dia vem como <dia>/<numero-mês>
        const preFormattedDate = moment(data.time, 'DD/MM');
        return moment(preFormattedDate).format(
          isPortuguese ? 'DD/MMM' : 'MMM/DD'
        );

      case UnityTimes.WEEKLY:
        const formatString = isPortuguese ? 'DD/MMM' : 'MMM/DD';

        // O parâmetro "time" de semana vem como <numero-da-semana>/<ano>
        const weekNumber = Number(data.time.slice(0, 2));
        const yearNumber = Number(data.time.slice(3));

        const startOfWeek = moment()
          .year(yearNumber)
          .week(weekNumber + 1)
          .day('Monday');

        const endOfWeek = moment(startOfWeek).add(6, 'days');

        return `${startOfWeek.format(formatString)} - ${endOfWeek.format(
          formatString
        )}`;

      case UnityTimes.MONTHLY:
        // O parâmetro "time" de mês vem como <numero-mês>/<ano> e queremos como <abreviação-nome-mês>/<ano>
        return moment(data.time, 'MM/yyyy').format('MMM/yyyy');

      default:
        return moment(data.date).format(
          isPortuguese ? 'DD/MM/yyyy' : 'MM/DD/yyyy'
        );
    }
  };
  const renderPeaksAndTotal = () => {
    if (
      statisticsSettings.statisticType !== StatisticsType.PURCHASE_LOCAL &&
      dataFromServer.length > 0
    ) {
      const ascOrderedData = dataFromServer.sort((a, b) => a.price > b.price);

      const totalAmount = dataFromServer.reduce((acc, currentData) => {
        return (acc += currentData.price);
      }, 0);

      return (
        <VStack>
          <Text
            textAlign="center"
            textTransform="uppercase"
            style={{ letterSpacing: 4 }}
          >
            {t('total')}
          </Text>
          <Text textAlign="center">{`${t('currency')} ${totalAmount}`}</Text>

          <HStack justifyContent="space-between" my={2}>
            <PeakCard
              label={t('lowestPoint')}
              date={formatDate(ascOrderedData[0])}
              price={`${t('currency')} ${ascOrderedData[0].price || 0}`}
              isUp={false}
            />
            <PeakCard
              label={t('highestPoint')}
              date={formatDate(ascOrderedData[ascOrderedData.length - 1])}
              price={`${t('currency')} ${
                ascOrderedData[ascOrderedData.length - 1].price || 0
              }`}
              isUp={true}
            />
          </HStack>
        </VStack>
      );
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView>
        <View width="90%" mx="auto">
          <VStack mb={5}>
            <Box>
              <HStack mx="auto" alignItems="center" maxWidth="80%">
                <VStack mb={2}>
                  <Text fontSize="sm" textAlign="center">
                    {t('chosenStatistics')}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" textAlign="center">
                    {statisticsName}
                  </Text>
                </VStack>

                <Button
                  variant="ghost"
                  onPress={() =>
                    props.navigation.navigate('StatisticsSettings', {
                      settings: statisticsSettings,
                      extraParams: statisticsSettingsExtraParams,
                    })
                  }
                  startIcon={
                    <Icon
                      size="sm"
                      as={<Ionicons name="settings" />}
                      color="light.600"
                    />
                  }
                />
              </HStack>

              {/*  Caso o tipo de estatísticas seja uma relacionada com datas (qualquer uma que não seja a PURCHASE_LOCAL)
            e não houver um intervalo de datas selecionado, mostra uma mensagem indicando isso e um botão
          */}
              {statisticsSettings.statisticType !==
                StatisticsType.PURCHASE_LOCAL &&
              !statisticsSettings.startDate &&
              !statisticsSettings.endDate ? (
                <Box mt={3}>
                  <Text fontSize="sm" textAlign="center" mr={5}>
                    {renderDateInterval()}
                  </Text>
                  <Button
                    mt={2}
                    size="sm"
                    onPress={() =>
                      props.navigation.navigate('StatisticsSettings', {
                        settings: statisticsSettings,
                        extraParams: statisticsSettingsExtraParams,
                      })
                    }
                  >
                    {t('selectOne')}
                  </Button>
                </Box>
              ) : null}

              {/*  Caso o tipo de estatísticas seja uma relacionada com datas (qualquer uma que não seja a PURCHASE_LOCAL)
            e tenha o intervalo de datas
          */}
              {statisticsSettings.statisticType !==
                StatisticsType.PURCHASE_LOCAL &&
              statisticsSettings.startDate &&
              statisticsSettings.endDate ? (
                <Box>
                  <Text fontSize="sm" textAlign="center" mr={5}>
                    {renderDateInterval()}
                  </Text>
                </Box>
              ) : null}
            </Box>
          </VStack>

          {/* Mostra o gráfico caso tenha dados do servidor e datas configuradas (para os casos de CATEGORY, TIME, PRODUCT e LIST)
           ou caso o tipo de estatística selecionada seja PURCHASE_LOCAL (ela não tem data pra configurar e o
            componente sabe lidar com a ausência de dados)
           */}
          {dataFromServer &&
            statisticsSettings.startDate &&
            statisticsSettings.endDate &&
            statisticsSettings.statisticType !==
              StatisticsType.PURCHASE_LOCAL &&
            renderChart()}

          {statisticsSettings.statisticType === StatisticsType.PURCHASE_LOCAL &&
            renderChart()}

          {dataFromServer &&
            statisticsSettings.startDate &&
            statisticsSettings.endDate &&
            statisticsSettings.statisticType !==
              StatisticsType.PURCHASE_LOCAL &&
            renderPeaksAndTotal()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

StatisticsScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
