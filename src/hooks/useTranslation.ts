import { useSettings } from './useSettings';
import { translations } from '../i18n/translations';

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;
type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

type TranslationType = typeof translations.tr;

export function useTranslation() {
  const { settings } = useSettings();

  const t = <P extends Path<TranslationType>>(
    key: P,
    params?: Record<string, string | number>
  ): string => {
    const keys = key.split('.');
    let value: any = translations[settings.language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key as string;
    }

    if (typeof value === 'string' && params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue.toString());
      }, value);
    }

    return value as string || key as string;
  };

  return { t };
} 