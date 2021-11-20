/* eslint-disable no-case-declarations */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native';
import { Button, Text, HStack, Box, VStack, Icon, View } from 'native-base';
import moment from 'moment';

import { screenBasicStyle as style } from '../../styles/style';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BarChartWrapper from '../../components/BarChartWrapper';
import LineChartWrapper from '../../components/LineChartWrapper';

import { useTranslation } from 'react-i18next';

import { UnityTimes, StatisticsType } from '../../utils/StatisticsUtils';

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
      console.log({ params });

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
      case StatisticsType.PURCHASE_LOCAL:
        return;
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

      default:
        break;
    }
  };

  return (
    <SafeAreaView style={style.container}>
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

        {dataFromServer &&
          statisticsSettings.startDate &&
          statisticsSettings.endDate &&
          renderChart()}
      </View>
    </SafeAreaView>
  );
}

StatisticsScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};
