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
  [Winds.EAST]: '東',
  [Winds.SOUTH]: '南',
  [Winds.WEST]: '西',
  [Winds.NORTH]: '北'
})
