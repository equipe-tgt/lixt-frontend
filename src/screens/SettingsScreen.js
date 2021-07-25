import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { FormControl, Center, Box, Select } from 'native-base';
import { screenBasicStyle as style } from '../styles/style';
import { useTranslation } from 'react-i18next';

import { setLanguageApp, getLanguageApp } from '../services/LanguageService';
import i18n from '../config/i18n/locales/index';

export default function SettingsScreen() {
  const { t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageApp(lng);
    setLanguage(lng);
  };

  const [language, setLanguage] = useState(getLanguageApp());

  return (
    <SafeAreaView style={style.container}>
      <Center>
        <Box mt={5} width="90%" mx="auto">
          <FormControl.Label alignSelf="flex-start">
            {t('alterLanguage')}
          </FormControl.Label>

          <FormControl>
            <Select
              selectedValue={language}
              onValueChange={(value) => changeLanguage(value)}
            >
              <Select.Item label={t('portuguese')} value="pt_BR" />
              <Select.Item label={t('english')} value="en_US" />
            </Select>
          </FormControl>
        </Box>
      </Center>
    </SafeAreaView>
  );
}
