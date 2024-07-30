import {
  PointsLadder,
  AllowedHans,
  AllowedFus,
  PointsMapKey,
  RonPointsDealer,
  RonPointsNonDealer,
  TsumoPointsDealer,
  TsumoPointsNonDealer,
  Han,
  Fu,
  PaoableHans
} from './game_constants.ts'
import { Ruleset } from './rulesets.ts'
import { NextWindMap, WindType } from './seat_constants.ts'
import { PlayerId, PlayerIdsInOrder, Players } from './players.ts'
import { Lang } from './app_constants'

export const HandOutcomeEnum = Object.freeze({
  TSUMO: 'tsumo',
  RON: 'ron',
  DRAW: 'draw',
  CHOMBO: 'chombo'
})

// Allowed state transitions:
// NOT_STARTED -> ON_GOING
// ON_GOING -> FINISHED
// ON_GOING -> ABANDONED
export enum HandState {
  NOT_STARTED,
  ON_GOING,
  FINISHED,
  ABANDONED
}

export const HandOutcomeEnumDisplayTextMap = Object.freeze({
  [HandOutcomeEnum.DRAW]: {
    [Lang.CN]: '流局',
    [Lang.EN]: 'Draw'
  },
  [HandOutcomeEnum.TSUMO]: {
    [Lang.CN]: '自摸',
    [Lang.EN]: 'Tsumo'
  },
  [HandOutcomeEnum.RON]: {
    [Lang.CN]: '荣和',
    [Lang.EN]: 'Ron'
  },
  [HandOutcomeEnum.CHOMBO]: {
    [Lang.CN]: '犯规',
    [Lang.EN]: 'Chombo'
  }
})

function InvalidOutcomeMsgText(language) {
  if (language == Lang.CN) {
    return '对局结果错误'
  } else if (language == Lang.EN) {
    return ' Invalid Hand OutCome'
  }
}

function ChomboPlayerNotFoundMsgText(language) {
  if (language == Lang.CN) {
    return '找不到犯规家'
  } else if (language == Lang.EN) {
    return ' Chombo Player Not Found'
  }
}

function RiichiButNotTenpaiMsgText(language) {
  if (language == Lang.CN) {
    return '立直家未听牌'
  } else if (language == Lang.EN) {
    return ' Riichi Player Not Tenpai'
  }
}

function TsumoMustHaveOneWinnerMsgText(language) {
  if (language == Lang.CN) {
    return '自摸家有且只有一个'
  } else if (language == Lang.EN) {
    return 'There Must be Only One Tsumo Winner'
  }
}

function RonPlayerNotFoundMsgText(language) {
  if (language == Lang.CN) {
    return '找不到和牌家'
  } else if (language == Lang.EN) {
    return 'Ron Player Not Found'
  }
}

function DealInPlayerNotFoundMsgText(language) {
  if (language == Lang.CN) {
    return '找不到放铳家'
  } else if (language == Lang.EN) {
    return 'Deal-in Player Not Found'
  }
}

function SameRonAndDealInPlayer(language) {
  if (language == Lang.CN) {
    return '和牌家和放铳家不能重叠'
  } else if (language == Lang.EN) {
    return 'Ron and Deal-in Player Cannot Overlap'
  }
}

function HeadBumpProhibitsMultipleRonWinner(language) {
  if (language == Lang.CN) {
    return '规则不支持多人荣和'
  } else if (language == Lang.EN) {
    return 'The Ruleset Prohibits Multiple Ron Players'
  }
}

function InvalidHanSizeMsgText(language) {
  if (language == Lang.CN) {
    return '番数数量必需等于荣和家数量'
  } else if (language == Lang.EN) {
    return 'Han Size Must Equal Ron Players Size'
  }
}

function InvalidHanMsgText(language) {
  if (language == Lang.CN) {
    return '番数错误'
  } else if (language == Lang.EN) {
    return 'Invalid Han'
  }
}

function InvalidFuSizeMsgText(language) {
  if (language == Lang.CN) {
    return '符数量必需等于荣和家数量'
  } else if (language == Lang.EN) {
    return 'Fu Size Must Equal Ron Players Size'
  }
}

function InvalidFuMsgText(language) {
  if (language == Lang.CN) {
    return '符数错误'
  } else if (language == Lang.EN) {
    return 'Invalid Fu'
  }
}

function InvalidHanFuPairMsgText(language) {
  if (language == Lang.CN) {
    return '番符组合错误'
  } else if (language == Lang.EN) {
    return 'Invalid (Han, Fu) Pair'
  }
}

function InvalidPaoLengthMsgText(language) {
  if (language == Lang.CN) {
    return '包牌人数错误'
  } else if (language == Lang.EN) {
    return 'Invalid Pao Size'
  }
}

function HanNotPaoableMsgText(language) {
  if (language == Lang.CN) {
    return '番数不计包牌'
  } else if (language == Lang.EN) {
    return 'The Han is Not Pao-able'
  }
}

function WinnerCannotPaoMsgText(language) {
  if (language == Lang.CN) {
    return '包牌家不能为赢家'
  } else if (language == Lang.EN) {
    return 'Winner Cannot Pao'
  }
}

export type PointsDelta = Record<PlayerId, number>

export type HandResults = {
  outcome: string | null
  tenpai?: PlayerId[]
  winner?: PlayerId[]
  deal_in?: PlayerId
  han?: (number | string)[]
  fu?: (number | null)[]
  points_delta?: PointsDelta
  chombo?: PlayerId[]
  pao?: PlayerId[]
}

interface HandInterface {
  round_wind: WindType
  hand: number
  honba: number
  riichi_sticks: number
}

export class Hand {
  results: HandResults
  round_wind: WindType
  hand: number
  honba: number
  riichi: PlayerId[]
  riichi_sticks: number
  state: HandState
  has_next_hand: boolean

  constructor({ round_wind, hand, honba, riichi_sticks }: HandInterface) {
    this.state = HandState.NOT_STARTED
    this.round_wind = round_wind
    this.hand = hand
    this.honba = honba
    this.riichi_sticks = riichi_sticks
    this.riichi = []
    this.has_next_hand = true
    this.CleanUpResults()
  }

  Clone(): Hand {
    let clone_instance = new Hand({
      round_wind: this.round_wind,
      hand: this.hand,
      honba: this.honba,
      riichi_sticks: this.riichi_sticks
    })
    clone_instance.riichi = [...this.riichi]
    clone_instance.state = this.state
    clone_instance.has_next_hand = this.has_next_hand
    clone_instance.results.outcome = this.results.outcome
    if (this.results.tenpai) {
      clone_instance.results.tenpai = [...this.results.tenpai]
    }
    if (this.results.winner) {
      clone_instance.results.winner = [...this.results.winner]
    }
    if (this.results.deal_in) {
      clone_instance.results.deal_in = this.results.deal_in
    }
    if (this.results.han) {
      clone_instance.results.han = [...this.results.han]
    }
    if (this.results.fu) {
      clone_instance.results.fu = [...this.results.fu]
    }
    if (this.results.points_delta != undefined) {
      clone_instance.results.points_delta = { ...this.results.points_delta }
    }
    if (this.results.chombo) {
      clone_instance.results.chombo = [...this.results.chombo]
    }
    if (this.results.pao) {
      clone_instance.results.pao = [...this.results.pao]
    }
    return clone_instance
  }

  // Parses an object to create a Hand instance. This method does not verify the object, is the caller's responsibility to verify it before calling this method.
  static ParseFromObject(obj: any): Hand {
    let parsed_instance = new Hand({
      round_wind: obj.round_wind,
      hand: obj.hand,
      honba: obj.honba,
      riichi_sticks: obj.riichi_sticks
    })
    parsed_instance.state = obj.state
    parsed_instance.riichi = [...obj.riichi]
    parsed_instance.has_next_hand = obj.has_next_hand
    if ('results' in obj) {
      parsed_instance.results = { ...obj.results }
    }
    return parsed_instance
  }

  Start(): boolean {
    if (this.state != HandState.NOT_STARTED) {
      console.warn(`cannot start the hand when it is already started`)
      return false
    }
    // Mark as on going
    this.state = HandState.ON_GOING
    return true
  }

  Finish(results: HandResults, players: Players, ruleset: Ruleset): boolean {
    if (this.state != HandState.ON_GOING) {
      console.warn(`cannot finish the hand when it is not ongoing`)
      return false
    }
    const [valid, msg, validated_and_formalized_results] = this.ValidateAndFormalizeHandResults(
      results,
      players,
      ruleset
    )
    if (!valid) {
      alert(`Cannot finish the hand due to invalid hand results: ${msg}`)
      return false
    }
    // save validated results
    this.results = validated_and_formalized_results

    if (this.results.outcome == HandOutcomeEnum.CHOMBO) {
      // When chombo, we reset to initial state of the hand
      for (const player_id of PlayerIdsInOrder) {
        this.PlayerUnRiichi(player_id, players, ruleset)
      }
    } else {
      // Apply points change and clean up riichi sticks
      this.results.points_delta = this.ResolvePointsDelta(this.results, ruleset, players)
      players.ApplyPointsDelta(this.results.points_delta)
      if (this.results.outcome != HandOutcomeEnum.DRAW) {
        this.riichi_sticks = 0
      }
    }
    // Mark as finished
    console.log('Finishing the current hand with results=', this.results)
    this.state = HandState.FINISHED
    return true
  }

  Abandon(players: Players, ruleset: Ruleset): boolean {
    // we should revert all riichi's occured in the current hand before abandoning it
    if (this.state != HandState.ON_GOING) {
      return false
    }
    for (const player_id of PlayerIdsInOrder) {
      this.PlayerUnRiichi(player_id, players, ruleset)
    }
    this.state = HandState.ABANDONED
    this.CleanUpResults()
    return true
  }

  IsNotStarted(): boolean {
    return this.state == HandState.NOT_STARTED
  }

  IsOngoing(): boolean {
    return this.state == HandState.ON_GOING
  }

  IsFinished(): boolean {
    return this.state == HandState.FINISHED
  }

  IsAbandoned(): boolean {
    return this.state == HandState.ABANDONED
  }

  SetUpNextHand(players: Players, ruleset: Ruleset): [Hand, boolean] | undefined {
    // the hand must be finished before calling this method.
    if (this.state != HandState.FINISHED) {
      console.warn(
        `cannot set up the next hand when the current hand is not finished: ${this.state}`
      )
      return undefined
    }
    if (!this.has_next_hand) {
      console.warn(`cannot set up the next hand as there is no more future hands`)
      return undefined
    }
    if (this.results.outcome == HandOutcomeEnum.CHOMBO) {
      return this.CreateNextHand(
        /*renchan=*/ false,
        /*honba_increase=*/ false,
        /*chombo=*/ true,
        ruleset
      )
    }

    const [dealer_id, dealer] = players.FindDealer()
    const all_last = this.IsAllLast(ruleset)
    let renchan = false
    let honba_increase = false
    if (this.results.outcome == HandOutcomeEnum.DRAW) {
      honba_increase = true
      if (this.results.tenpai.includes(dealer_id)) {
        renchan =
          (!all_last && ruleset.dealer_tenpai_renchan) ||
          (all_last && ruleset.all_last_dealer_tenpai_renchan)
      }
    } else {
      if (Array.isArray(this.results.winner) && this.results.winner.includes(dealer_id)) {
        honba_increase = true
        renchan = !all_last || ruleset.all_last_dealer_win_renchan
      }
    }
    const should_finish_game = all_last && !renchan

    if (should_finish_game) {
      this.has_next_hand = false
      return undefined
    }
    return this.CreateNextHand(renchan, honba_increase, /*chombo=*/ false, ruleset)
  }

  PlayerRiichi(player_id: PlayerId, players: Players, ruleset: Ruleset) {
    if (!this.riichi.includes(player_id)) {
      this.riichi_sticks += 1
      this.riichi.push(player_id)
      players.GetPlayer(player_id).ApplyPointsDelta(-ruleset.riichi_cost)
    }
  }

  PlayerRiichied(player_id: PlayerId) {
    return this.riichi.includes(player_id)
  }

  PlayerUnRiichi(player_id: PlayerId, players: Players, ruleset: Ruleset) {
    if (this.riichi.includes(player_id)) {
      this.riichi_sticks -= 1
      this.riichi.splice(this.riichi.indexOf(player_id), 1)
      players.GetPlayer(player_id).ApplyPointsDelta(ruleset.riichi_cost)
    }
  }

  IsAllLast(ruleset: Ruleset): boolean {
    return ruleset.last_round_wind == this.round_wind && this.hand == ruleset.num_players
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
    }
  }

  private ValidateAndFormalizeHandResults(
    results: HandResults,
    players: Players,
    ruleset: Ruleset
  ): [boolean, string, HandResults?] {
    const [valid, msg] = this.ValidateHandResults(results, players, ruleset)
    if (!valid) {
      return [valid, msg]
    }
    const validate_and_formalized_results = this.FormalizeHandResults(results, ruleset)
    return [valid, msg, validate_and_formalized_results]
  }

  // Process a valid HandResults to make sure can be stored to a finished hand, and does not contain redundant fields
  // The hand must be validated before calling this method, i.e. all necessary fields must exist for any outcome
  private FormalizeHandResults(results: HandResults, ruleset: Ruleset): HandResults {
    let formalized_results: HandResults = {
      outcome: results.outcome
    }
    if (results.outcome == HandOutcomeEnum.CHOMBO) {
      Object.assign(formalized_results, {
        chombo: results.chombo
      })
    } else if (results.outcome == HandOutcomeEnum.DRAW) {
      Object.assign(formalized_results, {
        tenpai: results.tenpai ? results.tenpai : []
      })
    } else if (results.outcome == HandOutcomeEnum.TSUMO) {
      Object.assign(formalized_results, {
        winner: results.winner,
        han: results.han,
        fu: results.fu,
        pao: results.pao ? results.pao : undefined
      })
    } else if (results.outcome == HandOutcomeEnum.RON) {
      Object.assign(formalized_results, {
        winner: results.winner,
        deal_in: results.deal_in,
        han: results.han,
        fu: results.fu,
        pao: results.pao ? results.pao : undefined
      })
    }
    this.MaybeApplyRoundUpMangan(formalized_results, ruleset)
    return formalized_results
  }

  // Applies round-up mangan if enabled, updates the results directly
  private MaybeApplyRoundUpMangan(results: HandResults, ruleset: Ruleset) {
    if (ruleset.round_up_mangan) {
      const winner_count = results.winner ? results.winner.length : 0
      for (let i = 0; i < winner_count; ++i) {
        if (
          (results.han[i] == 4 && results.fu[i] == 30) ||
          (results.han[i] == 3 && results.fu[i] == 60)
        ) {
          results.han[i] = PointsLadder.MANGAN
          results.fu[i] = null
        }
      }
    }
  }

  // Checks whether a hand result contains is valid for finishing this hand.
  // This does not handle redundant fields.
  private ValidateHandResults(
    results: HandResults,
    players: Players,
    ruleset: Ruleset
  ): [boolean, string] {
    if (!Object.values(HandOutcomeEnum).includes(results.outcome)) {
      return [false, `${InvalidOutcomeMsgText(ruleset.language)}: ${results.outcome}`]
    }

    if (results.outcome == HandOutcomeEnum.CHOMBO) {
      if (!results.chombo || results.chombo.length == 0) {
        return [false, `${ChomboPlayerNotFoundMsgText(ruleset.language)}`]
      }
    }

    if (results.outcome == HandOutcomeEnum.DRAW && this.riichi) {
      for (const riichi_player of this.riichi) {
        if (!results.tenpai || !results.tenpai.includes(riichi_player)) {
          return [
            false,
            `${RiichiButNotTenpaiMsgText(ruleset.language)}: ${players.GetPlayer(riichi_player).name}`
          ]
        }
      }
    } else if (results.outcome == HandOutcomeEnum.TSUMO) {
      if (
        !results.winner ||
        results.winner.length != 1 ||
        players.GetPlayer(results.winner[0]) === undefined
      ) {
        return [false, `${TsumoMustHaveOneWinnerMsgText(ruleset.language)}: ${results.winner}`]
      }
      if (
        !results.han ||
        results.han.length == 0 ||
        !Object.values(AllowedHans).includes(results.han[0])
      ) {
        return [false, `${InvalidHanMsgText(ruleset.language)}: ${results.han}`]
      }
      if (
        !results.fu ||
        results.fu.length == 0 ||
        (!Object.values(PointsLadder).includes(results.han[0]) &&
          !Object.values(AllowedFus[results.han[0]]).includes(results.fu[0]))
      ) {
        return [false, `${InvalidFuMsgText(ruleset.language)}: ${results.fu}`]
      }
      if (results.pao != undefined) {
        // if pao exists, it must has the same length as winner, and is null for non-paoable hans
        if (results.pao.length == 0) {
          return [false, `${InvalidPaoLengthMsgText(ruleset.language)}: ${results.pao.length}`]
        }
        if (results.pao[0] != null && !(results.han[0] in PaoableHans)) {
          return [
            false,
            `${HanNotPaoableMsgText(ruleset.language)}: ${results.han[0]} ${results.pao[0]}`
          ]
        }
        if (results.pao[0] != null && results.pao[0] == results.winner[0]) {
          return [false, `${WinnerCannotPaoMsgText(ruleset.language)}: ${results.pao[0]}`]
        }
      }
      const key = this.GetPointMapKey(results.han[0], results.fu[0], ruleset)
      if (!TsumoPointsNonDealer.hasOwnProperty(key)) {
        return [
          false,
          `${InvalidHanFuPairMsgText(ruleset.language)}: ${results.outcome}, ${results.han}, ${results.fu}`
        ]
      }
    } else if (results.outcome == HandOutcomeEnum.RON) {
      if (
        !results.winner ||
        results.winner.length == 0 ||
        results.winner.some((p) => players.GetPlayer(p) === undefined)
      ) {
        return [false, `${RonPlayerNotFoundMsgText(ruleset.language)}: ${results.winner}`]
      }
      const winner_count = results.winner.length
      if (ruleset.head_bump && winner_count > 1) {
        return [false, `${HeadBumpProhibitsMultipleRonWinner(ruleset.language)}`]
      }
      if (players.GetPlayer(results.deal_in) === undefined) {
        return [false, `${DealInPlayerNotFoundMsgText(ruleset.language)}: ${results.deal_in}`]
      }
      if (results.winner.includes(results.deal_in)) {
        return [
          false,
          `${SameRonAndDealInPlayer(ruleset.language)}: ${results.winner} == ${results.deal_in}`
        ]
      }
      if (!results.han || results.han.length != winner_count) {
        return [false, `${InvalidHanSizeMsgText(ruleset.language)}: ${results.han}`]
      }
      if (!results.fu || results.fu.length != winner_count) {
        return [false, `${InvalidFuSizeMsgText(ruleset.language)}: ${results.han}`]
      }
      if (results.pao != undefined) {
        // if pao exists, it must has the same length as winner, and is null for non-paoable hans
        if (results.pao.length != winner_count) {
          return [false, `${InvalidPaoLengthMsgText(ruleset.language)}: ${results.pao}`]
        }
        for (let i = 0; i < winner_count; ++i) {
          if (results.pao[i] != null && !(results.han[i] in PaoableHans)) {
            return [
              false,
              `${HanNotPaoableMsgText(ruleset.language)}: ${results.han[i]} ${results.pao[i]}`
            ]
          }
          if (results.pao[i] != null && results.pao[i] == results.winner[i]) {
            return [false, `${WinnerCannotPaoMsgText(ruleset.language)}: ${results.pao[i]}`]
          }
        }
      }

      for (let i = 0; i < winner_count; ++i) {
        const han_i = results.han[i]
        const fu_i = results.fu[i]
        if (!Object.values(AllowedHans).includes(han_i)) {
          return [false, `${InvalidHanMsgText(ruleset.language)}: ${han_i}`]
        }
        if (
          !Object.values(PointsLadder).includes(han_i) &&
          !Object.values(AllowedFus[han_i]).includes(fu_i)
        ) {
          return [false, `${InvalidFuMsgText(ruleset.language)}: ${fu_i}`]
        }
        const key = this.GetPointMapKey(han_i, fu_i, ruleset)
        if (!RonPointsNonDealer.hasOwnProperty(key)) {
          return [
            false,
            `${InvalidHanFuPairMsgText(ruleset.language)}: ${results.outcome}, ${han_i}, ${fu_i}`
          ]
        }
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
      outcome: null
    }
  }

  private CreateNextHand(
    renchan: boolean,
    honba_increase: boolean,
    chombo: boolean,
    ruleset: Ruleset
  ): [Hand, boolean] {
    if (chombo) {
      return [
        new Hand({
          round_wind: this.round_wind,
          hand: this.hand,
          honba: this.honba,
          riichi_sticks: this.riichi_sticks
        }),
        false
      ]
    }

    const next_honba = honba_increase ? this.honba + 1 : 0
    const players_should_shift_seats = !renchan
    const next_riichi_sticks = this.riichi_sticks
    let next_round_wind = this.round_wind
    let next_hand = this.hand

    if (!renchan) {
      if (this.hand == ruleset.num_players) {
        next_round_wind = NextWindMap[this.round_wind]
        next_hand = 1
      } else {
        next_hand = this.hand + 1
      }
    }
    return [
      new Hand({
        round_wind: next_round_wind,
        hand: next_hand,
        honba: next_honba,
        riichi_sticks: next_riichi_sticks
      }),
      players_should_shift_seats
    ]
  }

  private ResolvePointsDeltaOnTsumo(
    hand_results: HandResults,
    ruleset: Ruleset,
    players: Players
  ): PointsDelta {
    // tsumo should have exactly one winner, thus we just access [0]
    const winner_id: PlayerId = hand_results.winner[0]
    const han: Han = hand_results.han[0]
    const fu: Fu = hand_results.fu[0]
    const pao: PlayerId | undefined = hand_results.pao ? hand_results.pao[0] : undefined
    const num_players: number = players.NumPlayers()
    const key: PointsMapKey = this.GetPointMapKey(han, fu, ruleset)

    let points_delta: PointsDelta = {}
    if (players.GetPlayer(winner_id).IsDealer()) {
      const delta: number =
        TsumoPointsDealer[key] + (this.honba * ruleset.honba_points) / (num_players - 1)
      for (const [player_id, player] of Object.entries(players.GetPlayerMap())) {
        if (player_id == winner_id) {
          points_delta[player_id] = 3 * delta + this.riichi_sticks * ruleset.riichi_cost
        } else if (pao != undefined && pao != null) {
          // if pao exists, the pao player pays all
          if (player_id == pao) {
            points_delta[player_id] = -3 * delta
          }
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
        } else if (pao != undefined && pao != null) {
          // if pao exists, the pao player pays all
          if (player_id == pao) {
            points_delta[player_id] = dealer_delta + 2 * non_dealer_delta
          }
        } else {
          if (player.IsDealer()) {
            points_delta[player_id] = dealer_delta
          } else {
            points_delta[player_id] = non_dealer_delta
          }
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
    const deal_in_id: PlayerId = hand_results.deal_in

    const winner_count = hand_results.winner.length
    let points_delta: PointsDelta = {
      [deal_in_id]: 0
    }
    for (let i = 0; i < winner_count; ++i) {
      const winner_id: PlayerId = hand_results.winner[i]
      const han: Han = hand_results.han[i]
      const fu: Fu = hand_results.fu[i]
      const key: PointsMapKey = this.GetPointMapKey(han, fu, ruleset)
      const pao: PlayerId | undefined = hand_results.pao ? hand_results.pao[i] : undefined
      const points_map = players.GetPlayer(winner_id).IsDealer()
        ? RonPointsDealer
        : RonPointsNonDealer
      const delta = points_map[key]

      if (!(winner_id in points_delta)) {
        points_delta[winner_id] = 0
      }

      points_delta[winner_id] += delta
      if (pao != undefined && pao != null && pao != deal_in_id) {
        // when pao exists and pao != deal in, the pao player pays half base points, and all honba
        if (!(pao in points_delta)) {
          points_delta[pao] = 0
        }
        points_delta[pao] -= delta / 2
        points_delta[deal_in_id] -= delta / 2
      } else {
        points_delta[deal_in_id] -= delta
      }
    }
    // riichi sticks and honba goes to the closest winner from the deal_in player
    // (or the corresponding pao player if pao exists)
    let closest_winner_id = deal_in_id
    while (!hand_results.winner.includes(closest_winner_id)) {
      closest_winner_id = NextWindMap[closest_winner_id]
    }
    points_delta[closest_winner_id] +=
      this.riichi_sticks * ruleset.riichi_cost + this.honba * ruleset.honba_points
    if (hand_results.pao != undefined) {
      // the corresponding pao player (if exists) for the closest winner pays honba
      const closest_winner_index = hand_results.winner.indexOf(closest_winner_id)
      const pao = hand_results.pao[closest_winner_index]
      if (pao != null) {
        points_delta[pao] -= this.honba * ruleset.honba_points
      } else {
        points_delta[deal_in_id] -= this.honba * ruleset.honba_points
      }
    } else {
      points_delta[deal_in_id] -= this.honba * ruleset.honba_points
    }
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
    if (!tenpai || num_tenpai === 0 || num_tenpai === num_players) {
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
