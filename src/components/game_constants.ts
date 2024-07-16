import { Lang } from './app_constants'

export const PointsLadder = Object.freeze({
  MANGAN: 'MANGAN',
  HANEMAN: 'HANEMAN',
  BAIMAN: 'BAIMAN',
  SANBAIMAN: 'SANBAIMAN',
  YAKUMAN: 'YAKUMAN',
  DOUBLE_YAKUMAN: 'DOUBLE_YAKUMAN',
  TRIPLE_YAKUMAN: 'TRIPLE_YAKUMAN'
})

export const PointsLadderDisplayMap = Object.freeze({
  [PointsLadder.MANGAN]: {
    [Lang.CN]: '满贯',
    [Lang.EN]: 'Mangan'
  },
  [PointsLadder.HANEMAN]: {
    [Lang.CN]: '跳满',
    [Lang.EN]: 'Haneman'
  },
  [PointsLadder.BAIMAN]: {
    [Lang.CN]: '倍满',
    [Lang.EN]: 'Baiman'
  },
  [PointsLadder.SANBAIMAN]: {
    [Lang.CN]: '三倍满',
    [Lang.EN]: 'Sanbaiman'
  },
  [PointsLadder.YAKUMAN]: {
    [Lang.CN]: '役满',
    [Lang.EN]: 'Yakuman'
  },
  [PointsLadder.DOUBLE_YAKUMAN]: {
    [Lang.CN]: '双倍役满',
    [Lang.EN]: 'Double Yakuman'
  },
  [PointsLadder.TRIPLE_YAKUMAN]: {
    [Lang.CN]: '三倍役满',
    [Lang.EN]: 'Triple Yakuman'
  }
})

export const PointsLadderBriefDisplayMap = Object.freeze({
  [PointsLadder.MANGAN]: {
    [Lang.CN]: '满',
    [Lang.EN]: 'MAN'
  },
  [PointsLadder.HANEMAN]: {
    [Lang.CN]: '跳',
    [Lang.EN]: 'HANE'
  },
  [PointsLadder.BAIMAN]: {
    [Lang.CN]: '倍',
    [Lang.EN]: 'BAI'
  },
  [PointsLadder.SANBAIMAN]: {
    [Lang.CN]: '三',
    [Lang.EN]: 'SAN'
  },
  [PointsLadder.YAKUMAN]: {
    [Lang.CN]: '役',
    [Lang.EN]: 'YAKU'
  },
  [PointsLadder.DOUBLE_YAKUMAN]: {
    [Lang.CN]: '双役',
    [Lang.EN]: '2*YAKU'
  },
  [PointsLadder.TRIPLE_YAKUMAN]: {
    [Lang.CN]: '三役',
    [Lang.EN]: '3*YAKU'
  }
})

export enum Actions {
  RIICHI,
  TENPAI,
  AGARI,
  DEAL_IN,
  TSUMO,
  RON,
  DRAW,
  CHOMBO
}

export const ActionDisplayMap = Object.freeze({
  [Actions.RIICHI]: {
    [Lang.CN]: '立直',
    [Lang.EN]: 'Riichi'
  },
  [Actions.TENPAI]: {
    [Lang.CN]: '听牌',
    [Lang.EN]: 'Tenpai'
  },
  [Actions.AGARI]: {
    [Lang.CN]: '和牌',
    [Lang.EN]: 'Agari'
  },
  [Actions.DEAL_IN]: {
    [Lang.CN]: '放铳',
    [Lang.EN]: 'Deal-in'
  },
  [Actions.TSUMO]: {
    [Lang.CN]: '自摸',
    [Lang.EN]: 'Tsumo'
  },
  [Actions.RON]: {
    [Lang.CN]: '荣和',
    [Lang.EN]: 'Ron'
  },
  [Actions.DRAW]: {
    [Lang.CN]: '流局',
    [Lang.EN]: 'Draw'
  },
  [Actions.CHOMBO]: {
    [Lang.CN]: '犯规',
    [Lang.EN]: 'Chombo'
  }
})

export const ActionBriefDisplayMap = Object.freeze({
  [Actions.RIICHI]: {
    [Lang.CN]: '立',
    [Lang.EN]: 'Riichi'
  },
  [Actions.TENPAI]: {
    [Lang.CN]: '听',
    [Lang.EN]: 'Tenpai'
  },
  [Actions.AGARI]: {
    [Lang.CN]: '和',
    [Lang.EN]: 'Agari'
  },
  [Actions.DEAL_IN]: {
    [Lang.CN]: '铳',
    [Lang.EN]: 'Dealin'
  },
  [Actions.TSUMO]: {
    [Lang.CN]: '摸',
    [Lang.EN]: 'Tsumo'
  },
  [Actions.RON]: {
    [Lang.CN]: '荣',
    [Lang.EN]: 'Ron'
  },
  [Actions.DRAW]: {
    [Lang.CN]: '流',
    [Lang.EN]: 'Draw'
  },
  [Actions.CHOMBO]: {
    [Lang.CN]: '罚',
    [Lang.EN]: 'Chombo'
  }
})

export const PlaceNumberDisplayMap = Object.freeze({
  [1]: {
    [Lang.CN]: '一',
    [Lang.EN]: '1st'
  },
  [2]: {
    [Lang.CN]: '二',
    [Lang.EN]: '2nd'
  },
  [3]: {
    [Lang.CN]: '三',
    [Lang.EN]: '3rd'
  },
  [4]: {
    [Lang.CN]: '四',
    [Lang.EN]: '4th'
  }
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
  [[3, 60]]: 7700,

  [[4, 25]]: 6400,
  [[4, 30]]: 7700,

  [PointsLadder.MANGAN]: 8000,
  [PointsLadder.HANEMAN]: 12000,
  [PointsLadder.BAIMAN]: 16000,
  [PointsLadder.SANBAIMAN]: 24000,
  [PointsLadder.YAKUMAN]: 32000,
  [PointsLadder.DOUBLE_YAKUMAN]: 64000,
  [PointsLadder.TRIPLE_YAKUMAN]: 96000
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
  [[3, 60]]: 11600,

  [[4, 25]]: 9600,
  [[4, 30]]: 11600,

  [PointsLadder.MANGAN]: 12000,
  [PointsLadder.HANEMAN]: 18000,
  [PointsLadder.BAIMAN]: 24000,
  [PointsLadder.SANBAIMAN]: 36000,
  [PointsLadder.YAKUMAN]: 48000,
  [PointsLadder.DOUBLE_YAKUMAN]: 96000,
  [PointsLadder.TRIPLE_YAKUMAN]: 144000
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
  [[3, 60]]: [2000, 3900],

  [[4, 20]]: [1300, 2600],
  [[4, 25]]: [1600, 3200],
  [[4, 30]]: [2000, 3900],

  [PointsLadder.MANGAN]: [2000, 4000],
  [PointsLadder.HANEMAN]: [3000, 6000],
  [PointsLadder.BAIMAN]: [4000, 8000],
  [PointsLadder.SANBAIMAN]: [6000, 12000],
  [PointsLadder.YAKUMAN]: [8000, 16000],
  [PointsLadder.DOUBLE_YAKUMAN]: [16000, 32000],
  [PointsLadder.TRIPLE_YAKUMAN]: [24000, 48000]
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
  [[3, 60]]: 3900,

  [[4, 20]]: 2600,
  [[4, 25]]: 3200,
  [[4, 30]]: 3900,

  [PointsLadder.MANGAN]: 4000,
  [PointsLadder.HANEMAN]: 6000,
  [PointsLadder.BAIMAN]: 8000,
  [PointsLadder.SANBAIMAN]: 12000,
  [PointsLadder.YAKUMAN]: 16000,
  [PointsLadder.DOUBLE_YAKUMAN]: 32000,
  [PointsLadder.TRIPLE_YAKUMAN]: 48000
})
