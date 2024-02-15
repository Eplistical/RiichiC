import { Hand, HandResults } from "./hand.ts"
import { Winds } from "./seat_constants.ts"
import { Ruleset } from './rulesets.ts'
import { PlayerId, Players } from './players.ts'

export enum GameState {
  NOT_STARTED,
  ON_GOING,
  FINISHED,
}

type GameLog = {
  state: GameState;
  hand: Hand;
  players: Players;
};

interface GameInterface {
  ruleset: Ruleset;
  player_names: string[];
}

export class Game {
  state: GameState;
  ruleset: Ruleset | undefined;
  players: Players | undefined;
  current_hand: Hand | undefined;
  log: GameLog[];

  constructor() {
    this.state = GameState.NOT_STARTED;
    this.ruleset = undefined;
    this.log = [];
  }

  InitGame({ruleset, player_names} : GameInterface) {
    this.state = GameState.NOT_STARTED;
    this.ruleset = ruleset;
    this.current_hand = new Hand({
        round_wind: Winds.EAST,
        hand: 1,
        honba: 0,
        riichi_sticks: 0,
    })
    this.players = new Players(this.ruleset, player_names);
    this.log = [];
  }

  Start() {
    if (this.state != GameState.NOT_STARTED) {
      console.warn(`cannot start the game when it is already started`)
      return ;
    }
    this.state = GameState.ON_GOING;
  }

  PlayerRiichi(player_id: PlayerId) {
    this.current_hand.PlayerRiichi(player_id, this.players, this.ruleset);
  }

  PlayerUnRiichi(player_id: PlayerId) {
    this.current_hand.PlayerUnRiichi(player_id, this.players, this.ruleset);
  }

  Finish() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot finish a game that is not on going`)
      return ;
    }
    if (!this.current_hand.IsFinished()) {
      console.warn("finishe game when the current hand is not finished, the current hand will be abandoned.");
      this.current_hand.Abandon();
    }
    this.state = GameState.FINISHED;
  }

  StartCurrentHand() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update hand state when game state = ${this.state}`)
      return;
    }
    this.current_hand.Start();
  }

  FinishCurrentHand(hand_results: HandResults): boolean {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update hand state when game state = ${this.state}`)
      return false;
    }
    Object.assign(this.current_hand.results, hand_results);
    return this.current_hand.Finish(this.players, this.ruleset);
  }

  SetUpNextHandOrFinishGame() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update hand state when game state = ${this.state}`)
      return;
    }
    // Cannot set up next hand
    const next_hand_info = this.current_hand.SetUpNextHand(this.players, this.ruleset);
    if (next_hand_info === undefined) {
      if (this.current_hand.has_next_hand == false) {
        // the game reaches the end, should finish
        this.Finish();
      } else {
        // there are errors, cannot resolve the next hand
        console.warn('failed to resolve next hand.');
      }
      return;
    }
    // Next hand resolved, apply and shift players' seats if needed.
    const [next_hand, players_should_shift_seats] = next_hand_info;
    this.current_hand = next_hand;
    if (players_should_shift_seats) {
      this.players.ShiftSeats();
    }
  }

  SaveHandLog() {
    if (this.state != GameState.ON_GOING) {
      console.warn(`cannot update log when game state = ${this.state}`)
      return;
    }
    if (!this.current_hand.IsFinished()) {
      console.warn('cannot save hand log, hand is not finished.')
      return ;
    }
    const hand_log ={
      state: this.state,
      hand: this.current_hand.Clone(),
      players: this.players.Clone(this.ruleset),
    }
    this.log.push(hand_log)
  }

  // Resets the game state to a finished game at log[log_index]
  ResetToPreviousFinishedHand(log_index: number) {
    if (log_index >= this.log.length) {
      console.warn(`cannot reset log: log_index=${log_index} is greater than the log size ${this.log.length}`)
      return
    }
    const log_to_reset = this.log[log_index]
    this.current_hand = log_to_reset.hand
    this.players = log_to_reset.players
    this.state = log_to_reset.state
    this.log = this.log.slice(0, log_index);
  }
}
