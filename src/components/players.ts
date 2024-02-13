import {Ruleset} from './rulesets.ts';
import {Seat, Winds, NextWindMap} from './seat_constants.ts';

// Use beginning seat as a player's ID
export type PlayerId = Seat;

// Class for a single player
class Player {
  name: string;
  current_wind: Seat;
  points: number;

  constructor(ruleset: Ruleset, player_name: string, seat: Seat) {
    this.name = name;
    this.current_wind = seat;
    this.points = ruleset.starting_points;
  }

  function IsDealer():bool {
    return this.current_wind == Winds.EAST;
  }

  function ApplyPointsDelta(delta: number) {
    points += delta;
  }
}

// Class for all players in a game.
export class Players {
  player_map: Record<PlayerId, Player>;

  constructor(ruleset: Ruleset, player_names: Array<string>) {
    let seat:Seat = Winds.EAST;
    for (let i = 0; i < rulesets.num_players; ++i) {
      this.player_map[seat] = Player(rulesets, player_names[i], seat);
      seat = NextWindMap[seat];
    }
  }

  function NumPlayers(): number {
    return Object.keys(player_map).length;
  }

  function TotalPoints(): number {
    return Object.values(player_map).reduce((accu, player) => accu + player.points, 0);
  }

  function GetPlayerMap(): Record<PlayerId, PlayerId> {
    return player_map;
  }

  function GetPlayer(player_id: PlayerId): Player {
    return player_map[PlayerId];
  }

  function FindDealer(): [PlayerId, Player] {
    for (let [player_id, player] of Object.entries(player_map)) {
      if (player.IsDealer()) {
        return [player_id, player];
      }
    }
    alert(`FindDealer: Failed to find dealer in ${JSON.stringify(player_map)}`);
  }

}
