export const PointsLadder = Object.freeze({
  MANGAN: 'MANGAN',
  HANEMAN: 'HANEMAN',
  BAIMAN: 'BAIMAN',
  SANBAIMAN: 'SANBAIMAN',
  YAKUMAN: 'YAKUMAN'
})

export const PointsLadderDisplayMap = Object.freeze({
  [PointsLadder.MANGAN]: '满贯',
  [PointsLadder.HANEMAN]: '跳满',
  [PointsLadder.BAIMAN]: '倍满',
  [PointsLadder.SANBAIMAN]: '三倍满',
  [PointsLadder.YAKUMAN]: '役满'
})

export type Han = number | string
export type Fu = number | undefined

export const AllowedHans: Han[] = ([1, 2, 3, 4] as Han[]).concat(Object.keys(PointsLadder))
export const AllowedFus: Record<Han, Array<Fu>> = Object.freeze({
  [1]: [30, 40, 50, 60, 70, 80, 90, 100, 110],
  [2]: [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110],
  [3]: [20, 25, 30, 40, 50, 60],
  [4]: [20, 25, 30]
})

export type PointsMapKey = string | [Han, Fu]

export const RonPointsNonDealer: Record<PointsMapKey, number> = Object.freeze({
  [[1, 30]]: 1000,
  [[1, 40]]: 1300,
  [[1, 50]]: 1600,
  [[1, 60]]: 2000,
  [[1, 70]]: 2300,
  [[1, 80]]: 2600,
  [[1, 90]]: 2900,
  [[1, 100]]: 3200,
  [[1, 110]]: 3600,

  [[2, 25]]: 1600,
  [[2, 30]]: 2000,
  [[2, 40]]: 2600,
  [[2, 50]]: 3200,
  [[2, 60]]: 3900,
  [[2, 70]]: 4500,
  [[2, 80]]: 5200,
  [[2, 90]]: 5800,
  [[2, 100]]: 6400,
  [[2, 110]]: 7100,

  [[3, 25]]: 3200,
  [[3, 30]]: 3900,
  [[3, 40]]: 5200,
  [[3, 50]]: 6400,
  [[3, 70]]: 8000,
  [[3, 80]]: 8000,
  [[3, 90]]: 8000,
  [[3, 100]]: 8000,
  [[3, 110]]: 8000,

  [[4, 25]]: 6400,
  [[4, 30]]: 7700,

  [PointsLadder.MANGAN]: 8000,
  [PointsLadder.HANEMAN]: 12000,
  [PointsLadder.BAIMAN]: 16000,
  [PointsLadder.SANBAIMAN]: 24000,
  [PointsLadder.YAKUMAN]: 32000
})

export const RonPointsDealer = Object.freeze({
  [[1, 30]]: 1500,
  [[1, 40]]: 2000,
  [[1, 50]]: 2400,
  [[1, 60]]: 2900,
  [[1, 70]]: 3400,
  [[1, 80]]: 3900,
  [[1, 90]]: 4400,
  [[1, 100]]: 4800,
  [[1, 110]]: 5300,

  [[2, 25]]: 2400,
  [[2, 30]]: 2900,
  [[2, 40]]: 3900,
  [[2, 50]]: 4800,
  [[2, 60]]: 5800,
  [[2, 70]]: 6800,
  [[2, 80]]: 7700,
  [[2, 90]]: 8700,
  [[2, 100]]: 9600,
  [[2, 110]]: 10600,

  [[3, 25]]: 4800,
  [[3, 30]]: 5800,
  [[3, 40]]: 7700,
  [[3, 50]]: 9600,
  [[3, 70]]: 11600,

  [[4, 25]]: 9600,
  [[4, 30]]: 11600,

  [PointsLadder.MANGAN]: 12000,
  [PointsLadder.HANEMAN]: 18000,
  [PointsLadder.BAIMAN]: 24000,
  [PointsLadder.SANBAIMAN]: 36000,
  [PointsLadder.YAKUMAN]: 48000
})

export const TsumoPointsNonDealer = Object.freeze({
  // [non dealer points, dealer points]
  [[1, 30]]: [300, 500],
  [[1, 40]]: [400, 700],
  [[1, 50]]: [400, 800],
  [[1, 60]]: [500, 1000],
  [[1, 70]]: [600, 1200],
  [[1, 80]]: [700, 1300],
  [[1, 90]]: [800, 1500],
  [[1, 100]]: [800, 1600],
  [[1, 110]]: [900, 1800],

  [[2, 20]]: [400, 700],
  [[2, 30]]: [500, 1000],
  [[2, 40]]: [700, 1300],
  [[2, 50]]: [800, 1600],
  [[2, 60]]: [1000, 2000],
  [[2, 70]]: [1200, 2300],
  [[2, 80]]: [1300, 2600],
  [[2, 90]]: [1500, 2900],
  [[2, 100]]: [1600, 3200],
  [[2, 110]]: [1800, 3600],

  [[3, 20]]: [700, 1300],
  [[3, 25]]: [800, 1600],
  [[3, 30]]: [1000, 2000],
  [[3, 40]]: [1300, 2600],
  [[3, 50]]: [1600, 3200],
  [[3, 70]]: [2000, 3900],

  [[4, 20]]: [1300, 2600],
  [[4, 25]]: [1600, 3200],
  [[4, 30]]: [2000, 3900],

  [PointsLadder.MANGAN]: [2000, 4000],
  [PointsLadder.HANEMAN]: [3000, 6000],
  [PointsLadder.BAIMAN]: [4000, 8000],
  [PointsLadder.SANBAIMAN]: [6000, 12000],
  [PointsLadder.YAKUMAN]: [8000, 16000]
})

export const TsumoPointsDealer = Object.freeze({
  // => points all
  [[1, 30]]: 500,
  [[1, 40]]: 700,
  [[1, 50]]: 800,
  [[1, 60]]: 1000,
  [[1, 70]]: 1200,
  [[1, 80]]: 1300,
  [[1, 90]]: 1500,
  [[1, 100]]: 1600,
  [[1, 110]]: 1800,

  [[2, 20]]: 700,
  [[2, 30]]: 1000,
  [[2, 40]]: 1300,
  [[2, 50]]: 1600,
  [[2, 60]]: 2000,
  [[2, 70]]: 2300,
  [[2, 80]]: 2600,
  [[2, 90]]: 2900,
  [[2, 100]]: 3200,
  [[2, 110]]: 3600,

  [[3, 20]]: 1300,
  [[3, 25]]: 1600,
  [[3, 30]]: 2000,
  [[3, 40]]: 2600,
  [[3, 50]]: 3200,
  [[3, 70]]: 3900,

  [[4, 20]]: 2600,
  [[4, 25]]: 3200,
  [[4, 30]]: 3900,

  [PointsLadder.MANGAN]: 4000,
  [PointsLadder.HANEMAN]: 6000,
  [PointsLadder.BAIMAN]: 8000,
  [PointsLadder.SANBAIMAN]: 12000,
  [PointsLadder.YAKUMAN]: 16000
})
