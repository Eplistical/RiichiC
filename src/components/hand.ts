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
import { NextWindMap, Wind } from './seat_constants.ts'
import { PlayerId, Players } from './players.ts'

export const HandOutcomeEnum = Object.freeze({
  TSUMO: 'tsumo',
  RON: 'ron',
  DRAW: 'draw'
})

export enum HandState {
  NOT_STARTED,
  ON_GOING,
  FINISHED,
}

export const HandOutcomeEnumDisplayTextMap = Object.freeze({
  [HandOutcomeEnum.DRAW]: '流局',
  [HandOutcomeEnum.TSUMO]: '自摸',
  [HandOutcomeEnum.RON]: '荣和'
})

export type PointsDelta = Record<PlayerId, number>

export type HandResults = {
  outcome: string | undefined
  tenpai?: Set<PlayerId>
  winner?: PlayerId | undefined
  deal_in?: PlayerId | undefined
  han?: number | string | undefined
  fu?: number | undefined
}

// Get rid of useless fields for an outcome
export function RemoveUnusedFieldsForHandResults({outcome, tenpai, winner, deal_in, han, fu}: HandResults): HandResults {
  if (tenpai == undefined) {
    tenpai = new Set<PlayerId>()
  } else {
    tenpai = new Set<PlayerId>(tenpai)
  }

  if (outcome == HandOutcomeEnum.DRAW) {
    return {
      outcome: outcome,
      tenpai: tenpai,
    }
  }
  else if (outcome == HandOutcomeEnum.RON) {
    return {
      outcome: outcome,
      winner: winner,
      deal_in: deal_in,
      han: han,
      fu: fu,
    }
  }
  else if (outcome == HandOutcomeEnum.TSUMO) {
    return {
      outcome: outcome,
      winner: winner,
      han: han,
      fu: fu,
    }
  }
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
  results: HandResults;
  round_wind: Wind;
  hand: number;
  honba: number;
  riichi: Set<PlayerId>;
  riichi_sticks: number;
  state: HandState;
  has_next_hand: boolean;

  constructor({round_wind, hand, honba, riichi_sticks} : HandInterface) {
    this.state = HandState.NOT_STARTED;
    this.round_wind = round_wind;
    this.hand = hand;
    this.honba = honba;
    this.riichi_sticks = riichi_sticks;
    this.riichi = new Set<PlayerId>();
    this.has_next_hand = true;
    this.CleanUpResults();
  } 

  Start() {
    if (this.state != HandState.NOT_STARTED) {
      console.warn(`cannot start the hand when it is already started`)
      return;
    }
    // Mark as on going
    this.state= HandState.ON_GOING;
  }

  Finish(players: Players, ruleset: Ruleset): boolean {
    if (this.state != HandState.ON_GOING) {
      console.warn(`cannot finish the hand when it is not ongoing`)
      return false;
    }
    const [valid, msg] = this.ValidateHandResults(players, ruleset)
    if (!valid) {
      alert(`Cannot finish the hand due to invalid hand results: ${msg}`)
      return false;
    }
    // Apply points change and clean up riichi sticks
    const points_delta = this.ResolvePointsDelta(this.results, ruleset, players);
    players.ApplyPointsDelta(points_delta);
    if (this.results.outcome != HandOutcomeEnum.DRAW) {
      this.riichi_sticks = 0;
    }
    // Mark as finished
    this.state = HandState.FINISHED;
    return true;
  }

  IsOngoing() {
    return this.state == HandState.ON_GOING;
  }

  IsFinished() {
    return this.state == HandState.FINISHED;
  }

  SetUpNextHand(players: Players, ruleset: Ruleset): [Hand, boolean] | undefined {
    // the hand must be finished before calling this method.
    if (this.state != HandState.FINISHED) {
      console.warn(`cannot set up the next hand when the current hand is not finished`)
      return undefined;
    }
    if (!this.has_next_hand) {
      console.warn(`cannot set up the next hand as there is no more future hands`)
      return undefined;
    }
    const [dealer_id, dealer] = players.FindDealer();
    const all_last = this.IsAllLast(ruleset);
    let renchan = false
    let honba_increase = false
    if (this.results.outcome == HandOutcomeEnum.DRAW) {
      honba_increase = true
      if (this.results.tenpai.has(dealer_id)) {
        renchan =
          (!all_last && ruleset.dealer_tenpai_renchan) ||
          (all_last && ruleset.all_last_dealer_tenpai_renchan)
      }
    } else {
      if (this.results.winner == dealer_id) {
        honba_increase = true
        renchan = !all_last || ruleset.all_last_dealer_win_renchan
      }
    }
    const should_finish_game = all_last && !renchan

    if (should_finish_game) {
      this.has_next_hand = false;
      return undefined;
    }
    return this.CreateNextHand(renchan, honba_increase, players, ruleset);
  }

  PlayerRiichi(player_id: PlayerId, players: Players, ruleset: Ruleset) {
    if (!this.riichi.has(player_id)) {
      this.riichi_sticks += 1;
      this.riichi.add(player_id);
      players.GetPlayer(player_id).ApplyPointsDelta(-ruleset.riichi_cost);
    }
  }

  PlayerUnRiichi(player_id: PlayerId, players: Players, ruleset: Ruleset) {
    if (this.riichi.has(player_id)) {
      this.riichi_sticks -= 1;
      this.riichi.delete(player_id);
      players.GetPlayer(player_id).ApplyPointsDelta(ruleset.riichi_cost);
    }
  }

  IsAllLast(ruleset: Ruleset): boolean{
    return (ruleset.last_round_wind == this.round_wind && this.hand == ruleset.num_players);
  }

  private ResolvePointsDelta(
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

  private ValidateHandResults(players: Players, ruleset: Ruleset) : [boolean, string] {
    if (!Object.values(HandOutcomeEnum).includes(this.results.outcome)) {
      return [false, `错误对局结果: ${this.results.outcome}`]
    }

    if (this.results.outcome == HandOutcomeEnum.DRAW && this.riichi) {
      for (const riichi_player of this.riichi) {
        if (!this.results.tenpai.has(riichi_player)) {
          return [false, `立直家未听牌: ${players.GetPlayer(riichi_player).name}`]
        }
      }
    } else if (this.results.outcome == HandOutcomeEnum.TSUMO) {
      if (players.GetPlayer(this.results.winner) === undefined) {
        return [false, `找不到自摸家: ${this.results.winner}`]
      }
      if (!Object.values(AllowedHans).includes(this.results.han)) {
        return [false, `番数错误: ${this.results.han}`]
      }
      if (
        !Object.values(PointsLadder).includes(this.results.han) &&
        !Object.values(AllowedFus[this.results.han]).includes(this.results.fu)
      ) {
        return [false, `符数错误: ${this.results.fu}`]
      }
      const key = this.GetPointMapKey(this.results.han, this.results.fu, ruleset)
      if (!TsumoPointsNonDealer.hasOwnProperty(key)) {
        return [
          false,
          `番符组合不存在: ${this.results.outcome}, ${this.results.han}, ${this.results.fu}`
        ]
      }
    } else if (this.results.outcome == HandOutcomeEnum.RON) {
      if (players.GetPlayer(this.results.winner) === undefined) {
        return [false, `找不到胡牌家: ${this.results.winner}`]
      }
      if (players.GetPlayer(this.results.deal_in) === undefined) {
        return [false, `找不到点炮家: ${this.results.deal_in}`]
      }
      if (this.results.deal_in == this.results.winner) {
        return [false, `点炮家不能和胡家一样: ${this.results.winner} == ${this.results.deal_in}`]
      }
      if (!Object.values(AllowedHans).includes(this.results.han)) {
        return [false, `番数错误: ${this.results.han}`]
      }
      if (
        !Object.values(PointsLadder).includes(this.results.han) &&
        !Object.values(AllowedFus[this.results.han]).includes(this.results.fu)
      ) {
        return [false, `符数错误: ${this.results.fu}`]
      }
      const key = GetPointMapKey(this.results.han, this.results.fu, ruleset)
      if (!RonPointsNonDealer.hasOwnProperty(key)) {
        return [
          false,
          `番符组合不存在: ${this.results.outcome}, ${this.results.han}, ${this.results.fu}`
        ]
      }
    }
    return [true, '']
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

  private CleanUpResults() {
    this.results = {
      outcome: undefined,
      tenpai: new Set<PlayerId>(),
      winner: undefined,
      deal_in: undefined,
      han: undefined,
      fu: undefined
    }
  }

  private CreateNextHand(renchan: boolean, honba_increase: boolean, players: Players, ruleset: Ruleset): [Hand, boolean] {
    const next_honba = (honba_increase ? this.honba + 1 : 0);
    const players_should_shift_seats = !renchan;
    const next_riichi_sticks = this.riichi_sticks;
    let next_round_wind = this.round_wind;
    let next_hand = this.hand;

    if (!renchan) {
      if (this.hand == ruleset.num_players) {
        next_round_wind = NextWindMap[this.round_wind];
        next_hand = 1;
      }
      else {
        next_hand = this.hand + 1;
      }
    }
    return [new Hand({
      round_wind: next_round_wind,
      hand: next_hand,
      honba: next_honba,
      riichi_sticks: next_riichi_sticks}), players_should_shift_seats];
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
    const num_tenpai = tenpai ? tenpai.size : 0
    const num_noten = num_players - num_tenpai
    if (tenpai === undefined || num_tenpai === 0 || num_tenpai === num_players) {
      return {}
    }
    const tenpai_delta = ruleset.draw_tenpai_points / num_tenpai
    const noten_delta = -ruleset.draw_tenpai_points / num_noten
    let points_delta = {}
    for (const [player_id, player] of Object.entries(players.GetPlayerMap())) {
      if (tenpai.has(player_id)) {
        points_delta[player_id] = tenpai_delta
      } else {
        points_delta[player_id] = noten_delta
      }
    }
    return points_delta
  }
}
