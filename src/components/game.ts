import { Hand, HandResults, HandOutcomeEnum, HandOutcomeEnumDisplayTextMap } from './hand.ts'
import { WindType, Winds, WindsDisplayTextMap, WindsInOrder } from './seat_constants.ts'
import { Ruleset, LeftOverRiichiSticks } from './rulesets.ts'
import { Player, PlayerId, PlayerIdsInOrder, Players } from './players.ts'
import {
  ActionBriefDisplayMap,
  Actions,
  PointsLadder,
  PointsLadderBriefDisplayMap
} from './game_constants'
import { Lang } from './app_constants'
import RuleSetConfigurationBoard from './RuleSetConfigurationBoard.vue'

function CannotFindStartingWindMsgText(language) {
  if (language == Lang.CN) {
    return `找不到起家`
  } else if (language == Lang.EN) {
    return `Cannot find starting wind`
  }
}

function InvalidNumPlayersMsgText(language) {
  if (language == Lang.CN) {
    return `开局风位数量错误`
  } else if (language == Lang.EN) {
    return `Cannot find starting wind`
  }
}

function ResetChomboHandMsgText(language) {
  if (language == Lang.CN) {
    return `重置`
  } else if (language == Lang.EN) {
    return `Reset`
  }
}

function HandSignatureTitleText(language) {
  if (language == Lang.CN) {
    return `场`
  } else if (language == Lang.EN) {
    return `Hand`
  }
}

function StartRiichiStickTitleText(language) {
  if (language == Lang.CN) {
    return `供托`
  } else if (language == Lang.EN) {
    return `Starting Riichi Sticks`
  }
}

function ResultSummaryTitleText(language) {
  if (language == Lang.CN) {
    return `结局`
  } else if (language == Lang.EN) {
    return `Results Summary`
  }
}

export enum GameState {
  NOT_STARTED,
  ON_GOING,
  FINISHED
}

export enum GameLogType {
  // the log represents a regular hand
  REGULAR,
  // the log represents assigning left-over riichi sticks after the game is finished
  ASSIGN_LEFT_OVER_RIICHI,
  // the log represents a chombo record
  CHOMBO
}

type GameLog = {
  state: GameState
  hand: Hand
  players: Players
  log_type: GameLogType
}

interface GameInterface {
  ruleset: Ruleset
  player_names: string[]
  player_starting_winds: WindType[]
}

export class Game {
  // game id will be populated once after the game stats are uploaded.
  game_id: string | undefined
  game_date: Date
  state: GameState
  ruleset: Ruleset | undefined
  players: Players | undefined
  current_hand: Hand | undefined
  log: GameLog[]

  constructor() {
    this.game_id = undefined
    this.game_date = new Date()
    this.state = GameState.NOT_STARTED
    this.ruleset = undefined
    this.log = []
  }

  // Parses an object to create a Game instance. This method does not verify the object, is the caller's responsibility to verify it before calling this method.
  static ParseFromObject(obj: any): Game {
    let parsed_instance = new Game()
    parsed_instance.game_id = obj.game_id
    parsed_instance.game_date = new Date(obj.game_date)
    parsed_instance.state = obj.state
    parsed_instance.ruleset = obj.ruleset
    if ('players' in obj) {
      parsed_instance.players = Players.ParseFromObject(obj.ruleset, obj.players)
    }
    if ('current_hand' in obj) {
      parsed_instance.current_hand = Hand.ParseFromObject(obj.current_hand)
    }
    if ('log' in obj) {
      for (let log of obj.log) {
        parsed_instance.log.push({
          state: log.state,
          hand: Hand.ParseFromObject(log.hand),
          players: Players.ParseFromObject(obj.ruleset, log.players),
          log_type: log.log_type
        })
      }
    }
    return parsed_instance
  }

  InitGame({ ruleset, player_names, player_starting_winds }: GameInterface): [boolean, string] {
    const [valid, msg] = this.ValidatePlayerStartingWinds(player_starting_winds, ruleset)
    if (!valid) {
      return [valid, msg]
    }
    const player_names_in_order = this.GetPlayerNamesInOrder(player_names, player_starting_winds)
    this.state = GameState.NOT_STARTED
    this.ruleset = ruleset
    this.current_hand = new Hand({
      round_wind: Winds.EAST,
      hand: 1,
      honba: 0,
      riichi_sticks: 0
    })
    this.players = new Players(this.ruleset, player_names_in_order)
    this.log = []
    return [true, '']
  }

  Start() {
    if (this.state != GameState.NOT_STARTED) {
      console.warn(`cannot start the game when it is already started`)
      return
    }
    this.state = GameState.ON_GOING
  }

  IsOnGoing() {
    return this.state == GameState.ON_GOING
  }

  IsNotStarted() {
    return this.state == GameState.NOT_STARTED
  }

  IsFinished() {
    return this.state == GameState.FINISHED
  }

  Uploaded() {
    return !(this.game_id == undefined)
  }

  SetGameId(game_id) {
    if (this.game_id == undefined) {
      this.game_id = game_id
      return true
    }
    return false
  }

  GetPlayerName(player_id: PlayerId) {
    return this.players.GetPlayer(player_id).name
  }

  GetPlayerCuurentWind(player_id: PlayerId) {
    return this.players.GetPlayer(player_id).current_wind
  }

  GetPlayerPoints(player_id: PlayerId) {
    return this.players.GetPlayer(player_id).points
  }

  PlayerRiichi(player_id: PlayerId) {
    this.current_hand.PlayerRiichi(player_id, this.players, this.ruleset)
  }

  PlayerUnRiichi(player_id: PlayerId) {
    this.current_hand.PlayerUnRiichi(player_id, this.players, this.ruleset)
  }

  Finish(): boolean {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot finish a game that is not on going`)
      return false
    }
    if (!this.current_hand.IsFinished()) {
      console.warn(
        'finish game when the current hand is not finished, the current hand will be abandoned.'
      )
      this.current_hand.Abandon(this.players, this.ruleset)
    }
    this.state = GameState.FINISHED
    this.players.ComputeAndStorePlayersRank()
    this.AssignLeftOverRiichiSticks()
    return true
  }

  StartCurrentHand() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update hand state when game state = ${this.state}`)
      return
    }
    this.current_hand.Start()
  }

  FinishCurrentHand(hand_results: HandResults): boolean {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update hand state when game state = ${this.state}`)
      return false
    }
    const hand_finished = this.current_hand.Finish(hand_results, this.players, this.ruleset)
    this.SanityCheckTotalPoints()
    return hand_finished
  }

  SetUpNextHandOrFinishGame() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update hand state when game state = ${this.state}`)
      return
    }
    // Cannot set up next hand
    const next_hand_info = this.current_hand.SetUpNextHand(this.players, this.ruleset)
    if (next_hand_info === undefined) {
      if (this.current_hand.has_next_hand == false) {
        // the game reaches the end, should finish
        this.Finish()
      } else {
        // there are errors, cannot resolve the next hand
        console.warn('failed to resolve next hand.')
      }
      return
    }
    // Next hand resolved, apply and shift players' seats if needed.
    const [next_hand, players_should_shift_seats] = next_hand_info
    this.current_hand = next_hand
    if (players_should_shift_seats) {
      this.players.ShiftSeats()
    }
    this.SanityCheckTotalPoints()
  }

  SaveHandLog() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update log when game state = ${this.state}`)
      return
    }
    if (!this.current_hand.IsFinished()) {
      console.warn('cannot save hand log, hand is not finished.')
      return
    }
    this.SanityCheckTotalPoints()
    let hand_log = {
      state: this.state,
      hand: this.current_hand.Clone(),
      players: this.players.Clone(this.ruleset),
      log_type:
        this.current_hand.results.outcome == HandOutcomeEnum.CHOMBO
          ? GameLogType.CHOMBO
          : GameLogType.REGULAR
    }
    console.log('Saving hand to log: ', hand_log)
    this.log.push(hand_log)
  }

  SaveLogForLeftOverRiichiSticks() {
    if (!this.IsFinished()) {
      console.warn(`cannot update log for leftover riichi sticks when game state = ${this.state}`)
      return
    }
    this.SanityCheckTotalPoints()
    const hand_log = {
      state: this.state,
      hand: this.current_hand.Clone(),
      players: this.players.Clone(this.ruleset),
      log_type: GameLogType.ASSIGN_LEFT_OVER_RIICHI
    }
    console.log('Saving hand to log for leftover riihci sticks: ', hand_log)
    this.log.push(hand_log)
  }

  // Resets the game state to a finished game at log[log_index]
  ResetToPreviousFinishedHand(log_index: number): boolean {
    if (log_index >= this.log.length) {
      console.warn(
        `cannot reset log: log_index=${log_index} is greater than the log size ${this.log.length}`
      )
      return false
    }
    if (log_index == this.log.length - 1) {
      console.log('do nothing when resetting to the current game, log index = ', log_index)
      return false
    }
    const log_to_reset = this.log[log_index]
    console.log('Resetting to', log_to_reset)
    this.current_hand = log_to_reset.hand
    this.players = log_to_reset.players
    this.state = log_to_reset.state
    this.log = this.log.slice(0, log_index)
    // make a copy and save the current finished hand so that we are ready to move forward
    this.SaveHandLog()
    this.SanityCheckTotalPoints()
    return true
  }

  // Get an object containing points delta occurred in the hand that just finished
  GetLastHandPointsDelta() {
    if (this.log.length > 0) {
      return this.log[this.log.length - 1].hand.results.points_delta
    }
    return {}
  }

  // Get the index of the current hand
  GetCurrentHandIndex() {
    return this.log.length
  }

  // Generate an object for game log for display/export purpose
  GenerateGameLogTable(language: string = Lang.CN) {
    let table = []
    for (let i = 0; i < this.log.length; ++i) {
      const log = this.log[i]
      const hand = log.hand
      const players = log.players
      const last_log = i > 0 ? this.log[i - 1] : null
      const last_hand = last_log ? last_log.hand : null
      const last_hand_players = last_log ? last_log.players : null
      let row = {
        log_index: i,
        start_game_riichi_sticks: last_hand ? last_hand.riichi_sticks : 0,
        hand_signature: null,
        results_summary: null
      }

      if (log.log_type == GameLogType.ASSIGN_LEFT_OVER_RIICHI) {
        if (language == Lang.CN) {
          row.hand_signature = `终局`
          row.results_summary = `供托分配`
        } else if (language == Lang.EN) {
          row.hand_signature = `End Game`
          row.results_summary = `Left over Riichi Sticks`
        }
      } else {
        row.hand_signature = `${WindsDisplayTextMap[hand.round_wind]}${hand.hand}-${hand.honba}`
        row.results_summary = `${HandOutcomeEnumDisplayTextMap[hand.results.outcome][language]}`
        if (
          hand.results.outcome == HandOutcomeEnum.RON ||
          hand.results.outcome == HandOutcomeEnum.TSUMO
        ) {
          for (let i = 0; i < hand.results.han.length; ++i) {
            const han = hand.results.han[i]
            const fu = hand.results.fu[i]
            if (han in PointsLadder) {
              row.results_summary += `[${PointsLadderBriefDisplayMap[han][language]}]`
            } else {
              row.results_summary += `[${han}, ${fu}]`
            }
          }
        } else if (hand.results.outcome == HandOutcomeEnum.CHOMBO) {
          row.hand_signature += `[${ResetChomboHandMsgText(language)}]`
        }
      }
      for (const player_id of PlayerIdsInOrder) {
        const end_hand_pt = players.GetPlayer(player_id).points
        const start_hand_pt = last_hand_players
          ? last_hand_players.GetPlayer(player_id).points
          : this.ruleset.starting_points
        const pt_delta = end_hand_pt - start_hand_pt
        row[player_id] = `${end_hand_pt}`
        if (pt_delta > 0) {
          row[player_id] += `(+${pt_delta})`
        } else if (pt_delta < 0) {
          row[player_id] += `(${pt_delta})`
        }
        if (log.log_type == GameLogType.REGULAR) {
          if (hand.riichi.includes(player_id)) {
            row[player_id] += `[${ActionBriefDisplayMap[Actions.RIICHI][language]}]`
          }
          if (
            hand.results.outcome == HandOutcomeEnum.DRAW &&
            hand.results.tenpai.includes(player_id)
          ) {
            row[player_id] += `[${ActionBriefDisplayMap[Actions.TENPAI][language]}]`
          }
          if (
            (hand.results.outcome == HandOutcomeEnum.TSUMO ||
              hand.results.outcome == HandOutcomeEnum.RON) &&
            hand.results.winner.includes(player_id)
          ) {
            row[player_id] += `[${ActionBriefDisplayMap[Actions.AGARI][language]}]`
          }
          if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
            row[player_id] += `[${ActionBriefDisplayMap[Actions.DEAL_IN][language]}]`
          }
        } else if (log.log_type == GameLogType.CHOMBO) {
          if (hand.results.chombo.includes(player_id)) {
            row[player_id] += `[${ActionBriefDisplayMap[Actions.CHOMBO][language]}]`
          }
        }
      }
      table.push(row)
    }
    return table.reverse()
  }

  // Generate JSON fields for game log headers for export purpose
  GenerateGameLogTableFieldsForExport(language: string = Lang.CN) {
    let fields = {
      [`${HandSignatureTitleText(language)}`]: 'hand_signature',
      [`${StartRiichiStickTitleText(language)}`]: 'start_game_riichi_sticks',
      [`${ResultSummaryTitleText(language)}`]: 'results_summary'
    }
    for (let player_id of PlayerIdsInOrder) {
      fields[this.GetPlayerName(player_id)] = player_id
    }
    return fields
  }

  // Generate file name for exported game log file (without file extension)
  GenerateGameLogFileNameForExport() {
    const now = new Date()
    let result = `${now.getFullYear()}${now.getMonth().toString().padStart(2, '0')}${now.getDay().toString().padStart(2, '0')}`
    result += `-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
    for (let player_id of PlayerIdsInOrder) {
      result += '-' + this.GetPlayerName(player_id)
    }
    return result
  }

  private SanityCheckTotalPoints() {
    const player_total_points = this.players.TotalPoints()
    const onhold_riichi_sticks_points = this.current_hand.riichi_sticks * this.ruleset.riichi_cost
    const expected_total_points = this.ruleset.starting_points * this.ruleset.num_players
    const check_passed = player_total_points + onhold_riichi_sticks_points == expected_total_points
    if (!check_passed)
      console.warn(
        'total points check failed! player total points = ',
        player_total_points,
        ' on hold riichi sticks points = ',
        onhold_riichi_sticks_points,
        ' expected total points = ',
        expected_total_points
      )
  }

  // Validates player starting winds
  private ValidatePlayerStartingWinds(
    player_starting_winds: WindType[],
    ruleset: Ruleset
  ): [boolean, string] {
    if (player_starting_winds.length != ruleset.num_players) {
      return [
        false,
        `${InvalidNumPlayersMsgText(ruleset.language)}: ${JSON.stringify(player_starting_winds)}, ${player_starting_winds.length}, ${ruleset.num_players}`
      ]
    }
    for (let i = 0; i < ruleset.num_players; ++i) {
      const wind = WindsInOrder[i]
      if (!player_starting_winds.includes(wind)) {
        return [
          false,
          `${CannotFindStartingWindMsgText(ruleset.language)}: ${WindsDisplayTextMap[wind]}`
        ]
      }
    }
    return [true, '']
  }

  // Permutes player names to make them in order of winds. Winds must be validated before calling this method.
  private GetPlayerNamesInOrder(
    player_names: string[],
    player_starting_winds: WindType[]
  ): string[] {
    let player_names_in_order = []
    for (let wind of WindsInOrder) {
      player_names_in_order.push(player_names[player_starting_winds.indexOf(wind)])
    }
    return player_names_in_order
  }

  // Assign left over riichi sticks after a game is finsihed.
  // This method requires the game to be finished, and the current_hand will be considered as the last hand.
  private AssignLeftOverRiichiSticks() {
    // do nothing if the game is not yet finished.
    if (!this.IsFinished()) {
      console.log('game not finished, will not assign leftover riichi sticks. Return')
      return
    }
    // Split left-over riichi sticks among top players.
    if (
      this.ruleset.left_over_riichi_sticks == LeftOverRiichiSticks.SPLIT_AMONG_TOP_PLAYERS &&
      this.current_hand.riichi_sticks > 0
    ) {
      let max_pt = undefined
      let top_players = undefined
      for (let wind of WindsInOrder) {
        const pt = this.players.GetPlayer(wind).points
        if (max_pt == undefined || pt > max_pt) {
          max_pt = pt
          top_players = [wind]
        } else if (pt == max_pt) {
          top_players.push(wind)
        }
      }
      const num_top_players = top_players.length
      const leftover_riichi_sticks_points =
        this.current_hand.riichi_sticks * this.ruleset.riichi_cost
      let leftover_riichi_points_delta = {}
      if (num_top_players == 3 && leftover_riichi_sticks_points % 3 != 0) {
        leftover_riichi_points_delta[top_players[0]] = leftover_riichi_sticks_points * 0.4
        leftover_riichi_points_delta[top_players[1]] = leftover_riichi_sticks_points * 0.3
        leftover_riichi_points_delta[top_players[2]] = leftover_riichi_sticks_points * 0.3
      } else {
        for (const player_id of top_players) {
          leftover_riichi_points_delta[player_id] = leftover_riichi_sticks_points / num_top_players
        }
      }
      this.players.ApplyPointsDelta(leftover_riichi_points_delta)
      this.current_hand.riichi_sticks = 0
    }
    this.SaveLogForLeftOverRiichiSticks()
  }
}
