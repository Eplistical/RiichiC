import { Ruleset } from './rulesets.ts'
import { WindType, Winds, NextWindMap, LastWindMap, WindsInOrder } from './seat_constants.ts'
import { PointsDelta } from './hand.ts'

// Use beginning wind as a player's ID
export type PlayerId = WindType
export const PlayerIdsInOrder = [...WindsInOrder]

// Class for a single player
export class Player {
  name: string
  current_wind: WindType
  points: number

  constructor(ruleset: Ruleset, player_name: string, current_wind: WindType) {
    this.name = player_name
    this.current_wind = current_wind
    this.points = ruleset.starting_points
  }

  Clone(ruleset: Ruleset): Player {
    let clone_instance = new Player(ruleset, this.name, this.current_wind)
    clone_instance.points = this.points
    return clone_instance
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
    this.player_map = {}
    let wind: WindType = Winds.EAST
    for (let i = 0; i < ruleset.num_players; ++i) {
      this.player_map[wind] = new Player(ruleset, player_names[i], wind)
      wind = NextWindMap[wind]
    }
  }

  Clone(ruleset: Ruleset): Players {
    let clone_instance = new Players(
      ruleset,
      this.GetPlayers(PlayerIdsInOrder).map((p) => p.name)
    )
    for (const player_id of PlayerIdsInOrder) {
      clone_instance.player_map[player_id] = this.player_map[player_id].Clone(ruleset)
    }
    return clone_instance
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

  GetPlayer(player_id: PlayerId): Player | undefined {
    if (player_id in this.player_map) {
      return this.player_map[player_id]
    }
    return undefined
  }

  GetPlayers(player_ids: PlayerId[]): Array<Player | undefined> {
    return player_ids.map((id) => this.GetPlayer(id))
  }

  FindDealer(): [PlayerId, Player] {
    for (let [player_id, player] of Object.entries(this.player_map)) {
      if (player.IsDealer()) {
        return [player_id, player]
      }
    }
    alert(`FindDealer: Failed to find dealer in ${JSON.stringify(this.player_map)}`)
  }

  ApplyPointsDelta(points_delta: PointsDelta) {
    for (let [player_id, player] of Object.entries(this.player_map)) {
      if (points_delta.hasOwnProperty(player_id)) {
        player.ApplyPointsDelta(points_delta[player_id])
      }
    }
  }

  ShiftSeats() {
    for (let [player_id, player] of Object.entries(this.player_map)) {
      player.current_wind = LastWindMap[player.current_wind]
    }
  }
}
