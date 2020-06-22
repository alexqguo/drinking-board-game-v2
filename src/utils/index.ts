import { v4 } from 'uuid';
import { AppStage, Point } from 'src/types';

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

export const sumNumbers = (nums: number[]): number => (
  nums.reduce((acc: number, cur: number) => acc + cur)
);

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const getCenterPoint = (points: Point[]): Point => {
  const total: Point = points.reduce((prev: Point, cur: Point) => {
    return {x: prev.x + cur.x, y: prev.y + cur.y};
  }, {x: 0, y: 0});
  total.x /= points.length;
  total.y /= points.length;

  return total;
}