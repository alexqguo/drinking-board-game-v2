import { v4 } from 'uuid';
import { AppStage } from 'src/types';

export const getAppStage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (window.location.hostname === 'localhost' || urlParams.has('debug')) return AppStage.dev;

  return AppStage.prod;
}

export const isDevMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return window.location.hostname === 'localhost' || urlParams.has('debug');
}

export const createId = (prefix: string) => {
  if (!prefix) throw new Error('Must pass a prefix');
  prefix = isDevMode() ? `${prefix}-dev` : prefix;
  return `${prefix}-${v4()}`
}