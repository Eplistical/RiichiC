import { Winds } from './seat_constants.ts'
import { Lang } from './app_constants'

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

export const RulesetName: Record<string, Record<string, string>> = Object.freeze({
  M_LEAGUE: {
    [Lang.CN]: 'M-League',
    [Lang.EN]: 'M-League'
  },
  PHI_LEAGUE: {
    [Lang.CN]: 'PhiLeague',
    [Lang.EN]: 'PhiLeague'
  },
  CUSTOM: {
    [Lang.CN]: '自定义',
    [Lang.EN]: 'Custom'
  }
})

export type Ruleset = {
  id: string
  language: string
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
  chombo_penalty: number
}

export const MLeagueRuleset: Ruleset = Object.freeze({
  id: 'M_LEAGUE',
  language: Lang.CN,
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
  left_over_riichi_sticks: LeftOverRiichiSticks.SPLIT_AMONG_TOP_PLAYERS,
  chombo_penalty: 20.0
})

export const PhiLeagueRuleset: Ruleset = Object.freeze({
  id: 'PHI_LEAGUE',
  language: Lang.EN,
  num_players: 4,
  starting_points: 30000,
  honba_points: 300,
  round_up_mangan: true,
  head_bump: false,
  draw_tenpai_points: 3000,
  riichi_cost: 1000,
  last_round_wind: Winds.SOUTH,
  dealer_tenpai_renchan: true,
  all_last_dealer_win_renchan: true,
  all_last_dealer_tenpai_renchan: true,
  left_over_riichi_sticks: LeftOverRiichiSticks.ABANDONED,
  chombo_penalty: 20.0
})

export const FixedRulesetMap: Record<string, Ruleset> = Object.freeze({
  M_LEAGUE: MLeagueRuleset,
  PHI_LEAGUE: PhiLeagueRuleset
})

export const UploadableRulesets = new Set<string>(['M_LEAGUE', 'PHI_LEAGUE'])

export function IsCustomizable(ruleset_id: string) {
  return !Object.keys(FixedRulesetMap).includes(ruleset_id)
}

export function RulesetsAreEqual(rule1, rule2) {
  if (Object.keys(rule1).length != Object.keys(rule2).length) {
    console.log(
      'RulesetsAreEqual sees different lengths: ',
      Object.keys(rule1).length,
      Object.keys(rule2).length
    )
    return false
  }
  for (const key of Object.keys(rule1)) {
    if (key == 'language') {
      continue
    }
    if (!(key in rule2) || rule2[key] != rule1[key]) {
      console.log('Ruleset Difference Found: ', key, rule1[key], rule2[key])
      return false
    }
  }
  return true
}

export function AssignRuleset(target: Ruleset, id: string) {
  if (!Object.keys(FixedRulesetMap).includes(id)) {
    target.id = id
    return
  }
  const ruleset = FixedRulesetMap[id]
  for (const key of Object.keys(ruleset)) {
    if (key == 'language') {
      continue
    }
    target[key] = ruleset[key]
  }
  return true
}
