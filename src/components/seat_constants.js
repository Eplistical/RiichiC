export const Winds = Object.freeze({
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  NORTH: 'north'
})

export const NextWindMap = Object.freeze({
  [Winds.EAST]: Winds.SOUTH,
  [Winds.SOUTH]: Winds.WEST,
  [Winds.WEST]: Winds.NORTH,
  [Winds.NORTH]: Winds.EAST
})

export const LastWindMap = Object.freeze({
  [Winds.EAST]: Winds.NORTH,
  [Winds.SOUTH]: Winds.EAST,
  [Winds.WEST]: Winds.SOUTH,
  [Winds.NORTH]: Winds.WEST
})

export const WindsDisplayTextMap = Object.freeze({
  wind_character: {
    [Winds.EAST]: '东',
    [Winds.SOUTH]: '南',
    [Winds.WEST]: '西',
    [Winds.NORTH]: '北'
  }
})