import { useLanguage } from '../context/LanguageContext';
// FIX: Corrected import paths for locale files
import en from '../locales/en';
import ru from '../locales/ru';
import tt from '../locales/tt';

const translations = { en, ru, tt };

export const useTranslations = () => {
  const { language } = useLanguage();
  return translations[language];
};