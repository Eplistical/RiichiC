import { Hand } from "./hand.ts"
import { Winds } from "./seat_constants.ts"
import { Ruleset } from './rulesets.ts'
import { Players } from './players.ts'

enum GameState {
  ON_GOING,
  FINISHED,
}

type GameLog = {
  hand: Hand;
  players: Players;
};

interface GameInterface {
  ruleset: Ruleset;
  player_names: string[];
}

export class Game {
  state: GameState;
  ruleset: Ruleset;
  players: Players;
  current_hand: Hand;
  log: GameLog[];

  constructor({ruleset, player_names} : GameInterface) {
    this.ruleset = ruleset;
    this.current_hand = new Hand({
        round_wind: Winds.EAST,
        hand: 1,
        honba: 0,
        riichi_sticks: 0,
    })
    this.players = new Players(ruleset, player_names);
    this.state = GameState.ON_GOING;
  }

  OnGoing(): boolean {
    return this.state == GameState.ON_GOING;
  }

  Finished(): boolean {
    return this.state == GameState.FINISHED;
  }

  IsAllLast(): boolean{
    return (this.ruleset.last_round_wind == this.current_hand.round_wind && this.current_hand.hand == this.ruleset.num_players);
  }

  Finish() {
    this.state = GameState.FINISHED;
    // TODO
  }

  ResetLog(log_index: number) {
    // TODO
  }

  PlayerRiichi(player_id: number) {
  }

  CancelPlayerRiichi(player_id: number) {
  }

}
