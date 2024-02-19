import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { Winds } from '../seat_constants.ts'
import { Players } from '../players.ts'
import { Ruleset } from '../rulesets.ts'
import { treeEmits } from 'element-plus/es/components/tree-v2/src/virtual-tree.js'
import { RuleTester } from 'eslint'

const ruleset: Ruleset = {
  num_players: 4,
  starting_points: 25000,
  honba_points: 300,
  round_up_mangan: true,
  head_bump: true,
  draw_tenpai_points: 3000,
  riichi_cost: 1000,
  last_round_wind: Winds.SOUTH,
  dealer_tenpai_renchan: true,
  all_last_dealer_win_renchan: true,
  all_last_dealer_tenpai_renchan: true
}

describe('Players', () => {
  it('should construct players correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.name)).toEqual([
      'P1',
      'P2',
      'P3',
      'P4'
    ])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      25000, 25000, 25000, 25000
    ])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.current_wind)).toEqual([
      Winds.EAST,
      Winds.SOUTH,
      Winds.WEST,
      Winds.NORTH
    ])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.IsDealer())).toEqual([
      true,
      false,
      false,
      false
    ])
  })
  it('should get player correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(players.GetPlayer(Winds.EAST).name).toEqual('P1')
    expect(players.GetPlayer(Winds.SOUTH).name).toEqual('P2')
    expect(players.GetPlayer(Winds.WEST).name).toEqual('P3')
    expect(players.GetPlayer(Winds.NORTH).name).toEqual('P4')
  })
  it('should get ordered players correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(
      players.GetPlayers([Winds.EAST, Winds.NORTH, Winds.EAST, Winds.SOUTH]).map((p) => p.name)
    ).toEqual(['P1', 'P4', 'P1', 'P2'])
  })
  it('should return correct players number', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(players.NumPlayers()).toEqual(4)
  })
  it('should return correct total points', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(players.TotalPoints()).toEqual(100000)
  })
  it('should find dealer correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    const [dealer_id, dealer] = players.FindDealer()
    expect(dealer).toBe(players.GetPlayer(Winds.EAST))
  })
  it('should find dealer correctly after switch', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    players.GetPlayer(Winds.EAST).current_wind = Winds.WEST
    players.GetPlayer(Winds.WEST).current_wind = Winds.EAST
    const [dealer_id, dealer] = players.FindDealer()
    expect(dealer).toBe(players.GetPlayer(Winds.WEST))
  })
  it('should apply points delta correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      25000, 25000, 25000, 25000
    ])
    players.ApplyPointsDelta({
      [Winds.EAST]: -1500,
      [Winds.SOUTH]: 500,
      [Winds.WEST]: 500,
      [Winds.NORTH]: -1500
    })
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      23500, 25500, 25500, 23500
    ])
    expect(players.TotalPoints()).toEqual(98000)
  })
  it('should apply points delta correctly for players not exist in points delta', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      25000, 25000, 25000, 25000
    ])
    players.ApplyPointsDelta({
      [Winds.EAST]: -2000,
      [Winds.WEST]: 2000
    })
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      23000, 25000, 27000, 25000
    ])
    expect(players.TotalPoints()).toEqual(100000)
  })
  it('should apply points delta correctly for empty points delta', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      25000, 25000, 25000, 25000
    ])
    players.ApplyPointsDelta({})
    expect(Object.values(players.GetPlayerMap()).map((p) => p.points)).toEqual([
      25000, 25000, 25000, 25000
    ])
    expect(players.TotalPoints()).toEqual(100000)
  })
  it('should shift seats correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    expect(Object.values(players.GetPlayerMap()).map((p) => p.current_wind)).toEqual([
      Winds.EAST,
      Winds.SOUTH,
      Winds.WEST,
      Winds.NORTH
    ])
    expect(players.FindDealer()[1].name).toEqual('P1')

    players.ShiftSeats()
    expect(Object.values(players.GetPlayerMap()).map((p) => p.current_wind)).toEqual([
      Winds.NORTH,
      Winds.EAST,
      Winds.SOUTH,
      Winds.WEST
    ])
    expect(players.FindDealer()[1].name).toEqual('P2')

    players.ShiftSeats()
    expect(Object.values(players.GetPlayerMap()).map((p) => p.current_wind)).toEqual([
      Winds.WEST,
      Winds.NORTH,
      Winds.EAST,
      Winds.SOUTH
    ])
    expect(players.FindDealer()[1].name).toEqual('P3')

    players.ShiftSeats()
    expect(Object.values(players.GetPlayerMap()).map((p) => p.current_wind)).toEqual([
      Winds.SOUTH,
      Winds.WEST,
      Winds.NORTH,
      Winds.EAST
    ])
    expect(players.FindDealer()[1].name).toEqual('P4')

    players.ShiftSeats()
    expect(Object.values(players.GetPlayerMap()).map((p) => p.current_wind)).toEqual([
      Winds.EAST,
      Winds.SOUTH,
      Winds.WEST,
      Winds.NORTH
    ])
    expect(players.FindDealer()[1].name).toEqual('P1')
  })

  it('should clone correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    players.ShiftSeats()
    players.ShiftSeats()
    players.ApplyPointsDelta({
      [Winds.EAST]: 4000,
      [Winds.SOUTH]: -1000,
      [Winds.WEST]: -2000,
      [Winds.NORTH]: -1000
    })
    const clone = players.Clone(ruleset)
    expect(clone).toEqual(players)
    expect(clone).not.toBe(players)
  })

  it('should parse from object correctly', () => {
    let players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])
    players.ShiftSeats()
    players.ShiftSeats()
    players.ApplyPointsDelta({
      [Winds.EAST]: 4000,
      [Winds.SOUTH]: -1000,
      [Winds.WEST]: -2000,
      [Winds.NORTH]: -1000
    })
    const obj = JSON.parse(JSON.stringify(players))
    const parsed = Players.ParseFromObject(ruleset, obj)
    expect(parsed).toEqual(players)
    expect(parsed).not.toBe(players)
  })
})
