import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Box,
  Select,
  Text,
  VStack,
  ScrollView,
  Center,
  HStack,
  Spinner,
  Icon,
  Input,
  List,
} from 'native-base';

import DatePicker from './DatePicker';
import StatisticsDateInput from './StatisticsDateInput';
import { UnityTimes, StatisticsType } from '../utils/StatisticsUtils';
import { AntDesign } from '@expo/vector-icons';

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
  categories,
  setSelectedCategory,
  selectedCategory,
  loadingCategories,
  loading,
  searchProducts,
  products,
  setSelectedProduct,
  selectedProduct,
  setProducts,
  loadingProducts,
}) {
  const resetValues = () => {
    setSelectedList(null);
    setDateConfig({ startDate: null, endDate: null });
    setCurrentParameter(null);
    setProducts([]);
    setSelectedProduct({ id: null, name: '' });
    setSelectedCategory(null);
  };

  const [showMoreFilters, setShowMoreFilters] = useState(false);

  return (
    <Modal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{translate('settings')}</Modal.Header>
        <Modal.Body>
          <ScrollView>
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

            {/* Caso seja do tipo produto */}
            {selectedStatisticsType === StatisticsType.PRODUCT && (
              <Box>
                {/* Input do nome do produto */}
                <VStack>
                  <Text fontSize={18} bold my={4}>
                    {translate('productName')}
                  </Text>

                  <HStack>
                    <Input
                      width={loadingProducts ? '90%' : '100%'}
                      type="text"
                      value={selectedProduct}
                      onChangeText={searchProducts}
                    />

                    {loadingProducts && <Spinner size="sm" />}
                  </HStack>

                  {/* Produtos encontrados */}
                  {products && products?.length > 0 ? (
                    <List
                      borderBottomRadius={3}
                      borderTopColor="transparent"
                      space="md"
                    >
                      <ScrollView keyboardShouldPersistTaps="always">
                        {products?.map((product) => (
                          <List.Item
                            testID="products-found"
                            py={4}
                            key={product.id}
                            onPress={() => {
                              setSelectedProduct(product.name);
                              setProducts([]);
                            }}
                            _pressed={{ bg: 'primary.500' }}
                          >
                            {product.name}
                          </List.Item>
                        ))}
                      </ScrollView>
                    </List>
                  ) : null}
                </VStack>

                <VStack mt={2}>
                  <Text fontSize={18} bold marginBottom={2}>
                    {translate('selectDates')}
                  </Text>
                  {/* DateInput para o caso da estatística selecionada ser PRODUCT ou CATEGORY */}
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

                <VStack>
                  <Button
                    onPress={() => setShowMoreFilters(!showMoreFilters)}
                    mt={2}
                    size="sm"
                    variant="ghost"
                    colorScheme="blueGray"
                    startIcon={
                      <Icon size="sm" as={<AntDesign name="filter" />} />
                    }
                  >
                    {translate('moreFilters')}
                  </Button>

                  {showMoreFilters && (
                    <Box>
                      <Text>Sim, flores na janela, alguém vai casar</Text>
                      <Text>Sim, flores na janela, alguém vai casar</Text>
                      <Text>Sim, flores na janela, alguém vai casar</Text>
                      <Text>Sim, flores na janela, alguém vai casar</Text>
                      <Text>Sim, flores na janela, alguém vai casar</Text>
                      <Text>Sim, flores na janela, alguém vai casar</Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* Caso seja categoria */}
            {selectedStatisticsType === StatisticsType.CATEGORY && (
              <Box>
                <VStack>
                  <Text fontSize={18} bold mb={2} mt={4}>
                    {translate('selectCategory')}
                  </Text>
                  <HStack>
                    <Select
                      width={loadingCategories ? '90%' : '100%'}
                      isDisabled={loadingCategories}
                      selectedValue={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      {categories.map((category) => (
                        <Select.Item
                          value={category.id}
                          label={category.name}
                          key={category.id}
                        />
                      ))}
                    </Select>
                    {loadingCategories && (
                      <Spinner color="primary.400" size="sm" />
                    )}
                  </HStack>
                </VStack>

                <VStack mt={2}>
                  <Text fontSize={18} bold marginBottom={2}>
                    {translate('selectDates')}
                  </Text>
                  {/* DateInput para o caso da estatística selecionada ser PRODUCT ou CATEGORY */}
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
          </ScrollView>
        </Modal.Body>
        <Modal.Footer justifyContent="space-between">
          <Button onPress={() => setIsConfigOpen(false)} variant="link">
            {translate('cancel')}
          </Button>
          <Button
            onPress={getStatisticsData}
            isLoading={loading}
            isDisabled={!dateConfig.startDate || !dateConfig.endDate}
          >
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
  categories: PropTypes.array,
  setSelectedCategory: PropTypes.func,
  selectedCategory: PropTypes.number,
  loadingCategories: PropTypes.bool,
  searchProducts: PropTypes.func,
  products: PropTypes.array,
  selectedProduct: PropTypes.string,
  setSelectedProduct: PropTypes.func,
  setProducts: PropTypes.func,
  loadingProducts: PropTypes.bool,
};
