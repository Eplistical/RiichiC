import { beforeEach, describe, it, expect } from 'vitest'

import { Winds, WindsInOrder } from '../seat_constants.ts'
import { LeftOverRiichiSticks, Ruleset } from '../rulesets.ts'
import { HandOutcomeEnum, HandResults, Hand, HandState } from '../hand.ts'
import { PlayerId, PlayerIdsInOrder, Players } from '../players.ts'
import { PointsLadder, RonPointsDealer } from '../game_constants.ts'

let ruleset: Ruleset
let players: Players
let hand: Hand
let hand_results: HandResults

beforeEach(() => {
  ruleset = {
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

  players = new Players(ruleset, ['P1', 'P2', 'P3', 'P4'])

  hand = new Hand({
    round_wind: Winds.EAST,
    hand: 1,
    honba: 0,
    riichi_sticks: 0
  })

  hand_results = {
    outcome: undefined,
    tenpai: [],
    winner: undefined,
    deal_in: undefined,
    han: undefined,
    fu: undefined
  }
})

describe('Hand Construction', () => {
  it('should assign correct default values', () => {
    hand = new Hand({
      round_wind: Winds.EAST,
      hand: 1,
      honba: 0,
      riichi_sticks: 0
    })
    expect(hand.IsNotStarted()).toBe(true)
    expect(hand.round_wind).toEqual(Winds.EAST)
    expect(hand.hand).toBe(1)
    expect(hand.riichi).toEqual([])
    expect(hand.riichi_sticks).toEqual(0)
    expect(hand.has_next_hand).toEqual(true)
    expect(hand.results).toEqual({
      outcome: null
    })
  })
})

describe('Hand Start', () => {
  it('should work for an unstarted hand', () => {
    hand.state = HandState.NOT_STARTED
    hand.Start()
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should do nothing for an on-going hand', () => {
    hand.state = HandState.ON_GOING
    hand.Start()
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should do nothing for a finished hand', () => {
    hand.state = HandState.FINISHED
    hand.Start()
    expect(hand.IsFinished()).toBe(true)
  })
  it('should do nothing for an abandoned hand', () => {
    hand.state = HandState.ABANDONED
    hand.Start()
    expect(hand.IsAbandoned()).toBe(true)
  })
})

describe('Hand Works On Riichi Event', () => {
  it('should work for player riichi', () => {
    hand.PlayerRiichi(Winds.EAST, players, ruleset)
    expect(hand.riichi_sticks).toEqual(1)
    expect(hand.riichi).toHaveLength(1)
    expect(hand.riichi).toEqual([Winds.EAST])
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000)

    hand.PlayerRiichi(Winds.WEST, players, ruleset)
    expect(hand.riichi_sticks).toEqual(2)
    expect(hand.riichi).toHaveLength(2)
    expect(hand.riichi).toEqual([Winds.EAST, Winds.WEST])
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000)
  })
  it("should do nothing on riichi when a player has already riichi'ed ", () => {
    hand.PlayerRiichi(Winds.EAST, players, ruleset)
    expect(hand.riichi_sticks).toEqual(1)
    expect(hand.riichi).toHaveLength(1)
    expect(hand.riichi).toEqual([Winds.EAST])
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000)

    hand.PlayerRiichi(Winds.EAST, players, ruleset)
    expect(hand.riichi_sticks).toEqual(1)
    expect(hand.riichi).toHaveLength(1)
    expect(hand.riichi).toEqual([Winds.EAST])
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000)
  })
  it('should work for player unriichi', () => {
    hand.PlayerRiichi(Winds.SOUTH, players, ruleset)
    hand.PlayerRiichi(Winds.NORTH, players, ruleset)
    expect(hand.riichi_sticks).toEqual(2)
    expect(hand.riichi).toHaveLength(2)
    expect(hand.riichi).toEqual([Winds.SOUTH, Winds.NORTH])
    expect(players.GetPlayer(Winds.SOUTH).points).toEqual(24000)
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000)

    hand.PlayerUnRiichi(Winds.SOUTH, players, ruleset)
    expect(hand.riichi_sticks).toEqual(1)
    expect(hand.riichi).toHaveLength(1)
    expect(hand.riichi).toEqual([Winds.NORTH])
    expect(players.GetPlayer(Winds.SOUTH).points).toEqual(25000)
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000)

    hand.PlayerUnRiichi(Winds.NORTH, players, ruleset)
    expect(hand.riichi_sticks).toEqual(0)
    expect(hand.riichi).toHaveLength(0)
    expect(hand.riichi).toEqual([])
    expect(players.GetPlayer(Winds.SOUTH).points).toEqual(25000)
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(25000)
  })
  it('should do nothing on unriichi for a player that does not riichi', () => {
    hand.PlayerRiichi(Winds.NORTH, players, ruleset)
    expect(hand.riichi_sticks).toEqual(1)
    expect(hand.riichi).toHaveLength(1)
    expect(hand.riichi).toEqual([Winds.NORTH])
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000)

    hand.PlayerUnRiichi(Winds.EAST, players, ruleset)
    expect(hand.riichi_sticks).toEqual(1)
    expect(hand.riichi).toHaveLength(1)
    expect(hand.riichi).toEqual([Winds.NORTH])
    expect(players.GetPlayer(Winds.EAST).points).toEqual(25000)
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000)
  })
})

describe('Hand Check All Last', () => {
  it('should work correctly', () => {
    hand.round_wind = Winds.EAST
    hand.hand = 1
    hand.honba = 0
    expect(hand.IsAllLast(ruleset)).toEqual(false)

    hand.round_wind = Winds.SOUTH
    hand.hand = 2
    hand.honba = 3
    expect(hand.IsAllLast(ruleset)).toEqual(false)

    hand.round_wind = Winds.SOUTH
    hand.hand = 4
    hand.honba = 0
    expect(hand.IsAllLast(ruleset)).toEqual(true)

    hand.round_wind = Winds.SOUTH
    hand.hand = 4
    hand.honba = 3
    expect(hand.IsAllLast(ruleset)).toEqual(true)
  })
})

describe('Hand Set Up Next Hand', () => {
  it('should ignore unfinished hand', () => {
    hand.state = HandState.NOT_STARTED
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    hand.state = HandState.ON_GOING
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
  })
  it('should ignore when no more future hands', () => {
    hand.has_next_hand = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
  })
  it('should work for draw dealer tenpai', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.EAST,
      hand: 1,
      honba: 0,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: [Winds.EAST]
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 1,
        honba: 1,
        riichi_sticks: 0
      })
    )
  })
  it('should work for draw dealer noten', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.EAST,
      hand: 3,
      honba: 2,
      riichi_sticks: 2,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: [Winds.SOUTH]
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 4,
        honba: 3,
        riichi_sticks: 2
      })
    )
  })
  it('should work for dealer ron', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 1,
      honba: 1,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.SOUTH,
        han: 3,
        fu: 30
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 1,
        honba: 2,
        riichi_sticks: 0
      })
    )
  })
  it('should work for non-dealer ron', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 3,
      honba: 3,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.NORTH,
        deal_in: Winds.WEST,
        han: 2,
        fu: 25
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 0,
        riichi_sticks: 0
      })
    )
  })
  it('should work for dealer tsumo', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.EAST,
      hand: 2,
      honba: 5,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: PointsLadder.HANEMAN
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 2,
        honba: 6,
        riichi_sticks: 0
      })
    )
  })
  it('should work for non-dealer tsumo', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.EAST,
      hand: 3,
      honba: 0,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.SOUTH,
        han: 4,
        fu: 20
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 4,
        honba: 0,
        riichi_sticks: 0
      })
    )
  })

  it('should work for last hand in a round', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.EAST,
      hand: 4,
      honba: 2,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.NORTH,
        han: 2,
        fu: 40
      }
    })
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 1,
        honba: 0,
        riichi_sticks: 0
      })
    )
  })

  it('should work for all last draw dealer tenpai', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 4,
      honba: 0,
      riichi_sticks: 3,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: [Winds.EAST]
      }
    })

    hand.has_next_hand = true
    ruleset.all_last_dealer_tenpai_renchan = true
    let [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 1,
        riichi_sticks: 3
      })
    )
    expect(hand.has_next_hand).toEqual(true)

    ruleset.all_last_dealer_tenpai_renchan = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)
  })

  it('should work for all last draw dealer noten', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 4,
      honba: 0,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: [Winds.WEST, Winds.SOUTH, Winds.NORTH]
      }
    })

    hand.has_next_hand = true
    ruleset.all_last_dealer_tenpai_renchan = true
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)

    hand.has_next_hand = true
    ruleset.all_last_dealer_tenpai_renchan = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)
  })

  it('should work for all last draw dealer ron', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 4,
      honba: 1,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.NORTH,
        han: 3,
        fu: 40
      }
    })

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = true
    let [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 2,
        riichi_sticks: 0
      })
    )
    expect(hand.has_next_hand).toEqual(true)

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)
  })
  it('should work for all last draw non-dealer ron', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 4,
      honba: 0,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.SOUTH,
        deal_in: Winds.EAST,
        han: 1,
        fu: 30
      }
    })

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = true
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)
  })
  it('should work for all last draw dealer tsumo', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 4,
      honba: 3,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: PointsLadder.BAIMAN
      }
    })

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = true
    let [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset)
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 4,
        riichi_sticks: 0
      })
    )
    expect(hand.has_next_hand).toEqual(true)

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)
  })
  it('should work for all last draw non-dealer tsumo', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 4,
      honba: 3,
      riichi_sticks: 0,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.NORTH,
        deal_in: Winds.WEST,
        han: 4,
        fu: 30
      }
    })

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = true
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)

    hand.has_next_hand = true
    ruleset.all_last_dealer_win_renchan = false
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined)
    expect(hand.has_next_hand).toEqual(false)
  })
})

describe('Hand Finish', () => {
  it.each([
    { state: HandState.NOT_STARTED },
    { state: HandState.FINISHED },
    { state: HandState.ABANDONED }
  ])('should ignore a hand that not on-going', ({ state }) => {
    Object.assign(hand, {
      state: state
    })
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.state).toEqual(state)
  })
  it('should reject undefined outcome', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: undefined
      }
    })
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it.each([
    { riichi: [Winds.EAST], tenpai: undefined },
    { riichi: [Winds.EAST], tenpai: [] },
    { riichi: [Winds.EAST], tenpai: [Winds.SOUTH] },
    { riichi: [Winds.EAST, Winds.SOUTH], tenpai: [Winds.EAST] },
    { riichi: [Winds.EAST, Winds.SOUTH], tenpai: [Winds.EAST, Winds.WEST, Winds.NORTH] },
    { riichi: [Winds.EAST, Winds.SOUTH, Winds.WEST], tenpai: [Winds.EAST, Winds.WEST, Winds.NORTH] }
  ])('should reject riichi noten on draw $riichi $tenpai', ({ riichi, tenpai }) => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi: riichi
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: tenpai
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it.each([
    { riichi: [], tenpai: undefined },
    { riichi: [], tenpai: [] },
    { riichi: [Winds.EAST], tenpai: [Winds.EAST] },
    { riichi: [Winds.EAST], tenpai: [Winds.EAST, Winds.SOUTH] },
    { riichi: [Winds.EAST, Winds.WEST], tenpai: [Winds.EAST, Winds.SOUTH, Winds.WEST] }
  ])('should accept valid draw results $riichi $tenpai', ({ riichi, tenpai }) => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi: riichi
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: tenpai
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
  })
  it('should reject undefined winner on ron', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: undefined,
      deal_in: Winds.EAST,
      han: 3,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.winner
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject undefined deal in on ron', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.EAST,
      deal_in: undefined,
      han: 3,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.deal_in
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject undefined han on ron', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.NORTH,
      han: undefined,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.han
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject invalid han on ron', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.NORTH,
      han: 5000,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject invalid fu on ron', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.NORTH,
      han: 2,
      fu: 35
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject undefined fu with small han on ron', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.NORTH,
      han: 3,
      fu: undefined
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.fu
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it.each([
    { han: 3, fu: 20 },
    { han: 1, fu: 20 },
    { han: 1, fu: 25 }
  ])('should reject bad han-fu pair on ron $han $fu', ({ han, fu }) => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.NORTH,
      han: han,
      fu: fu
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject undefined winner on tsumo', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: undefined,
      han: 3,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.winner
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject undefined han on tsumo', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.WEST,
      han: undefined,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.han
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject invalid han on tsumo', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.WEST,
      han: -1,
      fu: 30
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject undefined fu with small han on tsumo', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.WEST,
      han: 1,
      fu: undefined
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)

    delete hand_results.fu
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
  it('should reject invalid fu on tsumo', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.WEST,
      han: 3,
      fu: 90
    }
    expect(hand.Finish(hand_results, players, ruleset)).toEqual(false)
    expect(hand.IsOngoing()).toBe(true)
  })
})

describe('Hand Finish Applies Points Delta When Draw', () => {
  it(`on nobody tenpai`, () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [],
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      expect(players.GetPlayer(player_id).points).toEqual(25000)
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { tenpai: [Winds.EAST] },
    { tenpai: [Winds.SOUTH] },
    { tenpai: [Winds.WEST] },
    { tenpai: [Winds.NORTH] }
  ])(`on one person tenpai $tenpai`, ({ tenpai }) => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: tenpai,
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (tenpai.includes(player_id)) {
        hand_results.points_delta[player_id] = 3000
        expect(players.GetPlayer(player_id).points).toEqual(28000)
      } else {
        hand_results.points_delta[player_id] = -1000
        expect(players.GetPlayer(player_id).points).toEqual(24000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { tenpai: [Winds.EAST, Winds.SOUTH] },
    { tenpai: [Winds.EAST, Winds.WEST] },
    { tenpai: [Winds.EAST, Winds.NORTH] },
    { tenpai: [Winds.SOUTH, Winds.WEST] },
    { tenpai: [Winds.SOUTH, Winds.NORTH] },
    { tenpai: [Winds.WEST, Winds.NORTH] }
  ])(`on two person tenpai $tenpai`, ({ tenpai }) => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: tenpai,
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (tenpai.includes(player_id)) {
        hand_results.points_delta[player_id] = 1500
        expect(players.GetPlayer(player_id).points).toEqual(26500)
      } else {
        hand_results.points_delta[player_id] = -1500
        expect(players.GetPlayer(player_id).points).toEqual(23500)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { tenpai: [Winds.EAST, Winds.SOUTH, Winds.WEST] },
    { tenpai: [Winds.EAST, Winds.SOUTH, Winds.NORTH] },
    { tenpai: [Winds.EAST, Winds.WEST, Winds.NORTH] },
    { tenpai: [Winds.SOUTH, Winds.WEST, Winds.NORTH] }
  ])(`on two person tenpai $tenpai`, ({ tenpai }) => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: tenpai,
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (tenpai.includes(player_id)) {
        hand_results.points_delta[player_id] = 1000
        expect(players.GetPlayer(player_id).points).toEqual(26000)
      } else {
        hand_results.points_delta[player_id] = -3000
        expect(players.GetPlayer(player_id).points).toEqual(22000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it(`on everybody tenpai`, () => {
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH],
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      expect(players.GetPlayer(player_id).points).toEqual(25000)
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it(`ignores honba`, () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: 3
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST],
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (player_id == Winds.EAST) {
        hand_results.points_delta[player_id] = 3000
        expect(players.GetPlayer(player_id).points).toEqual(28000)
      } else {
        hand_results.points_delta[player_id] = -1000
        expect(players.GetPlayer(player_id).points).toEqual(24000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
    expect(hand.honba).toEqual(3)
  })

  it(`ignores riichi sticks`, () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi_sticks: 3
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST],
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (player_id == Winds.EAST) {
        hand_results.points_delta[player_id] = 3000
        expect(players.GetPlayer(player_id).points).toEqual(28000)
      } else {
        hand_results.points_delta[player_id] = -1000
        expect(players.GetPlayer(player_id).points).toEqual(24000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
    expect(hand.riichi_sticks).toEqual(3)
  })

  it(`respects points on draw tenpai`, () => {
    ruleset.draw_tenpai_points = 6000
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST],
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (player_id == Winds.EAST) {
        hand_results.points_delta[player_id] = 6000
        expect(players.GetPlayer(player_id).points).toEqual(31000)
      } else {
        hand_results.points_delta[player_id] = -2000
        expect(players.GetPlayer(player_id).points).toEqual(23000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })
})

describe.each([{ deal_in: Winds.SOUTH }, { deal_in: Winds.WEST }, { deal_in: Winds.NORTH }])(
  'Hand Finish Applies Points Delta When Dealer Ron $deal_in',
  ({ deal_in }) => {
    it.each([
      { han: 1, fu: 30, expected_delta: 1500 },
      { han: 1, fu: 40, expected_delta: 2000 },
      { han: 1, fu: 50, expected_delta: 2400 },
      { han: 1, fu: 60, expected_delta: 2900 },
      { han: 1, fu: 70, expected_delta: 3400 },
      { han: 1, fu: 80, expected_delta: 3900 },
      { han: 1, fu: 90, expected_delta: 4400 },
      { han: 1, fu: 100, expected_delta: 4800 },
      { han: 1, fu: 110, expected_delta: 5300 },
      { han: 2, fu: 25, expected_delta: 2400 },
      { han: 2, fu: 30, expected_delta: 2900 },
      { han: 2, fu: 40, expected_delta: 3900 },
      { han: 2, fu: 50, expected_delta: 4800 },
      { han: 2, fu: 60, expected_delta: 5800 },
      { han: 2, fu: 70, expected_delta: 6800 },
      { han: 2, fu: 80, expected_delta: 7700 },
      { han: 2, fu: 90, expected_delta: 8700 },
      { han: 2, fu: 100, expected_delta: 9600 },
      { han: 2, fu: 110, expected_delta: 10600 },
      { han: 3, fu: 25, expected_delta: 4800 },
      { han: 3, fu: 30, expected_delta: 5800 },
      { han: 3, fu: 40, expected_delta: 7700 },
      { han: 3, fu: 50, expected_delta: 9600 },
      { han: 3, fu: 60, expected_delta: 11600 },
      { han: 4, fu: 25, expected_delta: 9600 },
      { han: 4, fu: 30, expected_delta: 11600 },
      { han: PointsLadder.MANGAN, fu: undefined, expected_delta: 12000 },
      { han: PointsLadder.HANEMAN, fu: undefined, expected_delta: 18000 },
      { han: PointsLadder.BAIMAN, fu: undefined, expected_delta: 24000 },
      { han: PointsLadder.SANBAIMAN, fu: undefined, expected_delta: 36000 },
      { han: PointsLadder.YAKUMAN, fu: undefined, expected_delta: 48000 }
    ])(`on $han, $fu`, ({ han, fu, expected_delta }) => {
      ruleset.round_up_mangan = false
      Object.assign(hand, {
        state: HandState.ON_GOING
      })
      hand_results = {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: deal_in,
        han: han,
        fu: fu,
        points_delta: {}
      }
      expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
      expect(hand.IsFinished()).toBe(true)
      for (const player_id of PlayerIdsInOrder) {
        if (player_id == Winds.EAST) {
          expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_delta)
          hand_results.points_delta[player_id] = expected_delta
        } else if (player_id == deal_in) {
          expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_delta)
          hand_results.points_delta[player_id] = -expected_delta
        } else {
          expect(players.GetPlayer(player_id).points).toEqual(25000)
        }
      }
      expect(hand.results).toEqual(hand_results)
      expect(hand.results).not.toBe(hand_results)
    })

    it.each([
      { han: 4, fu: 30, expected_delta: 12000 },
      { han: 3, fu: 60, expected_delta: 12000 }
    ])(`respect round-up mangan on [$han, $fu]`, ({ han, fu, expected_delta }) => {
      ruleset.round_up_mangan = true
      Object.assign(hand, {
        state: HandState.ON_GOING
      })
      hand_results = {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: deal_in,
        han: han,
        fu: fu
      }
      expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
      expect(hand.IsFinished()).toBe(true)
      for (const player_id of PlayerIdsInOrder) {
        if (player_id == Winds.EAST) {
          expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_delta)
        } else if (player_id == deal_in) {
          expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_delta)
        } else {
          expect(players.GetPlayer(player_id).points).toEqual(25000)
        }
      }
      expect(hand.results).toEqual(
        expect.objectContaining({
          outcome: hand_results.outcome,
          winner: hand_results.winner,
          deal_in: hand_results.deal_in,
          han: PointsLadder.MANGAN
        })
      )
      expect(hand.results).not.toBe(hand_results)
    })

    it.each([
      { han: 1, fu: 40, honba: 1, honba_points: 300, expected_delta: 2300 },
      {
        han: PointsLadder.HANEMAN,
        fu: undefined,
        honba: 3,
        honba_points: 300,
        expected_delta: 18900
      },
      { han: 1, fu: 40, honba: 1, honba_points: 1500, expected_delta: 3500 },
      {
        han: PointsLadder.HANEMAN,
        fu: undefined,
        honba: 3,
        honba_points: 1500,
        expected_delta: 22500
      }
    ])(
      `respect honba [$honba, $honba_points]`,
      ({ han, fu, honba, honba_points, expected_delta }) => {
        ruleset.honba_points = honba_points
        Object.assign(hand, {
          state: HandState.ON_GOING,
          honba: honba
        })
        hand_results = {
          outcome: HandOutcomeEnum.RON,
          winner: Winds.EAST,
          deal_in: deal_in,
          han: han,
          fu: fu,
          points_delta: {}
        }
        expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
        expect(hand.IsFinished()).toBe(true)
        for (const player_id of PlayerIdsInOrder) {
          if (player_id == Winds.EAST) {
            hand_results.points_delta[player_id] = expected_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_delta)
          } else if (player_id == deal_in) {
            hand_results.points_delta[player_id] = -expected_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_delta)
          } else {
            expect(players.GetPlayer(player_id).points).toEqual(25000)
          }
        }
        expect(hand.results).toEqual(hand_results)
        expect(hand.results).not.toBe(hand_results)
        expect(hand.honba).toEqual(honba)
      }
    )

    it.each([
      {
        han: 1,
        fu: 40,
        riichi_sticks: 1,
        riichi_cost: 1000,
        expected_winner_delta: 3000,
        expected_deal_in_delta: 2000
      },
      {
        han: PointsLadder.HANEMAN,
        fu: undefined,
        riichi_sticks: 3,
        riichi_cost: 1000,
        expected_winner_delta: 21000,
        expected_deal_in_delta: 18000
      },
      {
        han: 1,
        fu: 40,
        riichi_sticks: 1,
        riichi_cost: 500,
        expected_winner_delta: 2500,
        expected_deal_in_delta: 2000
      },
      {
        han: PointsLadder.HANEMAN,
        fu: undefined,
        riichi_sticks: 3,
        riichi_cost: 500,
        expected_winner_delta: 19500,
        expected_deal_in_delta: 18000
      }
    ])(
      `respect riichi sticks [$riichi_sticks, $riichi_cost]`,
      ({ han, fu, riichi_sticks, riichi_cost, expected_winner_delta, expected_deal_in_delta }) => {
        ruleset.riichi_cost = riichi_cost
        Object.assign(hand, {
          state: HandState.ON_GOING,
          riichi_sticks: riichi_sticks
        })
        hand_results = {
          outcome: HandOutcomeEnum.RON,
          winner: Winds.EAST,
          deal_in: deal_in,
          han: han,
          fu: fu,
          points_delta: {}
        }
        expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
        expect(hand.IsFinished()).toBe(true)
        for (const player_id of PlayerIdsInOrder) {
          if (player_id == Winds.EAST) {
            hand_results.points_delta[player_id] = expected_winner_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_winner_delta)
          } else if (player_id == deal_in) {
            hand_results.points_delta[player_id] = -expected_deal_in_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_deal_in_delta)
          } else {
            expect(players.GetPlayer(player_id).points).toEqual(25000)
          }
        }
        expect(hand.results).toEqual(hand_results)
        expect(hand.results).not.toBe(hand_results)
        expect(hand.riichi_sticks).toEqual(0)
      }
    )
  }
)

describe('Hand Finish Applies Points Delta When Dealer Tsumo', () => {
  it.each([
    { han: 1, fu: 30, expected_delta: 500 },
    { han: 1, fu: 40, expected_delta: 700 },
    { han: 1, fu: 50, expected_delta: 800 },
    { han: 1, fu: 60, expected_delta: 1000 },
    { han: 1, fu: 70, expected_delta: 1200 },
    { han: 1, fu: 80, expected_delta: 1300 },
    { han: 1, fu: 90, expected_delta: 1500 },
    { han: 1, fu: 100, expected_delta: 1600 },
    { han: 1, fu: 110, expected_delta: 1800 },
    { han: 2, fu: 20, expected_delta: 700 },
    { han: 2, fu: 30, expected_delta: 1000 },
    { han: 2, fu: 40, expected_delta: 1300 },
    { han: 2, fu: 50, expected_delta: 1600 },
    { han: 2, fu: 60, expected_delta: 2000 },
    { han: 2, fu: 70, expected_delta: 2300 },
    { han: 2, fu: 80, expected_delta: 2600 },
    { han: 2, fu: 90, expected_delta: 2900 },
    { han: 2, fu: 100, expected_delta: 3200 },
    { han: 3, fu: 20, expected_delta: 1300 },
    { han: 3, fu: 25, expected_delta: 1600 },
    { han: 3, fu: 30, expected_delta: 2000 },
    { han: 3, fu: 40, expected_delta: 2600 },
    { han: 3, fu: 50, expected_delta: 3200 },
    { han: 3, fu: 60, expected_delta: 3900 },
    { han: 4, fu: 20, expected_delta: 2600 },
    { han: 4, fu: 25, expected_delta: 3200 },
    { han: 4, fu: 30, expected_delta: 3900 },
    { han: PointsLadder.MANGAN, fu: undefined, expected_delta: 4000 },
    { han: PointsLadder.HANEMAN, fu: undefined, expected_delta: 6000 },
    { han: PointsLadder.BAIMAN, fu: undefined, expected_delta: 8000 },
    { han: PointsLadder.SANBAIMAN, fu: undefined, expected_delta: 12000 },
    { han: PointsLadder.YAKUMAN, fu: undefined, expected_delta: 16000 }
  ])(`on $han, $fu`, ({ han, fu, expected_delta }) => {
    ruleset.round_up_mangan = false
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: han,
      fu: fu,
      points_delta: {
        [Winds.EAST]: expected_delta * 3,
        [Winds.SOUTH]: -expected_delta,
        [Winds.WEST]: -expected_delta,
        [Winds.NORTH]: -expected_delta
      }
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    expect(players.GetPlayers(PlayerIdsInOrder).map((p) => p.points)).toEqual([
      ruleset.starting_points + expected_delta * 3,
      ruleset.starting_points - expected_delta,
      ruleset.starting_points - expected_delta,
      ruleset.starting_points - expected_delta
    ])
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { han: 3, fu: 60, expected_delta: 4000 },
    { han: 4, fu: 30, expected_delta: 4000 }
  ])(`respects round up mangan on $han, $fu`, ({ han, fu, expected_delta }) => {
    ruleset.round_up_mangan = true
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: han,
      fu: fu,
      points_delta: {
        [Winds.EAST]: expected_delta * 3,
        [Winds.SOUTH]: -expected_delta,
        [Winds.WEST]: -expected_delta,
        [Winds.NORTH]: -expected_delta
      }
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    expect(players.GetPlayers(PlayerIdsInOrder).map((p) => p.points)).toEqual([
      ruleset.starting_points + expected_delta * 3,
      ruleset.starting_points - expected_delta,
      ruleset.starting_points - expected_delta,
      ruleset.starting_points - expected_delta
    ])
    expect(hand.results).toEqual({
      outcome: hand_results.outcome,
      winner: hand_results.winner,
      han: PointsLadder.MANGAN,
      points_delta: hand_results.points_delta
    })
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { han: 2, fu: 30, honba: 1, honba_points: 300, expected_delta: 1100 },
    { han: PointsLadder.MANGAN, honba: 3, honba_points: 300, expected_delta: 4300 },
    { han: 2, fu: 30, honba: 1, honba_points: 1500, expected_delta: 1500 },
    { han: PointsLadder.MANGAN, honba: 3, honba_points: 1500, expected_delta: 5500 }
  ])(`respects honba $honba, $honba_points`, ({ han, fu, honba, honba_points, expected_delta }) => {
    ruleset.honba_points = honba_points
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: honba
    })
    hand_results = {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: han,
      fu: fu,
      points_delta: {
        [Winds.EAST]: expected_delta * 3,
        [Winds.SOUTH]: -expected_delta,
        [Winds.WEST]: -expected_delta,
        [Winds.NORTH]: -expected_delta
      }
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    expect(players.GetPlayers(PlayerIdsInOrder).map((p) => p.points)).toEqual([
      ruleset.starting_points + expected_delta * 3,
      ruleset.starting_points - expected_delta,
      ruleset.starting_points - expected_delta,
      ruleset.starting_points - expected_delta
    ])
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
    expect(hand.honba).toEqual(honba)
  })

  it.each([
    {
      han: 2,
      fu: 30,
      riichi_sticks: 1,
      riichi_cost: 1000,
      expected_winner_delta: 4000,
      expected_others_delta: 1000
    },
    {
      han: PointsLadder.MANGAN,
      riichi_sticks: 3,
      riichi_cost: 1000,
      expected_winner_delta: 15000,
      expected_others_delta: 4000
    },
    {
      han: 2,
      fu: 30,
      riichi_sticks: 1,
      riichi_cost: 500,
      expected_winner_delta: 3500,
      expected_others_delta: 1000
    },
    {
      han: PointsLadder.MANGAN,
      riichi_sticks: 3,
      riichi_cost: 500,
      expected_winner_delta: 13500,
      expected_others_delta: 4000
    }
  ])(
    `respects riichi sticks $riichi_sticks, $riichi_cost`,
    ({
      han,
      fu,
      honba,
      riichi_sticks,
      riichi_cost,
      expected_winner_delta,
      expected_others_delta
    }) => {
      ruleset.riichi_cost = riichi_cost
      Object.assign(hand, {
        state: HandState.ON_GOING,
        riichi_sticks
      })
      hand_results = {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: han,
        fu: fu,
        points_delta: {
          [Winds.EAST]: expected_winner_delta,
          [Winds.SOUTH]: -expected_others_delta,
          [Winds.WEST]: -expected_others_delta,
          [Winds.NORTH]: -expected_others_delta
        }
      }
      expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
      expect(hand.IsFinished()).toBe(true)
      expect(players.GetPlayers(PlayerIdsInOrder).map((p) => p.points)).toEqual([
        ruleset.starting_points + expected_winner_delta,
        ruleset.starting_points - expected_others_delta,
        ruleset.starting_points - expected_others_delta,
        ruleset.starting_points - expected_others_delta
      ])
      expect(hand.results).toEqual(hand_results)
      expect(hand.results).not.toBe(hand_results)
      expect(hand.riichi_sticks).toEqual(0)
    }
  )
})

describe.each([
  { winner: Winds.SOUTH, deal_in: Winds.EAST },
  { winner: Winds.SOUTH, deal_in: Winds.WEST },
  { winner: Winds.SOUTH, deal_in: Winds.NORTH },
  { winner: Winds.WEST, deal_in: Winds.EAST },
  { winner: Winds.WEST, deal_in: Winds.SOUTH },
  { winner: Winds.WEST, deal_in: Winds.NORTH },
  { winner: Winds.NORTH, deal_in: Winds.EAST },
  { winner: Winds.NORTH, deal_in: Winds.SOUTH },
  { winner: Winds.NORTH, deal_in: Winds.WEST }
])('Hand Finish Applies Points Delta When Non-Dealer Ron', ({ winner, deal_in }) => {
  it.each([
    { han: 1, fu: 30, expected_delta: 1000 },
    { han: 1, fu: 40, expected_delta: 1300 },
    { han: 1, fu: 50, expected_delta: 1600 },
    { han: 1, fu: 60, expected_delta: 2000 },
    { han: 1, fu: 70, expected_delta: 2300 },
    { han: 1, fu: 80, expected_delta: 2600 },
    { han: 1, fu: 90, expected_delta: 2900 },
    { han: 1, fu: 100, expected_delta: 3200 },
    { han: 1, fu: 110, expected_delta: 3600 },
    { han: 2, fu: 25, expected_delta: 1600 },
    { han: 2, fu: 30, expected_delta: 2000 },
    { han: 2, fu: 40, expected_delta: 2600 },
    { han: 2, fu: 50, expected_delta: 3200 },
    { han: 2, fu: 60, expected_delta: 3900 },
    { han: 2, fu: 70, expected_delta: 4500 },
    { han: 2, fu: 80, expected_delta: 5200 },
    { han: 2, fu: 90, expected_delta: 5800 },
    { han: 2, fu: 100, expected_delta: 6400 },
    { han: 2, fu: 110, expected_delta: 7100 },
    { han: 3, fu: 25, expected_delta: 3200 },
    { han: 3, fu: 30, expected_delta: 3900 },
    { han: 3, fu: 40, expected_delta: 5200 },
    { han: 3, fu: 50, expected_delta: 6400 },
    { han: 3, fu: 60, expected_delta: 7700 },
    { han: 4, fu: 25, expected_delta: 6400 },
    { han: 4, fu: 30, expected_delta: 7700 },
    { han: PointsLadder.MANGAN, fu: undefined, expected_delta: 8000 },
    { han: PointsLadder.HANEMAN, fu: undefined, expected_delta: 12000 },
    { han: PointsLadder.BAIMAN, fu: undefined, expected_delta: 16000 },
    { han: PointsLadder.SANBAIMAN, fu: undefined, expected_delta: 24000 },
    { han: PointsLadder.YAKUMAN, fu: undefined, expected_delta: 32000 }
  ])(`on $han, $fu`, ({ han, fu, expected_delta }) => {
    ruleset.round_up_mangan = false
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: winner,
      deal_in: deal_in,
      han: han,
      fu: fu,
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (player_id == winner) {
        hand_results.points_delta[player_id] = expected_delta
        expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_delta)
      } else if (player_id == deal_in) {
        hand_results.points_delta[player_id] = -expected_delta
        expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_delta)
      } else {
        expect(players.GetPlayer(player_id).points).toEqual(25000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { han: 3, fu: 60, expected_delta: 8000 },
    { han: 4, fu: 30, expected_delta: 8000 }
  ])(`respects round-up mangan $han, $fu`, ({ han, fu, expected_delta }) => {
    ruleset.round_up_mangan = true
    Object.assign(hand, {
      state: HandState.ON_GOING
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: winner,
      deal_in: deal_in,
      han: han,
      fu: fu,
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (player_id == winner) {
        hand_results.points_delta[player_id] = expected_delta
        expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_delta)
      } else if (player_id == deal_in) {
        hand_results.points_delta[player_id] = -expected_delta
        expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_delta)
      } else {
        expect(players.GetPlayer(player_id).points).toEqual(25000)
      }
    }
    expect(hand.results).toEqual({
      outcome: hand_results.outcome,
      winner: hand_results.winner,
      deal_in: hand_results.deal_in,
      han: PointsLadder.MANGAN,
      points_delta: hand_results.points_delta
    })
    expect(hand.results).not.toBe(hand_results)
  })

  it.each([
    { han: 2, fu: 30, honba: 1, honba_points: 300, expected_delta: 2300 },
    { han: PointsLadder.BAIMAN, fu: undefined, honba: 3, honba_points: 300, expected_delta: 16900 },
    { han: 2, fu: 30, honba: 1, honba_points: 1500, expected_delta: 3500 },
    { han: PointsLadder.BAIMAN, fu: undefined, honba: 3, honba_points: 1500, expected_delta: 20500 }
  ])(`respects honba $han, $fu`, ({ han, fu, honba, honba_points, expected_delta }) => {
    ruleset.honba_points = honba_points
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: honba
    })
    hand_results = {
      outcome: HandOutcomeEnum.RON,
      winner: winner,
      deal_in: deal_in,
      han: han,
      fu: fu,
      points_delta: {}
    }
    expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
    expect(hand.IsFinished()).toBe(true)
    for (const player_id of PlayerIdsInOrder) {
      if (player_id == winner) {
        hand_results.points_delta[player_id] = expected_delta
        expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_delta)
      } else if (player_id == deal_in) {
        hand_results.points_delta[player_id] = -expected_delta
        expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_delta)
      } else {
        expect(players.GetPlayer(player_id).points).toEqual(25000)
      }
    }
    expect(hand.results).toEqual(hand_results)
    expect(hand.results).not.toBe(hand_results)
    expect(hand.honba).toEqual(honba)
  })

  it.each([
    {
      han: 2,
      fu: 30,
      riichi_sticks: 1,
      riichi_cost: 1000,
      expected_winner_delta: 3000,
      expected_deal_in_delta: 2000
    },
    {
      han: PointsLadder.BAIMAN,
      fu: undefined,
      riichi_sticks: 3,
      riichi_cost: 1000,
      expected_winner_delta: 19000,
      expected_deal_in_delta: 16000
    },
    {
      han: 2,
      fu: 30,
      riichi_sticks: 1,
      riichi_cost: 500,
      expected_winner_delta: 2500,
      expected_deal_in_delta: 2000
    },
    {
      han: PointsLadder.BAIMAN,
      fu: undefined,
      riichi_sticks: 3,
      riichi_cost: 500,
      expected_winner_delta: 17500,
      expected_deal_in_delta: 16000
    }
  ])(
    `respects riichi sticks $han, $fu`,
    ({ han, fu, riichi_sticks, riichi_cost, expected_winner_delta, expected_deal_in_delta }) => {
      ruleset.riichi_cost = riichi_cost
      Object.assign(hand, {
        state: HandState.ON_GOING,
        riichi_sticks: riichi_sticks
      })
      hand_results = {
        outcome: HandOutcomeEnum.RON,
        winner: winner,
        deal_in: deal_in,
        han: han,
        fu: fu,
        points_delta: {}
      }
      expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
      expect(hand.IsFinished()).toBe(true)
      for (const player_id of PlayerIdsInOrder) {
        if (player_id == winner) {
          hand_results.points_delta[player_id] = expected_winner_delta
          expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_winner_delta)
        } else if (player_id == deal_in) {
          hand_results.points_delta[player_id] = -expected_deal_in_delta
          expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_deal_in_delta)
        } else {
          expect(players.GetPlayer(player_id).points).toEqual(25000)
        }
      }
      expect(hand.results).toEqual(hand_results)
      expect(hand.results).not.toBe(hand_results)
      expect(hand.riichi_sticks).toEqual(0)
    }
  )
})

describe.each([{ winner: Winds.SOUTH }, { winner: Winds.WEST }, { winner: Winds.NORTH }])(
  'Hand Finish Applies Points Delta When Non-Dealer Tsumo $winner',
  ({ winner }) => {
    it.each([
      { han: 1, fu: 30, expected_non_dealer_delta: 300, expected_dealer_delta: 500 },
      { han: 1, fu: 40, expected_non_dealer_delta: 400, expected_dealer_delta: 700 },
      { han: 1, fu: 50, expected_non_dealer_delta: 400, expected_dealer_delta: 800 },
      { han: 1, fu: 60, expected_non_dealer_delta: 500, expected_dealer_delta: 1000 },
      { han: 1, fu: 70, expected_non_dealer_delta: 600, expected_dealer_delta: 1200 },
      { han: 1, fu: 80, expected_non_dealer_delta: 700, expected_dealer_delta: 1300 },
      { han: 1, fu: 90, expected_non_dealer_delta: 800, expected_dealer_delta: 1500 },
      { han: 1, fu: 100, expected_non_dealer_delta: 800, expected_dealer_delta: 1600 },
      { han: 1, fu: 110, expected_non_dealer_delta: 900, expected_dealer_delta: 1800 },
      { han: 2, fu: 20, expected_non_dealer_delta: 400, expected_dealer_delta: 700 },
      { han: 2, fu: 30, expected_non_dealer_delta: 500, expected_dealer_delta: 1000 },
      { han: 2, fu: 40, expected_non_dealer_delta: 700, expected_dealer_delta: 1300 },
      { han: 2, fu: 50, expected_non_dealer_delta: 800, expected_dealer_delta: 1600 },
      { han: 2, fu: 60, expected_non_dealer_delta: 1000, expected_dealer_delta: 2000 },
      { han: 2, fu: 70, expected_non_dealer_delta: 1200, expected_dealer_delta: 2300 },
      { han: 2, fu: 80, expected_non_dealer_delta: 1300, expected_dealer_delta: 2600 },
      { han: 2, fu: 90, expected_non_dealer_delta: 1500, expected_dealer_delta: 2900 },
      { han: 2, fu: 100, expected_non_dealer_delta: 1600, expected_dealer_delta: 3200 },
      { han: 2, fu: 110, expected_non_dealer_delta: 1800, expected_dealer_delta: 3600 },
      { han: 3, fu: 20, expected_non_dealer_delta: 700, expected_dealer_delta: 1300 },
      { han: 3, fu: 25, expected_non_dealer_delta: 800, expected_dealer_delta: 1600 },
      { han: 3, fu: 30, expected_non_dealer_delta: 1000, expected_dealer_delta: 2000 },
      { han: 3, fu: 40, expected_non_dealer_delta: 1300, expected_dealer_delta: 2600 },
      { han: 3, fu: 50, expected_non_dealer_delta: 1600, expected_dealer_delta: 3200 },
      { han: 3, fu: 60, expected_non_dealer_delta: 2000, expected_dealer_delta: 3900 },
      { han: 4, fu: 20, expected_non_dealer_delta: 1300, expected_dealer_delta: 2600 },
      { han: 4, fu: 25, expected_non_dealer_delta: 1600, expected_dealer_delta: 3200 },
      { han: 4, fu: 30, expected_non_dealer_delta: 2000, expected_dealer_delta: 3900 },
      {
        han: PointsLadder.MANGAN,
        fu: undefined,
        expected_non_dealer_delta: 2000,
        expected_dealer_delta: 4000
      },
      {
        han: PointsLadder.HANEMAN,
        fu: undefined,
        expected_non_dealer_delta: 3000,
        expected_dealer_delta: 6000
      },
      {
        han: PointsLadder.BAIMAN,
        fu: undefined,
        expected_non_dealer_delta: 4000,
        expected_dealer_delta: 8000
      },
      {
        han: PointsLadder.SANBAIMAN,
        fu: undefined,
        expected_non_dealer_delta: 6000,
        expected_dealer_delta: 12000
      },
      {
        han: PointsLadder.YAKUMAN,
        fu: undefined,
        expected_non_dealer_delta: 8000,
        expected_dealer_delta: 16000
      }
    ])(`on $han, $fu`, ({ han, fu, expected_non_dealer_delta, expected_dealer_delta }) => {
      ruleset.round_up_mangan = false
      Object.assign(hand, {
        state: HandState.ON_GOING
      })
      hand_results = {
        outcome: HandOutcomeEnum.TSUMO,
        winner: winner,
        han: han,
        fu: fu,
        points_delta: {}
      }
      expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
      expect(hand.IsFinished()).toBe(true)
      for (const player_id of PlayerIdsInOrder) {
        if (player_id == winner) {
          hand_results.points_delta[player_id] =
            expected_dealer_delta + expected_non_dealer_delta * 2
          expect(players.GetPlayer(player_id).points).toEqual(
            ruleset.starting_points + expected_dealer_delta + expected_non_dealer_delta * 2
          )
        } else if (player_id == Winds.EAST) {
          hand_results.points_delta[player_id] = -expected_dealer_delta
          expect(players.GetPlayer(player_id).points).toEqual(
            ruleset.starting_points - expected_dealer_delta
          )
        } else {
          hand_results.points_delta[player_id] = -expected_non_dealer_delta
          expect(players.GetPlayer(player_id).points).toEqual(
            ruleset.starting_points - expected_non_dealer_delta
          )
        }
      }
      expect(hand.results).toEqual(hand_results)
      expect(hand.results).not.toBe(hand_results)
    })

    it.each([
      { han: 3, fu: 60, expected_non_dealer_delta: 2000, expected_dealer_delta: 4000 },
      { han: 4, fu: 30, expected_non_dealer_delta: 2000, expected_dealer_delta: 4000 }
    ])(
      `respects round-up mangan $han, $fu`,
      ({ han, fu, expected_non_dealer_delta, expected_dealer_delta }) => {
        ruleset.round_up_mangan = true
        Object.assign(hand, {
          state: HandState.ON_GOING
        })
        hand_results = {
          outcome: HandOutcomeEnum.TSUMO,
          winner: winner,
          han: han,
          fu: fu,
          points_delta: {}
        }
        expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
        expect(hand.IsFinished()).toBe(true)
        for (const player_id of PlayerIdsInOrder) {
          if (player_id == winner) {
            hand_results.points_delta[player_id] =
              expected_non_dealer_delta * 2 + expected_dealer_delta
            expect(players.GetPlayer(player_id).points).toEqual(
              25000 + expected_non_dealer_delta * 2 + expected_dealer_delta
            )
          } else if (player_id == Winds.EAST) {
            hand_results.points_delta[player_id] = -expected_dealer_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_dealer_delta)
          } else {
            hand_results.points_delta[player_id] = -expected_non_dealer_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_non_dealer_delta)
          }
        }
        expect(hand.results).toEqual({
          outcome: hand_results.outcome,
          winner: hand_results.winner,
          han: PointsLadder.MANGAN,
          points_delta: hand_results.points_delta
        })
        expect(hand.results).not.toBe(hand_results)
      }
    )

    it.each([
      {
        han: 2,
        fu: 30,
        honba: 1,
        honba_points: 300,
        expected_non_dealer_delta: 600,
        expected_dealer_delta: 1100
      },
      {
        han: PointsLadder.BAIMAN,
        fu: undefined,
        honba: 3,
        honba_points: 300,
        expected_non_dealer_delta: 4300,
        expected_dealer_delta: 8300
      },
      {
        han: 2,
        fu: 30,
        honba: 1,
        honba_points: 1500,
        expected_non_dealer_delta: 1000,
        expected_dealer_delta: 1500
      },
      {
        han: PointsLadder.BAIMAN,
        fu: undefined,
        honba: 3,
        honba_points: 1500,
        expected_non_dealer_delta: 5500,
        expected_dealer_delta: 9500
      }
    ])(
      `respects honba $han, $fu`,
      ({ han, fu, honba, honba_points, expected_non_dealer_delta, expected_dealer_delta }) => {
        ruleset.honba_points = honba_points
        Object.assign(hand, {
          state: HandState.ON_GOING,
          honba: honba
        })
        hand_results = {
          outcome: HandOutcomeEnum.TSUMO,
          winner: winner,
          han: han,
          fu: fu,
          points_delta: {}
        }
        expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
        expect(hand.IsFinished()).toBe(true)
        for (const player_id of PlayerIdsInOrder) {
          if (player_id == winner) {
            expect(players.GetPlayer(player_id).points).toEqual(
              25000 + expected_non_dealer_delta * 2 + expected_dealer_delta
            )
            hand_results.points_delta[player_id] =
              expected_non_dealer_delta * 2 + expected_dealer_delta
          } else if (player_id == Winds.EAST) {
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_dealer_delta)
            hand_results.points_delta[player_id] = -expected_dealer_delta
          } else {
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_non_dealer_delta)
            hand_results.points_delta[player_id] = -expected_non_dealer_delta
          }
        }
        expect(hand.results).toEqual(hand_results)
        expect(hand.results).not.toBe(hand_results)
        expect(hand.honba).toEqual(honba)
      }
    )

    it.each([
      {
        han: 2,
        fu: 30,
        riichi_sticks: 1,
        riichi_cost: 1000,
        expected_winner_delta: 3000,
        expected_non_dealer_delta: 500,
        expected_dealer_delta: 1000
      },
      {
        han: PointsLadder.SANBAIMAN,
        fu: undefined,
        riichi_sticks: 3,
        riichi_cost: 1000,
        expected_winner_delta: 27000,
        expected_non_dealer_delta: 6000,
        expected_dealer_delta: 12000
      },
      {
        han: 2,
        fu: 30,
        riichi_sticks: 1,
        riichi_cost: 500,
        expected_winner_delta: 2500,
        expected_non_dealer_delta: 500,
        expected_dealer_delta: 1000
      },
      {
        han: PointsLadder.SANBAIMAN,
        fu: undefined,
        riichi_sticks: 3,
        riichi_cost: 500,
        expected_winner_delta: 25500,
        expected_non_dealer_delta: 6000,
        expected_dealer_delta: 12000
      }
    ])(
      `respects riichi sticks $han, $fu`,
      ({
        han,
        fu,
        riichi_sticks,
        riichi_cost,
        expected_winner_delta,
        expected_non_dealer_delta,
        expected_dealer_delta
      }) => {
        ruleset.riichi_cost = riichi_cost
        Object.assign(hand, {
          state: HandState.ON_GOING,
          riichi_sticks: riichi_sticks
        })
        hand_results = {
          outcome: HandOutcomeEnum.TSUMO,
          winner: winner,
          han: han,
          fu: fu,
          points_delta: {}
        }
        expect(hand.Finish(hand_results, players, ruleset)).toBe(true)
        expect(hand.IsFinished()).toBe(true)
        for (const player_id of PlayerIdsInOrder) {
          if (player_id == winner) {
            hand_results.points_delta[player_id] = expected_winner_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 + expected_winner_delta)
          } else if (player_id == Winds.EAST) {
            hand_results.points_delta[player_id] = -expected_dealer_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_dealer_delta)
          } else {
            hand_results.points_delta[player_id] = -expected_non_dealer_delta
            expect(players.GetPlayer(player_id).points).toEqual(25000 - expected_non_dealer_delta)
          }
        }
        expect(hand.results).toEqual(hand_results)
        expect(hand.results).not.toBe(hand_results)
        expect(hand.riichi_sticks).toEqual(0)
      }
    )
  }
)

describe('Hand Clone', () => {
  it('should copy all fields correctly', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 3,
      honba: 2,
      riichi: [Winds.NORTH, Winds.WEST],
      riichi_sticks: 1,
      has_next_hand: true,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        deal_in: Winds.WEST,
        han: 3,
        fu: 20,
        tenpai: [Winds.SOUTH, Winds.EAST]
      }
    })
    const clone = hand.Clone()
    expect(clone).not.toBe(hand)
    expect(clone.state).toEqual(hand.state)
    expect(clone.round_wind).toEqual(hand.round_wind)
    expect(clone.hand).toEqual(hand.hand)
    expect(clone.honba).toEqual(hand.honba)
    expect(clone.riichi).toEqual(hand.riichi)
    expect(clone.riichi_sticks).toEqual(hand.riichi_sticks)
    expect(clone.has_next_hand).toEqual(hand.has_next_hand)
    expect(clone.results.outcome).toEqual(hand.results.outcome)
    expect(clone.results.winner).toEqual(hand.results.winner)
    expect(clone.results.deal_in).toEqual(hand.results.deal_in)
    expect(clone.results.han).toEqual(hand.results.han)
    expect(clone.results.fu).toEqual(hand.results.fu)
    expect(clone.results.tenpai).toEqual(hand.results.tenpai)
  })
})

describe('Hand Parse From Object', () => {
  it('should copy all fields correctly', () => {
    Object.assign(hand, {
      state: HandState.FINISHED,
      round_wind: Winds.SOUTH,
      hand: 3,
      honba: 2,
      riichi: [Winds.NORTH, Winds.WEST],
      riichi_sticks: 1,
      has_next_hand: true,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        deal_in: Winds.WEST,
        han: 3,
        fu: 20,
        tenpai: [Winds.SOUTH, Winds.EAST]
      }
    })
    const obj = JSON.parse(JSON.stringify(hand))
    const parsed = Hand.ParseFromObject(hand)
    expect(parsed).toEqual(hand)
    expect(parsed).not.toBe(hand)
  })
})

describe('Hand Abandon', () => {
  it('should ignore an un-started hand', () => {
    hand.state = HandState.NOT_STARTED
    expect(hand.Abandon(players, ruleset)).toBe(false)
    expect(hand.IsNotStarted()).toBe(true)
  })
  it('should ignore a finished hand', () => {
    hand.state = HandState.FINISHED
    expect(hand.Abandon(players, ruleset)).toBe(false)
    expect(hand.IsFinished()).toBe(true)
  })
  it('should ignore an abandoned hand', () => {
    hand.state = HandState.ABANDONED
    expect(hand.Abandon(players, ruleset)).toBe(false)
    expect(hand.IsAbandoned()).toBe(true)
  })
  it('should not impact regular hand info', () => {
    hand.state = HandState.ON_GOING
    hand.round_wind = Winds.SOUTH
    hand.hand = 2
    hand.honba = 3
    hand.has_next_hand = true
    expect(hand.Abandon(players, ruleset)).toBe(true)
    expect(hand.IsAbandoned()).toBe(true)
    expect(hand.round_wind).toBe(Winds.SOUTH)
    expect(hand.hand).toBe(2)
    expect(hand.honba).toBe(3)
    expect(hand.has_next_hand).toBe(true)
  })
  it('should unriichi all players', () => {
    hand.state = HandState.ON_GOING
    hand.PlayerRiichi(Winds.WEST, players, ruleset)
    hand.PlayerRiichi(Winds.SOUTH, players, ruleset)
    expect(hand.Abandon(players, ruleset)).toBe(true)
    expect(hand.IsAbandoned()).toBe(true)
    expect(hand.riichi_sticks).toBe(0)
    expect(players.GetPlayer(Winds.WEST).points).toBe(25000)
    expect(players.GetPlayer(Winds.SOUTH).points).toBe(25000)
  })
  it('should not impact on-hold riichi sticks inherited from last hand', () => {
    hand.state = HandState.ON_GOING
    hand.riichi_sticks = 4
    hand.PlayerRiichi(Winds.WEST, players, ruleset)
    hand.PlayerRiichi(Winds.SOUTH, players, ruleset)
    expect(hand.Abandon(players, ruleset)).toBe(true)
    expect(hand.IsAbandoned()).toBe(true)
    expect(hand.riichi_sticks).toBe(4)
    expect(hand.riichi.length).toBe(0)
    expect(players.GetPlayer(Winds.WEST).points).toBe(25000)
    expect(players.GetPlayer(Winds.SOUTH).points).toBe(25000)
  })
  it('should clean up hand results', () => {
    hand.state = HandState.ON_GOING
    hand.results = {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.NORTH,
      deal_in: Winds.SOUTH,
      han: 3,
      fu: 30
    }
    expect(hand.Abandon(players, ruleset)).toBe(true)
    expect(hand.IsAbandoned()).toBe(true)
    expect(hand.results).toEqual({
      outcome: null
    })
  })
})
