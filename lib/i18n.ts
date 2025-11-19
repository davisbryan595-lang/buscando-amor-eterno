export type Language = 'en' | 'es'

export const languages: Record<Language, string> = {
  en: 'English',
  es: 'Español',
}

export const defaultLanguage: Language = 'en'

export const getLanguageFromUrl = (pathname: string): Language => {
  const segments = pathname.split('/')
  const potentialLang = segments[1]
  
  if (potentialLang === 'es') {
    return 'es'
  }
  
  return defaultLanguage
}
