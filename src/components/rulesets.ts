import { Winds } from './seat_constants.js'

interface RulesetInterface {
  starting_points: number,
  honba_points: number,
  round_up_mangan: boolean,
  head_bump: boolean,
  draw_tenpai_points: number,
  riichi_cost: number,
  last_round_wind: string,
  dealer_tenpai_renchan: boolean,
  all_last_dealer_win_renchan: boolean,
  all_last_dealer_tenpai_renchan: boolean,
};

export const MLeagueRuleset : RulesetInterface = Object.freeze({
  starting_points: 25000,
  honba_points: 300,
  round_up_mangan: true,
  head_bump: true,
  draw_tenpai_points: 3000,
  riichi_cost: 1000,
  last_round_wind: Winds.SOUTH,
  dealer_tenpai_renchan: true,
  all_last_dealer_win_renchan: true,
  all_last_dealer_tenpai_renchan: true
});
