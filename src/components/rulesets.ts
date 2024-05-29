import { Winds } from './seat_constants.ts'

export enum LeftOverRiichiSticks {
  // nobody gets left-over riichi sticks
  ABANDONED,

  // left-over riichi sticks go to player(s) whose rank is 1
  // when there is 1 top player -> the player gets all leftover
  // when there are 2 top players -> each player gets 50% of sticks
  // when there are 3 top players, and the leftover cannot be divided by 3 -> the player with first starting wind gets 40%, other two players gets 30%
  // when there are 4 top players -> each player gets 25% of sticks
  SPLIT_AMONG_TOP_PLAYERS
}

export type Ruleset = {
  num_players: 3 | 4
  starting_points: number
  honba_points: number
  round_up_mangan: boolean
  head_bump: boolean
  draw_tenpai_points: number
  riichi_cost: number
  last_round_wind: string
  dealer_tenpai_renchan: boolean
  all_last_dealer_win_renchan: boolean
  all_last_dealer_tenpai_renchan: boolean
  left_over_riichi_sticks: LeftOverRiichiSticks
}

export const MLeagueRuleset: Ruleset = Object.freeze({
  num_players: 4,
  starting_points: 25000,
  honba_points: 300,
  round_up_mangan: true,
  head_bump: true,
  draw_tenpai_points: 3000,
  riichi_cost: 1000,
  last_round_wind: Winds.SOUTH,
  dealer_tenpai_renchan: true,
  all_last_dealer_win_renchan: true,
  all_last_dealer_tenpai_renchan: true,
  left_over_riichi_sticks: LeftOverRiichiSticks.SPLIT_AMONG_TOP_PLAYERS
})

export function RulesetsAreEqual(rule1, rule2) {
  if (Object.keys(rule1).length != Object.keys(rule2).length) {
    console.log('!!! ', Object.keys(rule1).length, Object.keys(rule2).length)
    return false
  }
  for (const key of Object.keys(rule1)) {
    if (!(key in rule2) || rule2[key] != rule1[key]) {
      console.log('!!! ', key, rule1[key], rule2[key])
      return false
    }
  }
  return true
}
