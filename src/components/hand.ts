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
import { Ruleset } from './rulesets.ts'
import { Wind } from './seat_constants.ts'
import { PlayerId, Players } from './players.ts'

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

export type PointsDelta = Record<PlayerId, number>

export type HandResults = {
  outcome: string
  riichi: Array<PlayerId>
  tenpai: Array<PlayerId>
  winner: PlayerId | undefined
  deal_in: PlayerId | undefined
  han: number | string | undefined
  fu: number | undefined
}

export function GetPointMapKey(han: Han, fu: Fu, ruleset: Ruleset): PointsMapKey {
  if (typeof han == 'string') {
    if (PointsLadder.hasOwnProperty(han)) {
      return han
    }
  } else {
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
    } else if (han < 13) {
      return PointsLadder.SANBAIMAN
    } else {
      return PointsLadder.YAKUMAN
    }
  }
}

interface HandInterface {
  round_wind: Wind;
  hand: number;
  honba: number;
  riichi_sticks: number;
}

export class Hand {
  round_wind: Wind
  hand: number
  honba: number
  riichi_sticks: number

  constructor({round_wind, hand, honba, riichi_sticks} : HandInterface) {
    this.round_wind = round_wind
    this.hand = hand
    this.honba = honba
    this.riichi_sticks = riichi_sticks
  } 

  ResolvePointsDelta(
    hand_results: HandResults,
    ruleset: Ruleset,
    players: Players
  ): PointsDelta {
    if (hand_results.outcome === HandOutcomeEnum.DRAW) {
      return this.ResolvePointsDeltaOnDraw(hand_results, ruleset, players)
    } else if (hand_results.outcome === HandOutcomeEnum.TSUMO) {
      return this.ResolvePointsDeltaOnTsumo(hand_results, ruleset, players)
    } else if (hand_results.outcome === HandOutcomeEnum.RON) {
      return this.ResolvePointsDeltaOnRon(hand_results, ruleset, players)
    } else {
      alert(`错误对局结果: ${JSON.stringify(hand_results.outcome)}`)
    }
  }

  private GetPointMapKey(han: Han, fu: Fu, ruleset: Ruleset): PointsMapKey {
    if (typeof han == 'string') {
      if (PointsLadder.hasOwnProperty(han)) {
        return han
      }
    } else {
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
      } else if (han < 13) {
        return PointsLadder.SANBAIMAN
      } else {
        return PointsLadder.YAKUMAN
      }
    }
  }

  private ResolvePointsDeltaOnTsumo(
    hand_results: HandResults,
    ruleset: Ruleset,
    players: Players
  ): PointsDelta {
    const winner_id: PlayerId = hand_results.winner
    const han: Han = hand_results.han
    const fu: Fu = hand_results.fu
    const num_players: number = players.NumPlayers()
    const key: PointsMapKey = this.GetPointMapKey(han, fu, ruleset)

    let points_delta: PointsDelta = {}
    if (players.GetPlayer(winner_id).IsDealer()) {
      const delta: number =
        TsumoPointsDealer[key] + (this.honba * ruleset.honba_points) / (num_players - 1)
      for (const [player_id, player] of Object.entries(players.GetPlayerMap())) {
        if (player_id == winner_id) {
          points_delta[player_id] = 3 * delta + this.riichi_sticks * ruleset.riichi_cost
        } else {
          points_delta[player_id] = -delta
        }
      }
    } else {
      const [raw_non_dealer_delta, raw_dealer_delta] = TsumoPointsNonDealer[key]
      const non_dealer_delta =
        -raw_non_dealer_delta - (this.honba * ruleset.honba_points) / (num_players - 1)
      const dealer_delta =
        -raw_dealer_delta - (this.honba * ruleset.honba_points) / (num_players - 1)
      const winner_delta =
        -non_dealer_delta * (num_players - 2) -
        dealer_delta +
        this.riichi_sticks * ruleset.riichi_cost

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
  }

  private ResolvePointsDeltaOnRon(
    hand_results: HandResults,
    ruleset: Ruleset,
    players: Players
  ): PointsDelta {
    const winner_id: PlayerId = hand_results.winner
    const deal_in_id: PlayerId = hand_results.deal_in
    const han: Han = hand_results.han
    const fu: Fu = hand_results.fu
    const key: PointsMapKey = this.GetPointMapKey(han, fu, ruleset)
    const num_players: number = players.NumPlayers()

    let points_delta: PointsDelta = {}
    const points_map = players.GetPlayer(winner_id).IsDealer() ? RonPointsDealer : RonPointsNonDealer
    const delta = points_map[key] + this.honba * ruleset.honba_points
    points_delta[winner_id] = delta + this.riichi_sticks * ruleset.riichi_cost
    points_delta[deal_in_id] = -delta
    return points_delta
  }

  private ResolvePointsDeltaOnDraw(
    hand_results: HandResults,
    ruleset: Ruleset,
    players: Players
  ): PointsDelta {
    const tenpai = hand_results.tenpai
    const num_players = players.NumPlayers()
    const num_tenpai = tenpai ? tenpai.length : 0
    const num_noten = num_players - num_tenpai
    if (tenpai === undefined || num_tenpai === 0 || num_tenpai === num_players) {
      return {}
    }
    const tenpai_delta = ruleset.draw_tenpai_points / num_tenpai
    const noten_delta = -ruleset.draw_tenpai_points / num_noten
    let points_delta = {}
    for (const [player_id, player] of Object.entries(players.GetPlayerMap())) {
      if (tenpai.includes(player_id)) {
        points_delta[player_id] = tenpai_delta
      } else {
        points_delta[player_id] = noten_delta
      }
    }
    return points_delta
  }
}
