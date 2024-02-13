import {
  PointsLadder,
  PointsLadderDisplayMap,
  AllowedHans,
  AllowedFus,
  PointsMapKey,
  RonPointsDealer,
  RonPointsNonDealer,
  TsumoPointsDealer,
  TsumoPointsNonDealer,
  Han,
  Fu
} from './game_constants.ts'
import {Ruleset} from './rulesets.ts'
import {PlayerId, Players} from './players.ts'
import {GameStage} from './game_stage.ts'

export const HandOutcomeEnum = Object.freeze({
  TSUMO: 'tsumo',
  RON: 'ron',
  DRAW: 'draw'
})

export const HandOutcomeEnumDisplayTextMap = Object.freeze({
  [HandOutcomeEnum.DRAW]: '流局',
  [HandOutcomeEnum.TSUMO]: '自摸',
  [HandOutcomeEnum.RON]: '荣和'
})

export type PointsDelta = Record<PlayerId, number>;

export type HandResults = {
  outcome: string,
  riichi: Array<PlayerId>,
  tenpai: Array<PlayerId>,
  winner: PlayerId | undefined,
  deal_in: PlayerId | undefined,
  han: number | string | undefined,
  fu: number | undefined,
};

export function GetPointMapKey(han: Han, fu: Fu, ruleset: Ruleset): PointsMapKey {
  if (PointsLadder.hasOwnProperty(han)) {
    return han
  }
  if (han < 3) {
    return [han, fu]
  } else if (han == 3) {
    if (fu >= 70) {
      return PointsLadder.MANGAN
    } else if (fu == 60 && ruleset.round_up_mangan) {
      return PointsLadder.MANGAN
    } else {
      return [han, fu]
    }
  } else if (han == 4) {
    if (fu >= 40) {
      return PointsLadder.MANGAN
    } else if (fu == 30 && ruleset.round_up_mangan) {
      return PointsLadder.MANGAN
    } else {
      return [han, fu]
    }
  } else if (han == 5) {
    return PointsLadder.MANGAN
  } else if (han < 8) {
    return PointsLadder.HANEMAN
  } else if (han < 11) {
    return PointsLadder.BAIMAN
  } else if (han == 13) {
    return PointsLadder.SANBAIMAN
  } else {
    return PointsLadder.YAKUMAN
  }
};

export function ResolvePointsDeltaOnTsumo(stage: GameStage, hand_results: HandResults, ruleset: Ruleset, players: Players) : PointsDelta { 
  const winner_id: PlayerId = hand_results.winner;
  const han:Han  = hand_results.han;
  const fu:Fu = hand_results.fu;
  const num_players: number = players.NumPlayers();
  const key: PointsMapKey = GetPointMapKey(han, fu, ruleset);

  let points_delta:PointsDelta = {}
  if (players.GetPlayer(winner_id).IsDealer()) {
    const delta:number =
      TsumoPointsDealer[key] + (stage.honba * ruleset.honba_points) / (num_players - 1)
    for (const [player_id, player] of Object.entries(players.GetPlayerMap())) {
      if (player_id == winner_id) {
        points_delta[player_id] = 3 * delta + stage.riichi_sticks * ruleset.riichi_cost
      } else {
        points_delta[player_id] = -delta
      }
    }
  } else {
    const [raw_non_dealer_delta, raw_dealer_delta] = TsumoPointsNonDealer[key]
    const non_dealer_delta =
      -raw_non_dealer_delta - (stage.honba * ruleset.honba_points) / (num_players - 1)
    const dealer_delta =
      -raw_dealer_delta - (stage.honba * ruleset.honba_points) / (num_players - 1)
    const winner_delta =
      -non_dealer_delta * (num_players - 2) -
      dealer_delta +
      stage.riichi_sticks * ruleset.riichi_cost

    for (const [player_id, player] of Object.entries(players.GetPlayerMap())) {
      if (player_id == winner_id) {
        points_delta[player_id] = winner_delta
      } else if (player.IsDealer()) {
        points_delta[player_id] = dealer_delta
      } else {
        points_delta[player_id] = non_dealer_delta
      }
    }
  }
  return points_delta
};
