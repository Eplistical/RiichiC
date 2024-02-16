import { Hand, HandResults } from './hand.ts'
import { Winds } from './seat_constants.ts'
import { Ruleset } from './rulesets.ts'
import { PlayerId, Players } from './players.ts'

export enum GameState {
  NOT_STARTED,
  ON_GOING,
  FINISHED
}

type GameLog = {
  state: GameState
  hand: Hand
  players: Players
}

interface GameInterface {
  ruleset: Ruleset
  player_names: string[]
}

export class Game {
  state: GameState
  ruleset: Ruleset | undefined
  players: Players | undefined
  current_hand: Hand | undefined
  log: GameLog[]

  constructor() {
    this.state = GameState.NOT_STARTED
    this.ruleset = undefined
    this.log = []
  }

  InitGame({ ruleset, player_names }: GameInterface) {
    this.state = GameState.NOT_STARTED
    this.ruleset = ruleset
    this.current_hand = new Hand({
      round_wind: Winds.EAST,
      hand: 1,
      honba: 0,
      riichi_sticks: 0
    })
    this.players = new Players(this.ruleset, player_names)
    this.log = []
  }

  Start() {
    if (this.state != GameState.NOT_STARTED) {
      console.warn(`cannot start the game when it is already started`)
      return
    }
    this.state = GameState.ON_GOING
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
        'finishe game when the current hand is not finished, the current hand will be abandoned.'
      )
      this.current_hand.Abandon(this.players, this.ruleset)
    }
    this.state = GameState.FINISHED
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
    const hand_log = {
      state: this.state,
      hand: this.current_hand.Clone(),
      players: this.players.Clone(this.ruleset)
    }
    console.log('Saving hand to log: ', hand_log)
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
}
