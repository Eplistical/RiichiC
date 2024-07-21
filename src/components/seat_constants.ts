import { Lang } from './app_constants'

export type WindType = string

export const Winds = Object.freeze({
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  NORTH: 'north'
})

export const WindsInOrder: Array<WindType> = [Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH]

export const NextWindMap: Record<WindType, WindType> = Object.freeze({
  [Winds.EAST]: Winds.SOUTH,
  [Winds.SOUTH]: Winds.WEST,
  [Winds.WEST]: Winds.NORTH,
  [Winds.NORTH]: Winds.EAST
})

export const LastWindMap: Record<WindType, WindType> = Object.freeze({
  [Winds.EAST]: Winds.NORTH,
  [Winds.SOUTH]: Winds.EAST,
  [Winds.WEST]: Winds.SOUTH,
  [Winds.NORTH]: Winds.WEST
})

export const WindsDisplayTextMap: Record<WindType, string> = Object.freeze({
  [Winds.EAST]: {
    [Lang.CN]: '東',
    [Lang.EN]: '東/E'
  },
  [Winds.SOUTH]: {
    [Lang.CN]: '南',
    [Lang.EN]: '南/S'
  },
  [Winds.WEST]: {
    [Lang.CN]: '西',
    [Lang.EN]: '西/W'
  },
  [Winds.NORTH]: {
    [Lang.CN]: '北',
    [Lang.EN]: '北/N'
  }
})
