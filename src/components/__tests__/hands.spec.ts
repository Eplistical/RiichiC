import { beforeEach, describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { Winds } from '../seat_constants.ts'
import { Ruleset } from '../rulesets.ts'
import { HandOutcomeEnum, HandResults, Hand } from '../hand.ts'
import { Players } from '../players.ts'

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
    outcome: HandOutcomeEnum.DRAW,
    riichi: [],
    tenpai: [],
    winner: undefined,
    deal_in: undefined,
    han: undefined,
    fu: undefined,
  }
});


describe(('ResolvePointsDelta Should Work On Draw'), ()=> {
  it('when everyone noten', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [],
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({});
  })
  it('when everyone tenpai', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST, Winds.SOUTH, Winds.WEST, Winds.NORTH],
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({});
  })
  it('when 1 player tenpai', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST],
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 3000,
      [Winds.SOUTH]: -1000,
      [Winds.WEST]: -1000,
      [Winds.NORTH]: -1000,
    });
  })
  it('when 2 players tenpai', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST, Winds.WEST],
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 1500,
      [Winds.SOUTH]: -1500,
      [Winds.WEST]: 1500,
      [Winds.NORTH]: -1500,
    });
  })
  it('when 3 players tenpai', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.SOUTH, Winds.WEST, Winds.NORTH],
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -3000,
      [Winds.SOUTH]: 1000,
      [Winds.WEST]: 1000,
      [Winds.NORTH]: 1000,
    });
  })
  it('should ignore honba', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST, Winds.WEST],
    })
    Object.assign(hand, {
      honba: 3,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 1500,
      [Winds.SOUTH]: -1500,
      [Winds.WEST]: 1500,
      [Winds.NORTH]: -1500,
    })
  });
  it('should ignore riichi', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.DRAW,
      tenpai: [Winds.EAST, Winds.WEST],
      riichi: [Winds.EAST, Winds.WEST],
    });
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 1500,
      [Winds.SOUTH]: -1500,
      [Winds.WEST]: 1500,
      [Winds.NORTH]: -1500,
    });
  })
})

describe(('ResolvePointsDelta Should Work On Ron'), ()=> {
  it('Should work on dealer (1,30)', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.EAST,
      deal_in: Winds.SOUTH,
      han: 1,
      fu: 30,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 1500,
      [Winds.SOUTH]: -1500,
    });
  })
  it('Should work on non-dealer (1,30)', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.EAST,
      han: 1,
      fu: 30,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -1000,
      [Winds.SOUTH]: 1000,
    });
  })
  it('Should round up for dealer mangan when enabled', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.EAST,
      deal_in: Winds.SOUTH,
      han: 3,
      fu: 60,
    })

    Object.assign(ruleset, {
      round_up_mangan: true,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 12000,
      [Winds.SOUTH]: -12000,
    });

    Object.assign(ruleset, {
      round_up_mangan: false,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 11600,
      [Winds.SOUTH]: -11600,
    });
  })
  it('Should respect round up for non-dealer mangan when enabled', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.WEST,
      han: 4,
      fu: 30,
    })

    Object.assign(ruleset, {
      round_up_mangan: true,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.WEST]: -8000,
      [Winds.SOUTH]: 8000,
    });

    Object.assign(ruleset, {
      round_up_mangan: false,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.WEST]: -7700,
      [Winds.SOUTH]: 7700,
    });
  })
  it('Should ignore fu when dealer beyond mangan', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.EAST,
      deal_in: Winds.WEST,
      han: 7,
      fu: undefined,
    })

    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.WEST]: -18000,
      [Winds.EAST]: 18000,
    });
  })
  it('Should ignore fu when non-dealer beyond mangan', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.WEST,
      han: 7,
      fu: undefined,
    })

    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.WEST]: -12000,
      [Winds.SOUTH]: 12000,
    });
  })
  it('Should respsect honba', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.WEST,
      han: 3,
      fu: 40,
    })
    hand.honba = 3;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.SOUTH]: 6100,
      [Winds.WEST]: -6100,
    });
  })
  it('Should respsect honba points', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.WEST,
      han: 3,
      fu: 40,
    })
    hand.honba = 3;
    ruleset.honba_points = 1500;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.SOUTH]: 9700,
      [Winds.WEST]: -9700,
    });
  })
  it('Should respsect riichi sticks', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.WEST,
      han: 5,
      fu: 20,
      riichi: [Winds.SOUTH, Winds.EAST],
    })
    hand.riichi_sticks = 3;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.SOUTH]: 11000,
      [Winds.WEST]: -8000,
    });
  })
  it('Should respsect riichi cost', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.RON,
      winner: Winds.SOUTH,
      deal_in: Winds.WEST,
      han: 5,
      fu: 20,
      riichi: [Winds.SOUTH],
    })
    hand.riichi_sticks = 3;
    ruleset.riichi_cost = 2500;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.SOUTH]: 15500,
      [Winds.WEST]: -8000,
    });
  })
})

describe(('ResolvePointsDelta Should Work On Tsumo'), ()=> {
  it('Should work on dealer (1,30)', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: 1,
      fu: 30,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 1500,
      [Winds.SOUTH]: -500,
      [Winds.WEST]: -500,
      [Winds.NORTH]: -500,
    });
  })
  it('Should work on non-dealer (1,30)', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.SOUTH,
      han: 1,
      fu: 30,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -500,
      [Winds.SOUTH]: 1100,
      [Winds.WEST]: -300,
      [Winds.NORTH]: -300,
    });
  })
  it('Should round up to dealer mangan when enabled', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: 4,
      fu: 30,
    })
    ruleset.round_up_mangan = true;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 12000,
      [Winds.SOUTH]: -4000,
      [Winds.WEST]: -4000,
      [Winds.NORTH]: -4000,
    });
    ruleset.round_up_mangan = false;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 11700,
      [Winds.SOUTH]: -3900,
      [Winds.WEST]: -3900,
      [Winds.NORTH]: -3900,
    });
  })
  it('Should round up to non-dealer mangan when enabled', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.NORTH,
      han: 3,
      fu: 60,
    })
    ruleset.round_up_mangan = true;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -4000,
      [Winds.SOUTH]: -2000,
      [Winds.WEST]: -2000,
      [Winds.NORTH]: 8000,
    });
    ruleset.round_up_mangan = false;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -3900,
      [Winds.SOUTH]: -2000,
      [Winds.WEST]: -2000,
      [Winds.NORTH]: 7900,
    });
  })
  it('Should ignore fu when dealer go beyond mangan', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: 9,
      fu: undefined,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 24000,
      [Winds.SOUTH]: -8000,
      [Winds.WEST]: -8000,
      [Winds.NORTH]: -8000,
    });
  })
  it('Should ignore fu when non-dealer go beyond mangan', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.SOUTH,
      han: 12,
      fu: undefined,
    })
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -12000,
      [Winds.SOUTH]: 24000,
      [Winds.WEST]: -6000,
      [Winds.NORTH]: -6000,
    });
  })
  it('Should respect honba', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.WEST,
      han: 14,
      fu: undefined,
    })
    hand.honba = 1;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -16100,
      [Winds.SOUTH]: -8100,
      [Winds.WEST]: 32300,
      [Winds.NORTH]: -8100,
    });
  })
  it('Should respect honba points', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.EAST,
      han: 2,
      fu: 70,
    })
    ruleset.honba_points = 1500;
    hand.honba = 2;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: 9900,
      [Winds.SOUTH]: -3300,
      [Winds.WEST]: -3300,
      [Winds.NORTH]: -3300,
    });
  })
  it('Should respect riichi sticks', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.SOUTH,
      han: 3,
      fu: 40,
      riichi: [Winds.WEST, Winds.EAST],
    })
    hand.riichi_sticks = 2;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -2600,
      [Winds.SOUTH]: 7200,
      [Winds.WEST]: -1300,
      [Winds.NORTH]: -1300,
    });
  })
  it('Should respect riichi costs', () => {
    Object.assign(hand_results, {
      outcome: HandOutcomeEnum.TSUMO,
      winner: Winds.NORTH,
      han: 1,
      fu: 110,
      riichi: [],
    })
    hand.riichi_sticks = 1;
    ruleset.riichi_cost = 500;
    expect(hand.ResolvePointsDelta(hand_results, ruleset, players)).toEqual({
      [Winds.EAST]: -1800,
      [Winds.SOUTH]: -900,
      [Winds.WEST]: -900,
      [Winds.NORTH]: 4100,
    });
  })
})