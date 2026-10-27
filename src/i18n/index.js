import Vue from 'vue';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import api from '../shared/api.json';

Vue.use(VueI18n);

async function getDefaultLanguage() {
  try {
    let url = `${api.BASE_URL}/${api.URL_CONFIG_PROPERTY}/public/general/default.locale`;
    let response = await axios.get(url);
    const value = response.data.propertyValue;
    return typeof value === 'string' ? decodeURIComponent(value).trim() : '';
  } catch (error) {
    console.error('Error fetching default language:', error);
    return '';
  }
}

function loadLocaleMessages() {
  const locales = require.context(
    './locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i,
  );
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

const localeMessages = loadLocaleMessages();

function matchLocale(requestedLocale) {
  let exactMatch = Object.keys(localeMessages).find(
    (locale) => requestedLocale === locale,
  );
  if (exactMatch) {
    return exactMatch;
  }

  let localeParts = requestedLocale.split('-');
  if (localeParts.length !== 2) {
    return 'en';
  }

  let baseLocale = localeParts[0];
  let baseLocaleMatch = Object.keys(localeMessages).find(
    (locale) => baseLocale === locale,
  );
  if (baseLocaleMatch) {
    return baseLocaleMatch;
  }

  return 'en';
}

const preferredLocale = (localStorage && localStorage.getItem('Locale')) || '';
const deploymentLocale = process.env.VUE_APP_I18N_LOCALE || 'zh';

const i18n = new VueI18n({
  locale: matchLocale(preferredLocale || deploymentLocale),
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: localeMessages,
});
document.documentElement.lang = i18n.locale;

getDefaultLanguage().then((defaultLanguage) => {
  const matchedLocale = matchLocale(
    preferredLocale || defaultLanguage || deploymentLocale,
  );
  i18n.locale = matchedLocale;
  document.documentElement.lang = matchedLocale;
});

export default i18n;
