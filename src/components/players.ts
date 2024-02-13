import { Ruleset } from './rulesets.ts'
import { Seat, Winds, NextWindMap } from './seat_constants.ts'

// Use beginning seat as a player's ID
export type PlayerId = Seat

// Class for a single player
class Player {
  name: string
  current_wind: Seat
  points: number

  constructor(ruleset: Ruleset, player_name: string, seat: Seat) {
    this.name = player_name
    this.current_wind = seat
    this.points = ruleset.starting_points
  }

  IsDealer(): boolean {
    return this.current_wind == Winds.EAST
  }

  ApplyPointsDelta(delta: number) {
    this.points += delta
  }
}

// Class for all players in a game.
export class Players {
  player_map: Record<PlayerId, Player>

  constructor(ruleset: Ruleset, player_names: Array<string>) {
    let seat: Seat = Winds.EAST
    for (let i = 0; i < ruleset.num_players; ++i) {
      this.player_map[seat] = new Player(ruleset, player_names[i], seat)
      seat = NextWindMap[seat]
    }
  }

  NumPlayers(): number {
    return Object.keys(this.player_map).length
  }

  TotalPoints(): number {
    return Object.values(this.player_map).reduce((accu, player) => accu + player.points, 0)
  }

  GetPlayerMap(): Record<PlayerId, Player> {
    return this.player_map
  }

  GetPlayer(player_id: PlayerId): Player {
    return this.player_map[player_id]
  }

  FindDealer(): [PlayerId, Player] {
    for (let [player_id, player] of Object.entries(this.player_map)) {
      if (player.IsDealer()) {
        return [player_id, player]
      }
    }
    alert(`FindDealer: Failed to find dealer in ${JSON.stringify(this.player_map)}`)
  }
}
