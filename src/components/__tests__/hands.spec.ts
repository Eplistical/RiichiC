import { beforeEach, describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { Winds } from '../seat_constants.ts'
import { Ruleset } from '../rulesets.ts'
import { HandOutcomeEnum, HandResults, Hand, HandState } from '../hand.ts'
import { PlayerId, Players } from '../players.ts'
import { enableAutoUnmount } from '../../../node_modules/@vue/test-utils/dist/index'
import { PointsLadder } from '../game_constants'

let ruleset: Ruleset;
let players: Players;
let hand: Hand;
let hand_results: HandResults;

beforeEach(() => {
  ruleset =  {
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
    all_last_dealer_tenpai_renchan: true,
  }

  players = new Players(ruleset, ["P1", "P2", "P3", "P4"]); 

  hand = new Hand({
    round_wind: Winds.EAST, 
    hand: 1, 
    honba: 0, 
    riichi_sticks: 0
  })

  hand_results = {
    outcome: undefined,
    riichi: new Set<PlayerId>(),
    tenpai: new Set<PlayerId>(),
    winner: undefined,
    deal_in: undefined,
    han: undefined,
    fu: undefined,
  }
});

describe(('Hand Construction'), ()=> {
  it('should assign correct default values', () => {
    hand = new Hand({
      round_wind: Winds.EAST, 
      hand: 1, 
      honba: 0, 
      riichi_sticks: 0
    })
    expect(hand.state).toEqual(HandState.NOT_STARTED);
    expect(hand.round_wind).toEqual(Winds.EAST);
    expect(hand.hand).toEqual(1);
    expect(hand.riichi_sticks).toEqual(0);
    expect(hand.has_next_hand).toEqual(true);
    expect(hand.results).toEqual({
      outcome: undefined,
      riichi: new Set<PlayerId>(),
      tenpai: new Set<PlayerId>(),
      winner: undefined,
      deal_in: undefined,
      han: undefined,
      fu: undefined
    });
  })
})

describe(('Hand Start'), ()=> {
  it('should work for an unstarted hand', () => { 
    hand.state = HandState.NOT_STARTED;
    hand.Start();
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should do nothing for an on-going hand', () => { 
    hand.state = HandState.ON_GOING;
    hand.Start();
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should do nothing for a finished hand', () => { 
    hand.state = HandState.FINISHED;
    hand.Start();
    expect(hand.state).toEqual(HandState.FINISHED);
  })
})

describe(('Hand Works On Riichi Event'), ()=> {
  it('should work for player riichi', () => {
    hand.PlayerRiichi(Winds.EAST, players, ruleset);
    expect(hand.riichi_sticks).toEqual(1);
    expect(hand.results.riichi).toHaveLength(1);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.EAST]));
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000);

    hand.PlayerRiichi(Winds.WEST, players, ruleset);
    expect(hand.riichi_sticks).toEqual(2);
    expect(hand.results.riichi).toHaveLength(2);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.EAST, Winds.WEST]));
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000);
  })
  it('should do nothing on riichi when a player has already riichi\'ed ', () => { 
    hand.PlayerRiichi(Winds.EAST, players, ruleset);
    expect(hand.riichi_sticks).toEqual(1);
    expect(hand.results.riichi).toHaveLength(1);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.EAST]));
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000);

    hand.PlayerRiichi(Winds.EAST, players, ruleset);
    expect(hand.riichi_sticks).toEqual(1);
    expect(hand.results.riichi).toHaveLength(1);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.EAST]));
    expect(players.GetPlayer(Winds.EAST).points).toEqual(24000);
  })
  it('should work for player unriichi', () => {
    hand.PlayerRiichi(Winds.SOUTH, players, ruleset);
    hand.PlayerRiichi(Winds.NORTH, players, ruleset);
    expect(hand.riichi_sticks).toEqual(2);
    expect(hand.results.riichi).toHaveLength(2);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.SOUTH, Winds.NORTH]));
    expect(players.GetPlayer(Winds.SOUTH).points).toEqual(24000);
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000);

    hand.PlayerUnRiichi(Winds.SOUTH, players, ruleset);
    expect(hand.riichi_sticks).toEqual(1);
    expect(hand.results.riichi).toHaveLength(1);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.NORTH]));
    expect(players.GetPlayer(Winds.SOUTH).points).toEqual(25000);
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000);

    hand.PlayerUnRiichi(Winds.NORTH, players, ruleset);
    expect(hand.riichi_sticks).toEqual(0);
    expect(hand.results.riichi).toHaveLength(0);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([]));
    expect(players.GetPlayer(Winds.SOUTH).points).toEqual(25000);
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(25000);
  })
  it('should do nothing on unriichi for a player that does not riichi', () => { 
    hand.PlayerRiichi(Winds.NORTH, players, ruleset);
    expect(hand.riichi_sticks).toEqual(1);
    expect(hand.results.riichi).toHaveLength(1);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.NORTH]));
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000);

    hand.PlayerUnRiichi(Winds.EAST, players, ruleset);
    expect(hand.riichi_sticks).toEqual(1);
    expect(hand.results.riichi).toHaveLength(1);
    expect(hand.results.riichi).toEqual(new Set<PlayerId>([Winds.NORTH]));
    expect(players.GetPlayer(Winds.EAST).points).toEqual(25000);
    expect(players.GetPlayer(Winds.NORTH).points).toEqual(24000);
  })
})

describe(('Hand Check All Last'), ()=> {
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

describe(('Hand Set Up Next Hand'), ()=> {
  it('should ignore unfinished hand', () => {
    hand.state = HandState.NOT_STARTED;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    hand.state = HandState.ON_GOING;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
  })
  it('should ignore when no more future hands', () => {
    hand.has_next_hand = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
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
        tenpai: new Set<PlayerId>([Winds.EAST]),
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 1,
        honba: 1,
        riichi_sticks: 0,
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
        tenpai: new Set<PlayerId>([Winds.SOUTH]),
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 4,
        honba: 3,
        riichi_sticks: 2,
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
        fu: 30,
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 1,
        honba: 2,
        riichi_sticks: 0,
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
        fu: 25,
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 0,
        riichi_sticks: 0,
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
        han: PointsLadder.HANEMAN,
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(false)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 2,
        honba: 6,
        riichi_sticks: 0,
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
        fu: 20,
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.EAST,
        hand: 4,
        honba: 0,
        riichi_sticks: 0,
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
        fu: 40,
      }})
    const [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(true)
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 1,
        honba: 0,
        riichi_sticks: 0,
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
        tenpai: new Set<PlayerId>([Winds.EAST]),
      }})

    hand.has_next_hand = true;
    ruleset.all_last_dealer_tenpai_renchan = true;
    let [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(false);
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 1,
        riichi_sticks: 3,
      })
    )
    expect(hand.has_next_hand).toEqual(true);

    ruleset.all_last_dealer_tenpai_renchan = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);
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
        tenpai: new Set<PlayerId>([Winds.WEST, Winds.SOUTH, Winds.NORTH]),
      }})

    hand.has_next_hand = true;
    ruleset.all_last_dealer_tenpai_renchan = true;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);

    hand.has_next_hand = true;
    ruleset.all_last_dealer_tenpai_renchan = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);
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
        fu: 40,
      }})

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = true;
    let [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(false);
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 2,
        riichi_sticks: 0,
      })
    )
    expect(hand.has_next_hand).toEqual(true);

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);
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
        fu: 30,
      }})

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = true;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);
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
        han: PointsLadder.BAIMAN,
      }})

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = true;
    let [next_hand, players_should_shift_seats] = hand.SetUpNextHand(players, ruleset);
    expect(players_should_shift_seats).toEqual(false);
    expect(next_hand).toEqual(
      expect.objectContaining({
        state: HandState.NOT_STARTED,
        round_wind: Winds.SOUTH,
        hand: 4,
        honba: 4,
        riichi_sticks: 0,
      })
    )
    expect(hand.has_next_hand).toEqual(true);

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);

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
        fu: 30,
      }})

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = true;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);

    hand.has_next_hand = true;
    ruleset.all_last_dealer_win_renchan = false;
    expect(hand.SetUpNextHand(players, ruleset)).toBe(undefined);
    expect(hand.has_next_hand).toEqual(false);
   })
})

describe(('Hand Finish Validation'), ()=> {
  it('should ignore an unstarted hand', () => { 
    Object.assign(hand, {
      state: HandState.NOT_STARTED,
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.NOT_STARTED);
  })
  it('should ignore a finished hand', () => { 
    Object.assign(hand, {
      state: HandState.FINISHED,
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.FINISHED);
  })
  it('should ignore undefined outcome', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: undefined,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject riichi noten on draw', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.EAST]),
        riichi: new Set<PlayerId>([Winds.EAST, Winds.NORTH]),
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined winner on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: undefined,
        deal_in: Winds.EAST,
        han: 3,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined deal in on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: undefined,
        han: 3,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined han on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.SOUTH,
        deal_in: Winds.NORTH,
        han: undefined,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject invalid han on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.SOUTH,
        deal_in: Winds.NORTH,
        han: 5000,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject invalid fu on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.SOUTH,
        deal_in: Winds.NORTH,
        han: 2,
        fu: 9,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined fu with small han on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.SOUTH,
        deal_in: Winds.NORTH,
        han: 3,
        fu: undefined,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject bad han-fu pair on ron', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.SOUTH,
        deal_in: Winds.NORTH,
        han: 3,
        fu: 20,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined winner on tsumo', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: undefined,
        han: 3,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined han on tsumo', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.WEST,
        han: undefined,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject invalid han on tsumo', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.WEST,
        han: -1,
        fu: 30,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject undefined fu with small han on tsumo', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.WEST,
        han: 1,
        fu: undefined,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
  it('should reject invalid fu on tsumo', () => { 
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.WEST,
        han: 3,
        fu: 90,
      },
    })
    expect(hand.Finish(players, ruleset)).toEqual(false);
    expect(hand.state).toEqual(HandState.ON_GOING);
  })
})

describe(('Hand Finish Applies Points Delta On Draw'), ()=> {
  it('when everyone noten', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>(),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([25000,25000,25000,25000]);
  })
  it('when everyone tenpai', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH]),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([25000,25000,25000,25000]);
  })
  it('when one player tenpai', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.EAST]),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([28000,24000,24000,24000]);
  })
  it('when two players tenpai', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.WEST, Winds.NORTH]),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([23500,23500,26500,26500]);
  })
  it('when three players tenpai', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.EAST, Winds.NORTH, Winds.SOUTH]),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([26000,26000,22000,26000]);
  })
  it('ignores honba', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: 3,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.NORTH, Winds.SOUTH]),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([23500,26500,23500,26500]);
    expect(hand.honba).toEqual(3);
  })
  it('ignores riichi sticks', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi_sticks: 1,
      results: {
        outcome: HandOutcomeEnum.DRAW,
        tenpai: new Set<PlayerId>([Winds.WEST]),
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([24000,24000,28000,24000]);
    expect(hand.riichi_sticks).toEqual(1)
  })
})

describe(('Hand Finish Applies Points Delta On Draw'), ()=> {
  it('Should work on dealer small hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.SOUTH,
        han: 2,
        fu: 30,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([27900,22100,25000,25000]);
  })
  it('Should work on dealer large hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.NORTH,
        han: PointsLadder.MANGAN,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([37000,25000,25000,13000]);
  })
  it('Should work on non-dealer small hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.WEST,
        deal_in: Winds.SOUTH,
        han: 4,
        fu: 25,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([25000,18600,31400,25000]);
  })
  it('Should work on dealer large hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.NORTH,
        deal_in: Winds.EAST,
        han: PointsLadder.BAIMAN,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([9000,25000,25000,41000]);
  })
  it('Should respect 4-30 round-up mangan', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.WEST,
        han: 4,
        fu: 30,
      }
    })
    ruleset.round_up_mangan = true;
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([37000,25000,13000,25000]);
  })
  it('Should respect 3-60 round-up mangan', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.NORTH,
        deal_in: Winds.SOUTH,
        han: 3,
        fu: 60,
      }
    })
    ruleset.round_up_mangan = true;
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([25000,17000,25000,33000]);
  })
  it('Should include honba', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: 3,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.WEST,
        deal_in: Winds.SOUTH,
        han: 3,
        fu: 30,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([25000,20200,29800,25000]);
    expect(hand.honba).toEqual(3);
  })
  it('Should respect honba points', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: 3,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.WEST,
        deal_in: Winds.SOUTH,
        han: 3,
        fu: 30,
      }
    })
    ruleset.honba_points = 1500
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([25000,16600,33400,25000]);
    expect(hand.honba).toEqual(3);
  })
  it('Should include riichi sticks', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi_sticks: 2,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.NORTH,
        han: PointsLadder.MANGAN,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([39000,25000,25000,13000]);
    expect(hand.riichi_sticks).toEqual(0);
  })
  it('Should respsect riichi cost', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi_sticks: 2,
      results: {
        outcome: HandOutcomeEnum.RON,
        winner: Winds.EAST,
        deal_in: Winds.NORTH,
        han: PointsLadder.MANGAN,
      }
    })
    ruleset.riichi_cost = 2000;
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([41000,25000,25000,13000]);
    expect(hand.riichi_sticks).toEqual(0);
  })
})

describe(('Hand Finish Applies Points Delta On Tsumo'), ()=> {
  it('Should work on dealer small hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: 3,
        fu: 30,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([31000,23000,23000,23000]);
  })
  it('Should work on dealer large hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: PointsLadder.BAIMAN,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([49000,17000,17000,17000]);
  })
  it('Should work on non-dealer small hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.SOUTH,
        han: 3,
        fu: 20,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([23700,27700,24300,24300]);
  })
  it('Should work on non-dealer large hand', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.NORTH,
        han: PointsLadder.YAKUMAN,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([9000,17000,17000,57000]);
  })
  it('Should respect 4-30 round-up mangan', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.WEST,
        han: 4,
        fu: 30,
      }
    })
    ruleset.round_up_mangan = true
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([21000,23000,33000,23000]);
  })
  it('Should respect 3-60 round-up mangan', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: 3,
        fu: 60,
      }
    })
    ruleset.round_up_mangan = true
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([37000,21000,21000,21000]);
  })
  it('Should include honba', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: 2,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.SOUTH,
        han: 4,
        fu: 25,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([21600, 32000, 23200, 23200]);
    expect(hand.honba).toEqual(2)
  })
  it('Should respect honba points', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      honba: 2,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.SOUTH,
        han: 4,
        fu: 25,
      }
    })
    ruleset.honba_points = 1500
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([20800, 34400, 22400, 22400]);
    expect(hand.honba).toEqual(2)
  })
  it('Should include riichi sticks', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi_sticks: 1,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: PointsLadder.HANEMAN,
      }
    })
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([44000, 19000, 19000, 19000]);
    expect(hand.riichi_sticks).toEqual(0)
  })
  it('Should respect riichi costs', () => {
    Object.assign(hand, {
      state: HandState.ON_GOING,
      riichi_sticks: 1,
      results: {
        outcome: HandOutcomeEnum.TSUMO,
        winner: Winds.EAST,
        han: PointsLadder.HANEMAN,
      }
    })
    ruleset.riichi_cost = 500
    expect(hand.Finish(players, ruleset)).toEqual(true);
    expect(hand.state).toEqual(HandState.FINISHED);
    expect(players.GetPlayers([Winds.EAST,Winds.SOUTH, Winds.WEST, Winds.NORTH]).map((p)=>p.points)).toEqual([43500, 19000, 19000, 19000]);
    expect(hand.riichi_sticks).toEqual(0)
  })
})