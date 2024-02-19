import { beforeEach, describe, it, expect } from 'vitest'

import { WindType, Winds, WindsInOrder } from '../seat_constants.ts'
import { Ruleset } from '../rulesets.ts'
import { HandOutcomeEnum, HandResults, Hand, HandState } from '../hand.ts'
import { Game, GameState } from '../game.ts'
import { PlayerId, Players } from '../players.ts'
import { PointsLadder } from '../game_constants.ts'

let ruleset: Ruleset
let hand_results: HandResults
let player_names: string[]
let player_starting_winds: WindType[]

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

  hand_results = {
    outcome: undefined,
    tenpai: [],
    winner: undefined,
    deal_in: undefined,
    han: undefined,
    fu: undefined
  }

  player_names = ['P1', 'P2', 'P3', 'P4']
  player_starting_winds = [...WindsInOrder]
})

describe('Game Init', () => {
  it('should assign correct values', () => {
    let game = new Game()
    const [success, _] = game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    expect(success).toBe(true)
    expect(game.state).toEqual(GameState.NOT_STARTED)
    expect(game.ruleset).toEqual(ruleset)
    expect(game.players.GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])).toEqual([
      {
        name: 'P1',
        points: 25000,
        current_wind: Winds.EAST
      },
      {
        name: 'P2',
        points: 25000,
        current_wind: Winds.SOUTH
      },
      {
        name: 'P3',
        points: 25000,
        current_wind: Winds.WEST
      },
      {
        name: 'P4',
        points: 25000,
        current_wind: Winds.NORTH
      }
    ])
    expect(game.current_hand).toEqual(
      new Hand({ round_wind: Winds.EAST, hand: 1, honba: 0, riichi_sticks: 0 })
    )
    expect(game.log).toHaveLength(0)
  })

  it.each([
    {
      starting_winds: [Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH],
      expected_players_in_order: ['P1', 'P2', 'P3', 'P4']
    },
    {
      starting_winds: [Winds.EAST, Winds.WEST, Winds.NORTH, Winds.SOUTH],
      expected_players_in_order: ['P1', 'P4', 'P2', 'P3']
    },
    {
      starting_winds: [Winds.SOUTH, Winds.EAST, Winds.WEST, Winds.NORTH],
      expected_players_in_order: ['P2', 'P1', 'P3', 'P4']
    },
    {
      starting_winds: [Winds.SOUTH, Winds.NORTH, Winds.WEST, Winds.EAST],
      expected_players_in_order: ['P4', 'P1', 'P3', 'P2']
    },
    {
      starting_winds: [Winds.WEST, Winds.EAST, Winds.SOUTH, Winds.NORTH],
      expected_players_in_order: ['P2', 'P3', 'P1', 'P4']
    },
    {
      starting_winds: [Winds.WEST, Winds.NORTH, Winds.EAST, Winds.SOUTH],
      expected_players_in_order: ['P3', 'P4', 'P1', 'P2']
    },
    {
      starting_winds: [Winds.NORTH, Winds.EAST, Winds.WEST, Winds.SOUTH],
      expected_players_in_order: ['P2', 'P4', 'P3', 'P1']
    },
    {
      starting_winds: [Winds.NORTH, Winds.WEST, Winds.EAST, Winds.SOUTH],
      expected_players_in_order: ['P3', 'P4', 'P2', 'P1']
    }
  ])(
    'should permute players in winds order $starting_winds',
    ({ starting_winds, expected_players_in_order }) => {
      let game = new Game()
      const [success, _] = game.InitGame({
        ruleset: ruleset,
        player_names: player_names,
        player_starting_winds: starting_winds
      })
      expect(success).toBe(true)
      expect(
        game.players
          .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
          .map((p) => p.name)
      ).toEqual(expected_players_in_order)
    }
  )

  it.each([
    { starting_winds: [] },
    { starting_winds: [Winds.EAST, Winds.SOUTH, Winds.WEST] },
    { starting_winds: [Winds.EAST, Winds.EAST, Winds.EAST, Winds.EAST] },
    { starting_winds: [Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.WEST] },
    { starting_winds: [Winds.EAST, Winds.WEST, Winds.WEST, Winds.NORTH] },
    { starting_winds: [Winds.NORTH, Winds.SOUTH, Winds.WEST, Winds.NORTH] },
    { starting_winds: [Winds.EAST, Winds.SOUTH, Winds.SOUTh, Winds.NORTH] }
  ])(
    'should reject invalid starting winds $starting_winds',
    ({ starting_winds, expected_players_in_order }) => {
      let game = new Game()
      const [success, _] = game.InitGame({
        ruleset: ruleset,
        player_names: player_names,
        player_starting_winds: starting_winds
      })
      expect(success).toBe(false)
    }
  )
})

describe('Game Start', () => {
  it('Should work for an unstarted game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.state = GameState.NOT_STARTED
    game.Start()
    expect(game.state).toEqual(GameState.ON_GOING)
  })
  it('Should ignore an ongoing game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.state = GameState.ON_GOING
    game.Start()
    expect(game.state).toEqual(GameState.ON_GOING)
  })
  it('Should ignore an ongoing game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.state = GameState.FINISHED
    game.Start()
    expect(game.state).toEqual(GameState.FINISHED)
  })
})

describe('Game StartCurrentHand', () => {
  it('Should start correctly', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    expect(game.current_hand.IsOngoing()).toEqual(false)
    game.StartCurrentHand()
    expect(game.current_hand.IsOngoing()).toEqual(true)
  })
  it('Should skip when game is not started correctly', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.StartCurrentHand()
    expect(game.current_hand.IsOngoing()).toEqual(false)
  })
  it('Should skip when game finished', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.state = GameState.FINISHED
    game.StartCurrentHand()
    expect(game.current_hand.IsOngoing()).toEqual(false)
  })
})

describe('Game FinishCurrentHand', () => {
  it('Should handle draw correctly', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.WEST, Winds.EAST]
    })
    expect(game.current_hand.IsFinished()).toEqual(true)
    expect(game.current_hand.results).toEqual(
      expect.objectContaining({
        outcome: HandOutcomeEnum.DRAW,
        tenpai: [Winds.WEST, Winds.EAST]
      })
    )
  })
  it('Should handle ron correctly', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.RON,
      winner: Winds.NORTH,
      deal_in: Winds.EAST,
      han: 3,
      fu: 30
    })
    expect(game.current_hand.IsFinished()).toEqual(true)
    expect(game.current_hand.results).toEqual(
      expect.objectContaining({
        outcome: HandOutcomeEnum.RON,
        winner: Winds.NORTH,
        deal_in: Winds.EAST,
        han: 3,
        fu: 30
      })
    )
  })
  it('Should handle tsumo correctly', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.NORTH,
      han: 2,
      fu: 20
    })
    expect(game.current_hand.IsFinished()).toEqual(true)
    expect(game.current_hand.results).toEqual(
      expect.objectContaining({
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.NORTH,
        han: 2,
        fu: 20
      })
    )
  })
})

describe('Game SetUpNextHandOrFinishGame', () => {
  it('Should move forward on draw dealer noten', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.WEST]
    })
    game.SetUpNextHandOrFinishGame()

    expect(
      game.players
        .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
        .map((p) => p.current_wind)
    ).toEqual([Winds.NORTH, Winds.EAST, Winds.SOUTH, Winds.WEST])
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 2,
        honba: 1
      })
    )
  })

  it('Should renchan on draw dealer tenpai', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST]
    })
    game.SetUpNextHandOrFinishGame()

    expect(
      game.players
        .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
        .map((p) => p.current_wind)
    ).toEqual([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 1,
        honba: 1
      })
    )
  })

  it('Should move forward on non-dealer ron', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.RON,
      winner: Winds.NORTH,
      deal_in: Winds.EAST,
      han: PointsLadder.MANGAN
    })
    game.SetUpNextHandOrFinishGame()

    expect(
      game.players
        .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
        .map((p) => p.current_wind)
    ).toEqual([Winds.NORTH, Winds.EAST, Winds.SOUTH, Winds.WEST])
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 2,
        honba: 0
      })
    )
  })
  it('Should move forward on non-dealer tsumo', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.NORTH,
      han: 3,
      fu: 30
    })
    game.SetUpNextHandOrFinishGame()

    expect(
      game.players
        .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
        .map((p) => p.current_wind)
    ).toEqual([Winds.NORTH, Winds.EAST, Winds.SOUTH, Winds.WEST])
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 2,
        honba: 0
      })
    )
  })

  it('Should renchan on dealer ron', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.RON,
      winner: Winds.EAST,
      deal_in: Winds.NORTH,
      han: PointsLadder.MANGAN
    })
    game.SetUpNextHandOrFinishGame()

    expect(
      game.players
        .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
        .map((p) => p.current_wind)
    ).toEqual([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 1,
        honba: 1
      })
    )
  })
  it('Should renchan on dealer tsumo', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: 3,
      fu: 40
    })
    game.SetUpNextHandOrFinishGame()

    expect(
      game.players
        .GetPlayers([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
        .map((p) => p.current_wind)
    ).toEqual([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH])
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 1,
        honba: 1
      })
    )
  })

  it('Should finish game on all last non-dealer win', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    // move to all last
    for (let i = 0; i < 7; ++i) {
      game.StartCurrentHand()
      game.FinishCurrentHand({
        outcome: HandOutcomeEnum.DRAW,
        tenpai: []
      })
      game.SetUpNextHandOrFinishGame()
    }
    expect(game.current_hand.IsAllLast(game.ruleset)).toEqual(true)

    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.SOUTH,
      han: 2,
      fu: 30
    })
    game.SetUpNextHandOrFinishGame()
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.FINISHED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 7
      })
    )
    expect(game.state).toEqual(GameState.FINISHED)
  })
  it('Should renchan on all last dealer win', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    // move to all last
    for (let i = 0; i < 7; ++i) {
      game.StartCurrentHand()
      game.FinishCurrentHand({
        outcome: HandOutcomeEnum.DRAW,
        tenpai: []
      })
      game.SetUpNextHandOrFinishGame()
    }
    expect(game.current_hand.IsAllLast(game.ruleset)).toEqual(true)

    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.NORTH, // all last the dealer should be the beginning north player (P4)
      han: 2,
      fu: 30
    })
    game.SetUpNextHandOrFinishGame()
    expect(game.current_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 8
      })
    )
    expect(game.state).toEqual(GameState.ON_GOING)
  })
})

describe('Game Finish', () => {
  it('Should ignore an unstarted game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Finish()
    expect(game.state).toEqual(GameState.NOT_STARTED)
  })
  it('Should abandon a hand that is not finished', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.Finish()
    expect(game.state).toEqual(GameState.FINISHED)
    expect(game.current_hand.IsAbandoned()).toEqual(true)
  })
  it('Should work for an ongoing game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.DRAW,
      tenpai: []
    })
    game.Finish()
    expect(game.state).toEqual(GameState.FINISHED)
  })
  it('Should ignore an finished game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.FinishCurrentHand({
      outcome: HandOutcomeEnum.DRAW,
      tenpai: []
    })
    game.Finish()
    expect(game.state).toEqual(GameState.FINISHED)
    game.Finish()
    expect(game.state).toEqual(GameState.FINISHED)
  })
})

describe('Game SaveHandLog', () => {
  it('Should ignore unstarted game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.state = GameState.NOT_STARTED
    game.SaveHandLog()
    expect(game.log).toHaveLength(0)
  })

  it('Should ignore finished game', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.state = GameState.FINISHED
    game.SaveHandLog()
    expect(game.log).toHaveLength(0)
  })

  it('Should ignore unstarted hand', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.SaveHandLog()
    expect(game.log).toHaveLength(0)
  })

  it('Should ignore ongoing hand', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    game.StartCurrentHand()
    game.SaveHandLog()
    expect(game.log).toHaveLength(0)
  })

  it('Should save correct information to log', () => {
    let game = new Game()
    game.InitGame({
      ruleset: ruleset,
      player_names: player_names,
      player_starting_winds: player_starting_winds
    })
    game.Start()
    // to south-2
    for (let i = 0; i < 6; ++i) {
      game.StartCurrentHand()
      game.PlayerRiichi(Winds.WEST)
      game.FinishCurrentHand({
        outcome: HandOutcomeEnum.DRAW,
        tenpai: [Winds.WEST]
      })
      game.SaveHandLog()
      game.SetUpNextHandOrFinishGame()
    }
    expect(game.log).toHaveLength(6)
    expect(game.log[5].state).toEqual(GameState.ON_GOING)
    expect(game.log[5].hand).toEqual(
      expect.objectContaining({
        round_wind: Winds.EAST,
        hand: 3,
        honba: 5,
        riichi: new Set<PlayerId>([Winds.WEST]),
        riichi_sticks: 6,
        has_next_hand: true,
        results: {
          outcome: HandOutcomeEnum.DRAW,
          tenpai: [Winds.WEST],
          winner: undefined,
          deal_in: undefined,
          han: undefined,
          fu: undefined
        }
      })
    )
    expect(game.log[5].players.player_map).toEqual(
      expect.objectContaining({
        [Winds.EAST]: {
          current_wind: Winds.WEST,
          name: 'P1',
          points: 19000
        },
        [Winds.SOUTH]: {
          current_wind: Winds.NORTH,
          name: 'P2',
          points: 19000
        },
        [Winds.WEST]: {
          current_wind: Winds.EAST,
          name: 'P3',
          points: 37000
        },
        [Winds.NORTH]: {
          current_wind: Winds.SOUTH,
          name: 'P4',
          points: 19000
        }
      })
    )
  })
})
