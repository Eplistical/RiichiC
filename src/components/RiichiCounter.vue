<template>
  <!-- pre-game view -->
  <div v-if="!game.on_going && !game.finished">
    <div v-for="wind in Winds">
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-600"
          >{{ WindsDisplayTextMap.wind_character[wind] }}起
        </span>
        <el-input
          v-model="game.players[wind].name"
          :placeholder="wind"
          class="w-50 m-2"
          size="default"
        />
      </el-row>
    </div>
    <el-button type="primary" @click="SetUpGame">开始游戏</el-button>
  </div>

  <!-- in-game view -->
  <div v-if="game.on_going && !game.finished">
    <el-button type="danger" @click="FinishGame">结束游戏</el-button>

    <div>
      <span> {{ current_hand }}, {{ game.honba }} 本场 </span>
      <span> 供托: {{ game.riichi_sticks }} </span>
    </div>

    <el-form :model="game.hand_results">
      <el-form-item label="立直">
        <el-checkbox-group
          fill="#f7bc45"
          v-for="player_id in Winds"
          v-model="game.hand_results.riichi"
          size="default"
        >
          <el-checkbox-button :label="player_id" @change="HandlePlayerRiichi(player_id)">
            {{ game.players[player_id].name }} 立直！
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="对局结果">
        <el-radio-group
          v-for="result in HandOutcomeEnum"
          v-model="game.hand_results.result"
          size="default"
        >
          <el-radio-button :label="result">
            {{ HandOutcomeEnumDisplayTextMap[result] }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="听牌"
        v-if="game.hand_results.result == HandOutcomeEnum.DRAW"
        size="default"
      >
        <el-checkbox-group fill="#289e20" v-model="game.hand_results.tenpai">
          <el-checkbox-button v-for="player_id in Winds" :label="player_id">
            {{ game.players[player_id].name }}
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        label="胡牌"
        v-if="
          game.hand_results.result == HandOutcomeEnum.TSUMO ||
          game.hand_results.result == HandOutcomeEnum.RON
        "
      >
        <el-radio-group
          fill="#289e20"
          v-for="player_id in Winds"
          v-model="game.hand_results.winner"
          size="default"
        >
          <el-radio-button :label="player_id"> {{ game.players[player_id].name }} </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="点炮" v-if="game.hand_results.result == HandOutcomeEnum.RON">
        <el-radio-group
          fill="#e86161"
          v-for="player_id in Winds"
          v-model="game.hand_results.deal_in"
          size="default"
          :disabled="player_id == game.hand_results.winner"
        >
          <el-radio-button :label="player_id"> {{ game.players[player_id].name }} </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="番"
        v-if="game.hand_results.result == 'tsumo' || game.hand_results.result == 'ron'"
      >
        <el-radio-group v-for="han in AllowedHans" v-model="game.hand_results.han" size="default">
          <el-radio-button :label="han">{{
            PointsLadderDisplayMap.hasOwnProperty(han) ? PointsLadderDisplayMap[han] : han
          }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="符"
        v-if="game.hand_results.result == 'tsumo' || game.hand_results.result == 'ron'"
      >
        <el-radio-group
          v-for="fu in AllowedFus[game.hand_results.han]"
          v-model="game.hand_results.fu"
          size="default"
          :disabled="PointsLadderDisplayMap.hasOwnProperty(game.hand_results.han)"
        >
          <el-radio-button :label="fu" />
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="FinishCurrentHand">提交</el-button>
      </el-form-item>
    </el-form>
  </div>

  <el-table :data="points_board" style="width: 100%">
    <el-table-column
      :prop="player_id"
      :label="
        game.players[player_id].name +
        '[' +
        WindsDisplayTextMap.wind_character[game.players[player_id].current_wind] +
        ']'
      "
      v-for="player_id in Winds"
    />
  </el-table>

  <!-- game log view -->
  <el-table
    :data="game.log"
    :default-sort="{ prop: 'log_index', order: 'descending' }"
    style="width: 100%"
    stripe
  >
    <el-table-column fixed prop="hand_signature" label="场" />
    <el-table-column prop="log_index" label="手" />
    <el-table-column prop="beginning_riichi_sticks" label="开局供托" />
    <el-table-column prop="result" label="结果" />
    <el-table-column prop="east_points_delta_with_riichi" :label="game.players[Winds.EAST].name" />
    <el-table-column
      prop="south_points_delta_with_riichi"
      :label="game.players[Winds.SOUTH].name"
    />
    <el-table-column prop="west_points_delta_with_riichi" :label="game.players[Winds.WEST].name" />
    <el-table-column
      prop="north_points_delta_with_riichi"
      :label="game.players[Winds.NORTH].name"
    />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" type="warning" @click="HandleResetLog(scope.$index, scope.row)"
          >重置</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <!-- after-game view -->
  <div v-if="!game.on_going && game.finished">
    游戏结束
    <el-button type="primary" @click="CleanUpGame">新对局</el-button>
  </div>
</template>

<script>
import { ElButton } from 'element-plus'
import { ref } from 'vue'
import { useCookies } from 'vue3-cookies'
import { Winds, NextWindMap, LastWindMap, WindsDisplayTextMap } from './seat_constants.ts'
import { HandOutcomeEnum, HandOutcomeEnumDisplayTextMap } from './hand.ts'
import {
  PointsLadder,
  PointsLadderDisplayMap,
  AllowedHans,
  AllowedFus,
  RonPointsDealer,
  RonPointsNonDealer,
  TsumoPointsDealer,
  TsumoPointsNonDealer
} from './game_constants.ts'
import { MLeagueRuleset } from './rulesets.ts'
import { GetPointMapKey } from './hand.ts'

const DEBUG_FLAG = true

function Log(msg, debug = false) {
  if (!debug || DEBUG_FLAG) {
    console.log(JSON.stringify(msg))
  }
}

const ruleset = MLeagueRuleset

// Initialize game data
function InitGame(game, ruleset) {
  Object.assign(game.value, {
    finished: false,
    round_wind: Winds.EAST,
    hand: 1,
    riichi_sticks: 0,
    honba: 0,
    log: [],
    hand_results: {
      riichi: [],
      tenpai: []
    }
  })
  for (const [_, player_id] of Object.entries(Winds)) {
    game.value.players[player_id].points = ruleset.starting_points
    game.value.players[player_id].current_wind = player_id
  }
  Log(`InitGame: ${JSON.stringify(game)}`)
}

// Sets up a new game. The game must not be on going
function SetUpGame(game, ruleset) {
  Log(`SetUpGame, ruleset: ${JSON.stringify(ruleset)}`)
  if (game.value.on_going === true) {
    alert(`Game is already on going!`)
    return
  }
  InitGame(game, ruleset)
  game.value.on_going = true
}

function ResolveNextHand(game, ruleset) {
  Log('ResolveNextHand')

  let hand_results = game.value.hand_results
  const dealer = FindDealerId(game.value.players)
  const all_last = IsAllLast(game, ruleset)
  let renchan = false
  let honba_increase = false
  let cleanup_riichi_sticks = true
  if (hand_results.result == HandOutcomeEnum.DRAW) {
    cleanup_riichi_sticks = false
    honba_increase = true
    if (game.value.hand_results.tenpai.includes(dealer)) {
      renchan =
        (!all_last && ruleset.dealer_tenpai_renchan) ||
        (all_last && ruleset.all_last_dealer_tenpai_renchan)
    }
  } else {
    if (game.value.hand_results.winner == dealer) {
      honba_increase = true
      renchan = !all_last || ruleset.all_last_dealer_win_renchan
    }
  }

  const game_finished = all_last && !renchan
  return [game_finished, renchan, honba_increase, cleanup_riichi_sticks]
}

function UpdateSeatsAndGameStateForNextHand(
  game,
  ruleset,
  renchan,
  honba_increase,
  cleanup_riichi_sticks
) {
  Log(
    `UpdateSeatsAndGameStateForNextHand: renchan = ${renchan}, honba_increase = ${honba_increase}, cleanup_riichi_sticks = ${cleanup_riichi_sticks}`
  )
  if (!renchan) {
    for (let [_, player] of Object.entries(game.value.players)) {
      player.current_wind = LastWindMap[player.current_wind]
    }

    const num_players = Object.keys(game.value.players).length
    if (game.value.hand == num_players) {
      game.value.round_wind = NextWindMap[game.value.round_wind]
      game.value.hand = 1
    } else {
      game.value.hand += 1
    }
  }
  if (honba_increase) {
    game.value.honba += 1
  } else {
    game.value.honba = 0
  }
  if (cleanup_riichi_sticks) {
    game.value.riichi_sticks = 0
  }
  game.value.hand_results = {
    riichi: [],
    tenpai: []
  }
}

// Sets up a new hand according to last hand's results, and clean up hand results.
// All points changes should be resolved and applied before calling this method.
function SetUpNewHand(game, ruleset) {
  Log('SetUpNewHand')
  if (game.value.on_going == false || game.value.finished === true) {
    alert(`游戏尚未开始/已经结束.`)
    return
  }
  const [game_finished, renchan, honba_increase, cleanup_riichi_sticks] = ResolveNextHand(
    game,
    ruleset
  )
  if (!game_finished) {
    UpdateSeatsAndGameStateForNextHand(
      game,
      ruleset,
      renchan,
      honba_increase,
      cleanup_riichi_sticks
    )
  }
  SaveCookies()
}

// Finds dealer ID from players
function FindDealerId(players) {
  for (const [player_id, info] of Object.entries(players)) {
    if (info.current_wind == Winds.EAST) {
      return player_id
    }
  }
  alert(`FindDealerId: Failed to find dealer in ${JSON.stringify(players)}`)
}

// Checks if current hand is all last
function IsAllLast(game, ruleset) {
  const num_players = Object.keys(game.value.players).length
  return game.hand == num_players && rule.last_round_wind == game.round_wind
}

// Finishes the whole game.
function FinishGame(game, ruleset) {
  Log('FinishGame')
  if (!confirm('确定结束游戏?')) {
    return
  }
  game.value.on_going = false
  game.value.finished = true
  SaveCookies()
}

function CleanUpGame(game, ruleset) {
  Log('CleanUpGame')
  if (!confirm('记录不会保存，确定重开?')) {
    return
  }
  InitGame(game, ruleset)
  ClearCookies()
}

// Helper function, resolves points changes in the case of draw.
function ResolvePointsDeltaOnDraw(game, ruleset) {
  Log(`ResolvePointsDeltaOnDraw`)
  const tenpai = game.value.hand_results.tenpai
  const num_players = Object.keys(game.value.players).length
  const num_tenpai = tenpai ? tenpai.length : 0
  const num_noten = num_players - num_tenpai
  if (tenpai === undefined || num_tenpai === 0 || num_tenpai === num_players) {
    return {}
  }

  const tenpai_delta = ruleset.draw_tenpai_points / num_tenpai
  const noten_delta = -ruleset.draw_tenpai_points / num_noten
  let points_delta = {}
  for (const [_, player_id] of Object.entries(Winds)) {
    if (tenpai.includes(player_id)) {
      points_delta[player_id] = tenpai_delta
    } else {
      points_delta[player_id] = noten_delta
    }
  }
  return points_delta
}

function IsDealer(player) {
  return player.current_wind == Winds.EAST
}

// Helper function, resolves points changes in the case of tsumo.
function ResolvePointsDeltaOnTsumo(game, ruleset) {
  Log(`ResolvePointsDeltaOnTsumo`)
  const num_players = Object.keys(game.value.players).length
  const winner = game.value.hand_results.winner
  const han = game.value.hand_results.han
  const fu = game.value.hand_results.fu
  const dealer_win = IsDealer(game.value.players[winner])
  const key = GetPointMapKey(han, fu, ruleset)

  let points_delta = {}
  if (dealer_win) {
    const delta =
      TsumoPointsDealer[key] + (game.value.honba * ruleset.honba_points) / (num_players - 1)
    for (const [_, player_id] of Object.entries(Winds)) {
      if (player_id == winner) {
        points_delta[player_id] = 3 * delta + game.value.riichi_sticks * ruleset.riichi_cost
      } else {
        points_delta[player_id] = -delta
      }
    }
  } else {
    let [raw_non_dealer_delta, raw_dealer_delta] = TsumoPointsNonDealer[key]
    const non_dealer_delta =
      -raw_non_dealer_delta - (game.value.honba * ruleset.honba_points) / (num_players - 1)
    const dealer_delta =
      -raw_dealer_delta - (game.value.honba * ruleset.honba_points) / (num_players - 1)
    const winner_delta =
      -non_dealer_delta * (num_players - 2) -
      dealer_delta +
      game.value.riichi_sticks * ruleset.riichi_cost

    for (const [_, player_id] of Object.entries(Winds)) {
      if (player_id == winner) {
        points_delta[player_id] = winner_delta
      } else if (IsDealer(game.value.players[player_id])) {
        points_delta[player_id] = dealer_delta
      } else {
        points_delta[player_id] = non_dealer_delta
      }
    }
  }
  return points_delta
}

// Helper function, resolves points changes in the case of ron.
function ResolvePointsDeltaOnRon(game, ruleset) {
  Log(`ResolvePointsDeltaOnRon`)
  const winner = game.value.hand_results.winner
  const deal_in = game.value.hand_results.deal_in
  const han = game.value.hand_results.han
  const fu = game.value.hand_results.fu
  const points_map = IsDealer(game.value.players[winner]) ? RonPointsDealer : RonPointsNonDealer
  const key = GetPointMapKey(han, fu, ruleset)
  const delta = points_map[key] + game.value.honba * ruleset.honba_points

  let points_delta = {}
  points_delta[winner] = delta + game.value.riichi_sticks * ruleset.riichi_cost
  points_delta[deal_in] = -delta
  return points_delta
}

// Resolves points changes from current hand resuls.
function ResolvePointsDelta(game, ruleset) {
  Log(`ResolvePointsDelta`)
  const hand_results = game.value.hand_results

  let points_delta = {}
  if (hand_results.result === HandOutcomeEnum.DRAW) {
    return ResolvePointsDeltaOnDraw(game, ruleset)
  } else if (hand_results.result === HandOutcomeEnum.TSUMO) {
    return ResolvePointsDeltaOnTsumo(game, ruleset)
  } else if (hand_results.result === HandOutcomeEnum.RON) {
    return ResolvePointsDeltaOnRon(game, ruleset)
  } else {
    alert(`错误对局结果: ${JSON.stringify(hand_results.result)}`)
  }
  return points_delta
}

function ValidateHandResults(game, ruleset) {
  const hand_results = game.value.hand_results
  if (!Object.values(HandOutcomeEnum).includes(hand_results.result)) {
    return [false, `错误对局结果: ${hand_results.result}`]
  }

  if (hand_results.result == HandOutcomeEnum.DRAW) {
    for (const riichi_player of hand_results.riichi) {
      if (!hand_results.tenpai.includes(riichi_player)) {
        return [false, `立直家未听牌: ${game.value.players[riichi_player].name}`]
      }
    }
  } else if (hand_results.result == HandOutcomeEnum.TSUMO) {
    if (!Object.values(Winds).includes(hand_results.winner)) {
      return [false, `找不到自摸家: ${hand_results.winner}`]
    }
    if (!Object.values(AllowedHans).includes(hand_results.han)) {
      return [false, `番数错误: ${hand_results.han}`]
    }
    if (
      !Object.values(PointsLadder).includes(hand_results.han) &&
      !Object.values(AllowedFus[hand_results.han]).includes(hand_results.fu)
    ) {
      return [false, `符数错误: ${hand_results.fu}`]
    }

    const key = GetPointMapKey(hand_results.han, hand_results.fu, ruleset)
    if (!TsumoPointsNonDealer.hasOwnProperty(key)) {
      return [
        false,
        `番符组合不存在: ${hand_results.result}, ${hand_results.han}, ${hand_results.fu}`
      ]
    }
  } else if (hand_results.result == HandOutcomeEnum.RON) {
    if (!Object.values(Winds).includes(hand_results.winner)) {
      return [false, `找不到胡牌家: ${hand_results.winner}`]
    }
    if (!Object.values(Winds).includes(hand_results.deal_in)) {
      return [false, `找不到点炮家: ${hand_results.deal_in}`]
    }
    if (hand_results.deal_in == hand_results.winner) {
      return [false, `点炮家不能和胡家一样: ${hand_results.winner} == ${hand_results.deal_in}`]
    }
    if (!Object.values(AllowedHans).includes(hand_results.han)) {
      return [false, `番数错误: ${hand_results.han}`]
    }
    if (
      !Object.values(PointsLadder).includes(hand_results.han) &&
      !Object.values(AllowedFus[hand_results.han]).includes(hand_results.fu)
    ) {
      return [false, `符数错误: ${hand_results.fu}`]
    }
    const key = GetPointMapKey(hand_results.han, hand_results.fu, ruleset)
    if (!RonPointsNonDealer.hasOwnProperty(key)) {
      return [
        false,
        `番符组合不存在: ${hand_results.result}, ${hand_results.han}, ${hand_results.fu}`
      ]
    }
  }
  return [true, '']
}

// Handles the current hand results.
function FinishCurrentHand(game, ruleset) {
  Log(`FinishCurrentHand`)

  // Validate hand results
  const [valid, msg] = ValidateHandResults(game, ruleset)
  Log(valid)
  Log(msg)
  if (!valid) {
    alert(msg)
    return
  }

  // resolve and apply points changes
  const points_delta = ResolvePointsDelta(game, ruleset)
  Log(`Resolved points_delta = ${JSON.stringify(points_delta)}`)
  for (const [player_id, delta] of Object.entries(points_delta)) {
    game.value.players[player_id].points += delta
  }

  // create hand log at the end a hand
  let hand_log = {
    log_index: game.value.log.length,

    // for reset
    on_going: JSON.parse(JSON.stringify(game.value.on_going)),
    finished: JSON.parse(JSON.stringify(game.value.finished)),
    round_wind: JSON.parse(JSON.stringify(game.value.round_wind)),
    round_wind: JSON.parse(JSON.stringify(game.value.round_wind)),
    hand: JSON.parse(JSON.stringify(game.value.hand)),
    honba: JSON.parse(JSON.stringify(game.value.honba)),
    players: JSON.parse(JSON.stringify(game.value.players)),
    hand_results: JSON.parse(JSON.stringify(game.value.hand_results)),

    // for display
    beginning_riichi_sticks: game.value.riichi_sticks - game.value.hand_results.riichi.length,
    hand_signature: `${WindsDisplayTextMap.wind_character[game.value.round_wind]}${game.value.hand}-${game.value.honba}`,
    result: HandOutcomeEnumDisplayTextMap[game.value.hand_results.result],
    riichi: JSON.parse(JSON.stringify(game.value.hand_results.riichi))
  }
  for (const [_, player_id] of Object.entries(Winds)) {
    const delta = points_delta.hasOwnProperty(player_id) ? points_delta[player_id] : 0
    const riichi = game.value.hand_results.riichi.includes(player_id)
    hand_log[`${player_id}_points_delta_with_riichi`] =
      `${delta - (riichi ? ruleset.riichi_cost : 0)}`
    if (riichi) {
      hand_log[`${player_id}_points_delta_with_riichi`] += '(立直)'
    }
  }

  if (game.value.hand_results.result == HandOutcomeEnum.DRAW) {
    hand_log.result += `[${game.value.hand_results.tenpai.map((x) => {
      return game.value.players[x].name
    })}]`
  } else if (game.value.hand_results.result == HandOutcomeEnum.TSUMO) {
    hand_log.result = `${game.value.players[game.value.hand_results.winner].name}` + hand_log.result
    const key = GetPointMapKey(game.value.hand_results.han, game.value.hand_results.fu, ruleset)
    if (PointsLadderDisplayMap.hasOwnProperty(key)) {
      hand_log.result += `[${PointsLadderDisplayMap[key]}]`
    } else {
      hand_log.result += `[${key}]`
    }
  } else if (game.value.hand_results.result == HandOutcomeEnum.RON) {
    hand_log.result = `${game.value.players[game.value.hand_results.winner].name}` + hand_log.result
    const key = GetPointMapKey(game.value.hand_results.han, game.value.hand_results.fu, ruleset)
    if (PointsLadderDisplayMap.hasOwnProperty(key)) {
      hand_log.result += `[${PointsLadderDisplayMap[key]}]`
    } else {
      hand_log.result += `[${key}]`
    }
  }
  game.value.log.push(hand_log)

  // set up a next hand.
  SetUpNewHand(game, ruleset)
  SaveCookies()
}

// Handle player riichi event
function HandlePlayerRiichi(player_id, game, ruleset) {
  Log(`HandlePlayerRiichi called for ${player_id}`)
  let player = game.value.players[player_id]
  if (game.value.hand_results.riichi.includes(player_id)) {
    player.points -= ruleset.riichi_cost
    game.value.riichi_sticks += 1
  } else {
    player.points += ruleset.riichi_cost
    game.value.riichi_sticks -= 1
  }
}

function HandleResetLog(game, ruleset, index, row) {
  Log(`HandleResetLog: ${index}, ${JSON.stringify(row)}`)
  if (!confirm(`确定重置？`)) {
    return
  }
  // reset game state
  Object.assign(game.value, {
    on_going: row.on_going,
    finished: row.finished,
    round_wind: row.round_wind,
    hand: row.hand,
    honba: row.honba,
    players: row.players,
    hand_results: row.hand_results,
    riichi_sticks: row.beginning_riichi_sticks + row.riichi.length
  })
  // clean up logs after the target log index
  game.value.log = game.value.log.slice(0, row.log_index + 1)

  // Update states to next hand
  const [game_finished, renchan, honba_increase, cleanup_riichi_sticks] = ResolveNextHand(
    game,
    ruleset
  )
  if (!game_finished) {
    UpdateSeatsAndGameStateForNextHand(
      game,
      ruleset,
      renchan,
      honba_increase,
      cleanup_riichi_sticks
    )
  }

  SaveCookies()
}

const game = ref({
  on_going: false,
  // the keys are statring wind, also used as player id throughout the game.
  players: {
    [Winds.EAST]: {
      name: '赤木',
      current_wind: Winds.EAST
    },
    [Winds.SOUTH]: {
      name: '原田',
      current_wind: Winds.SOUTH
    },
    [Winds.WEST]: {
      name: '瓦西子',
      current_wind: Winds.WEST
    },
    [Winds.NORTH]: {
      name: '天',
      current_wind: Winds.NORTH
    }
  }
})

const { cookies } = useCookies(['game'])

function SaveCookies() {
  Log(`SaveCookies game: ${game.value.round_wind}-${game.value.hand}-${game.value.honba}`)
  cookies.set('game', game.value, '10m')
  Log(
    `SaveCookies ck: ${cookies.get('game').round_wind}-${cookies.get('game').hand}-${cookies.get('game').honba}`
  )
}

function LoadCookies() {
  Object.assign(game.value, cookies.get('game'))
}

function ClearCookies() {
  Log(`ClearCookies`)
  cookies.remove('game')
}

export default {
  name: 'RiichiCounter',
  components: {
    ElButton
  },
  setup() {
    Log('Setup')
  },
  created() {
    Log('created')
  },
  mounted() {
    Log('mounted')
    LoadCookies()
    // save data to cookie every 5s
    window.setInterval(this.SaveCookies, 5000)
  },
  data: function () {
    return {
      game: game,
      Winds: Winds,
      WindsDisplayTextMap: WindsDisplayTextMap,
      HandOutcomeEnum: HandOutcomeEnum,
      HandOutcomeEnumDisplayTextMap: HandOutcomeEnumDisplayTextMap,
      PointsLadder: PointsLadder,
      PointsLadderDisplayMap: PointsLadderDisplayMap,
      AllowedHans: AllowedHans,
      AllowedFus: AllowedFus
    }
  },
  computed: {
    current_hand() {
      if (game.value.on_going === true) {
        return `${WindsDisplayTextMap.wind_character[game.value.round_wind]}${game.value.hand}局`
      } else {
        return `对局未开始`
      }
    },
    points_board() {
      let board = {}
      for (let [_, player_id] of Object.entries(Winds)) {
        board[player_id] = game.value.players[player_id].points
      }
      return [board]
    }
  },
  methods: {
    SetUpGame: () => {
      SetUpGame(game, ruleset)
    },
    FinishGame: () => {
      FinishGame(game, ruleset)
    },
    CleanUpGame: () => {
      CleanUpGame(game, ruleset)
    },
    HandlePlayerRiichi: (player_id) => {
      HandlePlayerRiichi(player_id, game, ruleset)
    },
    FinishCurrentHand: () => {
      FinishCurrentHand(game, ruleset)
    },
    HandleResetLog: (index, row) => {
      HandleResetLog(game, ruleset, index, row)
    },
    LoadCookies: () => {
      LoadCookies()
    },
    SaveCookies: () => {
      SaveCookies()
    },
    ClearCookies: () => {
      ClearCookies()
    }
  }
}
</script>
