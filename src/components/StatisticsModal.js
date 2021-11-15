import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Box,
  Select,
  Text,
  VStack,
  Center,
  HStack,
} from 'native-base';

import DatePicker from './DatePicker';
import StatisticsDateInput from './StatisticsDateInput';
import { UnityTimes, StatisticsType } from '../utils/StatisticsUtils';

export default function StatisticsModal({
  isConfigOpen,
  setIsConfigOpen,
  setSelectedStatisticsType,
  selectedStatisticsType,
  selectedUnityTime,
  setSelectedUnityTime,
  setDateConfig,
  getStatisticsData,
  renderDateInterval,
  dateConfig,
  translate,
  currentParameter,
  setCurrentParameter,
  handleDateChange,
  isSelectorOpen,
  setIsSelectorOpen,
  selectedList,
  setSelectedList,
  lists,
  loading,
}) {
  const resetValues = () => {
    setSelectedList(null);
    setDateConfig({ startDate: null, endDate: null });
    setCurrentParameter(null);
  };

  return (
    <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{translate('settings')}</Modal.Header>
        <Modal.Body>
          {/* Seletor de tipo de estatísticas */}
          <Text fontSize={18} bold marginBottom={2}>
            {translate('selectAnalysisType')}
          </Text>
          <Select
            onValueChange={(type) => {
              setSelectedStatisticsType(type);
              resetValues();
            }}
            selectedValue={selectedStatisticsType}
          >
            {Object.keys(StatisticsType).map((tipo, index) => (
              <Select.Item
                disabled={
                  StatisticsType[tipo] === StatisticsType.LIST &&
                  (!lists || lists?.length === 0)
                }
                value={StatisticsType[tipo]}
                label={translate(StatisticsType[tipo])}
                key={index}
              />
            ))}
          </Select>

          {/* Se o tipo de busca de estatísticas for o gastos por tempo ou gastos por lista */}
          {(selectedStatisticsType === StatisticsType.TIME ||
            selectedStatisticsType === StatisticsType.LIST) && (
            <Box>
              {/* Seletor de tipo de período de análise */}
              <VStack>
                <Text fontSize={18} bold mb={2} mt={4}>
                  {translate('selectPeriodOfAnalysis')}
                </Text>
                <Select
                  onValueChange={(val) => {
                    setSelectedUnityTime(val);
                    setDateConfig({ startDate: null, endDate: null });
                  }}
                  selectedValue={selectedUnityTime}
                >
                  {Object.keys(UnityTimes)
                    .filter(
                      (unityTime) =>
                        UnityTimes[unityTime] !== UnityTimes.DEFAULT
                    )
                    .map((unityTime, index) => (
                      <Select.Item
                        value={UnityTimes[unityTime]}
                        label={translate(unityTime)}
                        key={index}
                      />
                    ))}
                </Select>
              </VStack>

              {/* Seletor de tipo de lista - caso o tipo de estatística buscada seja o tipo lista */}
              {selectedStatisticsType === StatisticsType.LIST && (
                <VStack>
                  <Text fontSize={18} bold mb={2} mt={4}>
                    {translate('selectList')}
                  </Text>
                  <Select
                    selectedValue={selectedList}
                    onValueChange={setSelectedList}
                  >
                    {lists.map((list) => (
                      <Select.Item
                        value={list.id}
                        label={list.nameList}
                        key={list.id}
                      />
                    ))}
                  </Select>
                </VStack>
              )}

              {/* Seletor de datas */}
              <VStack mt={2}>
                <Text fontSize={18} bold marginBottom={2}>
                  {translate('selectDates')}
                </Text>
                <StatisticsDateInput
                  getDateInterval={renderDateInterval}
                  dateConfig={dateConfig}
                  setDateConfig={setDateConfig}
                  setIsSelectorOpen={setIsSelectorOpen}
                  translate={translate}
                  setCurrentParameter={setCurrentParameter}
                  selectedUnityTime={selectedUnityTime}
                  selectedStatisticsType={selectedStatisticsType}
                  currentParameter={currentParameter}
                />
              </VStack>
            </Box>
          )}

          {/* DateInput para o caso da estatística selecionada ser PRODUCT ou CATEGORY */}
          {selectedStatisticsType === StatisticsType.PRODUCT ||
          selectedStatisticsType === StatisticsType.CATEGORY ? (
            <Box>
              <VStack mt={2}>
                <Text fontSize={18} bold marginBottom={2}>
                  {translate('selectDates')}
                </Text>
                <StatisticsDateInput
                  getDateInterval={renderDateInterval}
                  dateConfig={dateConfig}
                  setDateConfig={setDateConfig}
                  setIsSelectorOpen={setIsSelectorOpen}
                  translate={translate}
                  setCurrentParameter={setCurrentParameter}
                  selectedUnityTime={selectedUnityTime}
                  selectedStatisticsType={selectedStatisticsType}
                  currentParameter={currentParameter}
                />
              </VStack>
            </Box>
          ) : null}

          {/* DatePicker, exibido caso o isSelector seja true */}
          <Center>
            <HStack>
              {isSelectorOpen && (
                <DatePicker
                  isSelectorOpen={isSelectorOpen}
                  setIsSelectorOpen={setIsSelectorOpen}
                  handleDateChange={handleDateChange}
                  currentParameter={currentParameter}
                  setCurrentParameter={setCurrentParameter}
                  selectedUnityTime={selectedUnityTime}
                  dateConfig={dateConfig}
                  translate={translate}
                />
              )}
            </HStack>
          </Center>
        </Modal.Body>
        <Modal.Footer justifyContent="space-between">
          <Button onPress={() => setIsConfigOpen(false)} variant="link">
            {translate('cancel')}
          </Button>
          <Button onPress={getStatisticsData} isLoading={loading}>
            {translate('search')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

StatisticsModal.propTypes = {
  isConfigOpen: PropTypes.bool,
  setIsConfigOpen: PropTypes.func,
  setSelectedStatisticsType: PropTypes.func,
  selectedStatisticsType: PropTypes.string,
  selectedUnityTime: PropTypes.string,
  setSelectedUnityTime: PropTypes.func,
  setDateConfig: PropTypes.func,
  getStatisticsData: PropTypes.func,
  renderDateInterval: PropTypes.func,
  translate: PropTypes.func,
  dateConfig: PropTypes.object,
  currentParameter: PropTypes.number,
  setCurrentParameter: PropTypes.func,
  handleDateChange: PropTypes.func,
  isSelectorOpen: PropTypes.bool,
  setIsSelectorOpen: PropTypes.func,
  selectedList: PropTypes.number,
  setSelectedList: PropTypes.func,
  lists: PropTypes.array,
  loading: PropTypes.bool,
};
