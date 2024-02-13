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
          v-for="result in HandResults"
          v-model="game.hand_results.result"
          size="default"
        >
          <el-radio-button :label="result"> {{ ResultDisplayTextMap[result] }} </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="听牌" v-if="game.hand_results.result == HandResults.DRAW" size="default">
        <el-checkbox-group v-model="game.hand_results.tenpai">
          <el-checkbox-button v-for="player_id in Winds" :label="player_id">
            {{ game.players[player_id].name }}
          </el-checkbox-button>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        label="胡牌"
        v-if="
          game.hand_results.result == HandResults.TSUMO ||
          game.hand_results.result == HandResults.RON
        "
      >
        <el-radio-group
          v-for="player_id in Winds"
          v-model="game.hand_results.winner"
          size="default"
        >
          <el-radio-button :label="player_id"> {{ game.players[player_id].name }} </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="点炮" v-if="game.hand_results.result == HandResults.RON">
        <el-radio-group
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

  <el-table
    :data="game.log"
    :default-sort="{ prop: 'log_index', order: 'descending' }"
    style="width: 100%"
    stripe
  >
    <el-table-column prop="log_index" label="手" />
    <el-table-column prop="hand_signature" label="场" />
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

const kDebugFlag = true

const Winds = Object.freeze({
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  NORTH: 'north'
})

const HandResults = Object.freeze({
  TSUMO: 'tsumo',
  RON: 'ron',
  DRAW: 'draw'
})

const NextWindMap = Object.freeze({
  [Winds.EAST]: Winds.SOUTH,
  [Winds.SOUTH]: Winds.WEST,
  [Winds.WEST]: Winds.NORTH,
  [Winds.NORTH]: Winds.EAST
})

const LastWindMap = Object.freeze({
  [Winds.EAST]: Winds.NORTH,
  [Winds.SOUTH]: Winds.EAST,
  [Winds.WEST]: Winds.SOUTH,
  [Winds.NORTH]: Winds.WEST
})

const WindsDisplayTextMap = Object.freeze({
  wind_character: {
    [Winds.EAST]: '东',
    [Winds.SOUTH]: '南',
    [Winds.WEST]: '西',
    [Winds.NORTH]: '北'
  }
})

const ResultDisplayTextMap = Object.freeze({
  [HandResults.DRAW]: '流局',
  [HandResults.TSUMO]: '自摸',
  [HandResults.RON]: '荣和'
})

const PointsLadder = Object.freeze({
  MANGAN: 'MANGAN',
  HANEMAN: 'HANEMAN',
  BAIMAN: 'BAIMAN',
  SANBAIMAN: 'SANBAIMAN',
  YAKUMAN: 'YAKUMAN'
})

const PointsLadderDisplayMap = Object.freeze({
  [PointsLadder.MANGAN]: '满贯',
  [PointsLadder.HANEMAN]: '跳满',
  [PointsLadder.BAIMAN]: '倍满',
  [PointsLadder.SANBAIMAN]: '三倍满',
  [PointsLadder.YAKUMAN]: '役满'
})

const AllowedHans = [1, 2, 3, 4].concat(Object.keys(PointsLadder))

const AllowedFus = Object.freeze({
  [1]: [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110],
  [2]: [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110],
  [3]: [20, 25, 30, 40, 50, 60, 70],
  [4]: [20, 25, 30]
})

const RonPointsNonDealer = Object.freeze({
  [[1, 30]]: 1000,
  [[1, 40]]: 1300,
  [[1, 50]]: 1600,
  [[1, 60]]: 2000,
  [[1, 70]]: 2300,
  [[1, 80]]: 2600,
  [[1, 90]]: 2900,
  [[1, 100]]: 3200,
  [[1, 110]]: 3600,

  [[2, 25]]: 1600,
  [[2, 30]]: 2000,
  [[2, 40]]: 2600,
  [[2, 50]]: 3200,
  [[2, 60]]: 3900,
  [[2, 70]]: 4500,
  [[2, 80]]: 5200,
  [[2, 90]]: 5800,
  [[2, 100]]: 6400,
  [[2, 110]]: 7100,

  [[3, 25]]: 3200,
  [[3, 30]]: 3900,
  [[3, 40]]: 5200,
  [[3, 50]]: 6400,
  [[3, 70]]: 8000,
  [[3, 80]]: 8000,
  [[3, 90]]: 8000,
  [[3, 100]]: 8000,
  [[3, 110]]: 8000,

  [[4, 25]]: 6400,
  [[4, 30]]: 7700,

  [PointsLadder.MANGAN]: 8000,
  [PointsLadder.HANEMAN]: 12000,
  [PointsLadder.BAIMAN]: 16000,
  [PointsLadder.SANBAIMAN]: 24000,
  [PointsLadder.YAKUMAN]: 32000
})

const RonPointsDealer = Object.freeze({
  [[1, 30]]: 1500,
  [[1, 40]]: 2000,
  [[1, 50]]: 2400,
  [[1, 60]]: 2900,
  [[1, 70]]: 3400,
  [[1, 80]]: 3900,
  [[1, 90]]: 4400,
  [[1, 100]]: 4800,
  [[1, 110]]: 5300,

  [[2, 25]]: 2400,
  [[2, 30]]: 2900,
  [[2, 40]]: 3900,
  [[2, 50]]: 4800,
  [[2, 60]]: 5800,
  [[2, 70]]: 6800,
  [[2, 80]]: 7700,
  [[2, 90]]: 8700,
  [[2, 100]]: 9600,
  [[2, 110]]: 10600,

  [[3, 25]]: 4800,
  [[3, 30]]: 5800,
  [[3, 40]]: 7700,
  [[3, 50]]: 9600,
  [[3, 70]]: 11600,

  [[4, 25]]: 9600,
  [[4, 30]]: 11600,

  [PointsLadder.MANGAN]: 12000,
  [PointsLadder.HANEMAN]: 18000,
  [PointsLadder.BAIMAN]: 24000,
  [PointsLadder.SANBAIMAN]: 36000,
  [PointsLadder.YAKUMAN]: 48000
})

const TsumoPointsNonDealer = Object.freeze({
  // [non dealer points, dealer points]
  [[1, 30]]: [300, 500],
  [[1, 40]]: [400, 700],
  [[1, 50]]: [400, 800],
  [[1, 60]]: [500, 1000],
  [[1, 70]]: [600, 1200],
  [[1, 80]]: [700, 1300],
  [[1, 90]]: [800, 1500],
  [[1, 100]]: [800, 1600],
  [[1, 110]]: [900, 1800],

  [[2, 20]]: [400, 700],
  [[2, 30]]: [500, 1000],
  [[2, 40]]: [700, 1300],
  [[2, 50]]: [800, 1600],
  [[2, 60]]: [1000, 2000],
  [[2, 70]]: [1200, 2300],
  [[2, 80]]: [1300, 2600],
  [[2, 90]]: [1500, 2900],
  [[2, 100]]: [1600, 3200],
  [[2, 110]]: [1800, 3600],

  [[3, 20]]: [700, 1300],
  [[3, 25]]: [800, 1600],
  [[3, 30]]: [1000, 2000],
  [[3, 40]]: [1300, 2600],
  [[3, 50]]: [1600, 3200],
  [[3, 70]]: [2000, 3900],

  [[4, 20]]: [1300, 2600],
  [[4, 25]]: [1600, 3200],
  [[4, 30]]: [2000, 3900],

  [PointsLadder.MANGAN]: [2000, 4000],
  [PointsLadder.HANEMAN]: [3000, 6000],
  [PointsLadder.BAIMAN]: [4000, 8000],
  [PointsLadder.SANBAIMAN]: [6000, 12000],
  [PointsLadder.YAKUMAN]: [8000, 16000]
})

const TsumoPointsDealer = Object.freeze({
  // => points all
  [[1, 30]]: 500,
  [[1, 40]]: 700,
  [[1, 50]]: 800,
  [[1, 60]]: 1000,
  [[1, 70]]: 1200,
  [[1, 80]]: 1300,
  [[1, 90]]: 1500,
  [[1, 100]]: 1600,
  [[1, 110]]: 1800,

  [[2, 20]]: 700,
  [[2, 30]]: 1000,
  [[2, 40]]: 1300,
  [[2, 50]]: 1600,
  [[2, 60]]: 2000,
  [[2, 70]]: 2300,
  [[2, 80]]: 2600,
  [[2, 90]]: 2900,
  [[2, 100]]: 3200,
  [[2, 110]]: 3600,

  [[3, 20]]: 1300,
  [[3, 25]]: 1600,
  [[3, 30]]: 2000,
  [[3, 40]]: 2600,
  [[3, 50]]: 3200,
  [[3, 70]]: 3900,

  [[4, 20]]: 2600,
  [[4, 25]]: 3200,
  [[4, 30]]: 3900,

  [PointsLadder.MANGAN]: 4000,
  [PointsLadder.HANEMAN]: 6000,
  [PointsLadder.BAIMAN]: 8000,
  [PointsLadder.SANBAIMAN]: 12000,
  [PointsLadder.YAKUMAN]: 16000
})

function Log(msg, debug = false) {
  if (!debug || kDebugFlag) {
    console.log(JSON.stringify(msg))
  }
}

// Sets up the game.
function SetUpGame(game, rules) {
  if (game.value.on_going === true) {
    alert(`Game is already on going!`)
    return
  }

  Log('SetUpGame, rules: ${JSON.stringify(rules)}')
  game.value.round_wind = Winds.EAST
  game.value.hand = 1
  game.value.honba = 0
  game.value.riichi_sticks = 0
  game.value.log = []
  game.value.hand_results = {
    riichi: [],
    tenpai: []
  }
  for (let [_, player] of Object.entries(game.value.players)) {
    player.starting_points = rules.starting_points
    player.points = rules.starting_points
  }
  game.value.on_going = true
}

// Sets up a new hand according to last hand's results, and clean up hand results.
// All points changes should be resolved and applied before calling this method.
function SetUpNewHand(game, rules) {
  Log('SetUpNewHand')
  if (game.value.on_going == false || game.value.finished === true) {
    alert(`游戏尚未开始/已经结束.`)
    return
  }

  let hand_results = game.value.hand_results
  const dealer = FindDealerId(game.value.players)
  const all_last = IsAllLast(game, rules)
  let renchan = false
  let honba_increase = false
  if (hand_results.result == 'draw') {
    honba_increase = true
    if (game.value.hand_results.tenpai.includes(dealer)) {
      renchan =
        (!all_last && rules.dealer_tenpai_renchan) ||
        (all_last && rules.all_last_dealer_tenpai_renchan)
    }
  } else {
    if (game.value.hand_results.winner == dealer) {
      honba_increase = true
      renchan = !all_last || rules.all_last_dealer_win_renchan
    }
  }

  // Shift winds if game continues
  const game_finished = all_last && !renchan
  if (!game_finished && !renchan) {
    for (let [_, player] of Object.entries(game.value.players)) {
      player.current_wind = LastWindMap[player.current_wind]
    }

    const num_players = Object.keys(game.value.players).length
    if (game.value.hand == num_players) {
      game.value.round_wind = LastWindMap[game.value.round_wind]
      game.value.hand = 1
    } else {
      game.value.hand += 1
    }
  }

  // adjust honba and riichi sticks
  if (honba_increase) {
    game.value.honba += 1
  } else {
    game.value.honba = 0
  }
  if (hand_results.result != 'draw') {
    game.value.riichi_sticks = 0
  }
  game.value.hand_results = {
    riichi: [],
    tenpai: []
  }

  Log(`Game info after setting up new hand: ${JSON.stringify(game.value)}`)
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
function IsAllLast(game, rules) {
  const num_players = Object.keys(game.value.players).length
  return game.hand == num_players && rule.last_round_wind == game.round_wind
}

// Finishes the whole game.
function FinishGame(game, rules) {
  Log('FinishGame')
  confirm('确定结束游戏?')
  game.value.on_going = false
  game.value.finished = true
}

function CleanUpGame(game, rules) {
  Log('CleanUpGame')
  confirm('记录不会保存，确定重开?')
  game.value.finished = false
}

// Helper function, resolves points changes in the case of draw.
function ResolvePointsDeltaOnDraw(game, rules) {
  Log(`ResolvePointsDeltaOnDraw`)
  const tenpai = game.value.hand_results.tenpai
  const num_players = Object.keys(game.value.players).length
  const num_tenpai = tenpai ? tenpai.length : 0
  const num_noten = num_players - num_tenpai
  if (tenpai === undefined || num_tenpai === 0 || num_tenpai === num_players) {
    return {}
  }

  const tenpai_delta = rules.draw_tenpai_points / num_tenpai
  const noten_delta = -rules.draw_tenpai_points / num_noten
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
function ResolvePointsDeltaOnTsumo(game, rules) {
  Log(`ResolvePointsDeltaOnTsumo`)
  const num_players = Object.keys(game.value.players).length
  const winner = game.value.hand_results.winner
  const han = game.value.hand_results.han
  const fu = game.value.hand_results.fu
  const dealer_win = IsDealer(game.value.players[winner])
  const key = GetPointMapKey(han, fu, rules)

  let points_delta = {}
  if (dealer_win) {
    const delta =
      TsumoPointsDealer[key] + (game.value.honba * rules.honba_points) / (num_players - 1)
    for (const [_, player_id] of Object.entries(Winds)) {
      if (player_id == winner) {
        points_delta[player_id] = 3 * delta + game.value.riichi_sticks * rules.riichi_cost
      } else {
        points_delta[player_id] = -delta
      }
    }
  } else {
    let [raw_non_dealer_delta, raw_dealer_delta] = TsumoPointsNonDealer[key]
    const non_dealer_delta =
      -raw_non_dealer_delta - (game.value.honba * rules.honba_points) / (num_players - 1)
    const dealer_delta =
      -raw_dealer_delta - (game.value.honba * rules.honba_points) / (num_players - 1)
    const winner_delta =
      -non_dealer_delta * (num_players - 2) -
      dealer_delta +
      game.value.riichi_sticks * rules.riichi_cost

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

function GetPointMapKey(han, fu, rules) {
  if (PointsLadder.hasOwnProperty(han)) {
    return han
  }
  if (han < 3) {
    return [han, fu]
  } else if (han == 3) {
    if (fu >= 70) {
      return PointsLadder.MANGAN
    } else if (fu == 60 && rules.round_up_mangan) {
      return PointsLadder.MANGAN
    } else {
      return [han, fu]
    }
  } else if (han == 4) {
    if (fu >= 40) {
      return PointsLadder.MANGAN
    } else if (fu == 30 && rules.round_up_mangan) {
      return PointsLadder.MANGAN
    } else {
      return [han, fu]
    }
  } else if (han == 5) {
    return PointsLadder.MANGAN
  } else if (han < 8) {
    return PointsLadder.HANEMAN
  } else if (han < 11) {
    return PointsLadder.BAIMAN
  } else if (han == 13) {
    return PointsLadder.SANBAIMAN
  } else {
    return PointsLadder.YAKUMAN
  }
}

// Helper function, resolves points changes in the case of ron.
function ResolvePointsDeltaOnRon(game, rules) {
  Log(`ResolvePointsDeltaOnRon`)
  const winner = game.value.hand_results.winner
  const deal_in = game.value.hand_results.deal_in
  const han = game.value.hand_results.han
  const fu = game.value.hand_results.fu
  const points_map = IsDealer(game.value.players[winner]) ? RonPointsDealer : RonPointsNonDealer
  const key = GetPointMapKey(han, fu, rules)
  const delta = points_map[key] + game.value.honba * rules.honba_points

  let points_delta = {}
  points_delta[winner] = delta + game.value.riichi_sticks * rules.riichi_cost
  points_delta[deal_in] = -delta
  return points_delta
}

// Resolves points changes from current hand resuls.
function ResolvePointsDelta(game, rules) {
  Log(`ResolvePointsDelta`)
  const hand_results = game.value.hand_results

  let points_delta = {}
  if (hand_results.result === 'draw') {
    return ResolvePointsDeltaOnDraw(game, rules)
  } else if (hand_results.result === 'tsumo') {
    return ResolvePointsDeltaOnTsumo(game, rules)
  } else if (hand_results.result === 'ron') {
    return ResolvePointsDeltaOnRon(game, rules)
  } else {
    alert(`错误对局结果: ${JSON.stringify(hand_results.result)}`)
  }
  return points_delta
}

// Handles the current hand results.
function FinishCurrentHand(game, rules) {
  Log(`FinishCurrentHand`)

  // resolve points changes
  const points_delta = ResolvePointsDelta(game, rules)
  Log(`Resolved points_delta = ${JSON.stringify(points_delta)}`)
  for (const [player_id, delta] of Object.entries(points_delta)) {
    game.value.players[player_id].points += delta
  }

  // store results to log
  let hand_log = {
    log_index: game.value.log.length,
    round_wind: WindsDisplayTextMap.wind_character[game.value.round_wind],
    hand: game.value.hand,
    honba: game.value.honba,
    hand_signature: `${WindsDisplayTextMap.wind_character[game.value.round_wind]}${game.value.hand}-${game.value.honba}`,
    beginning_riichi_sticks: game.value.riichi_sticks - game.value.hand_results.riichi.length,
    result: ResultDisplayTextMap[game.value.hand_results.result],
    riichi: game.value.hand_results.riichi
  }
  for (const [_, player_id] of Object.entries(Winds)) {
    const delta = points_delta.hasOwnProperty(player_id) ? points_delta[player_id] : 0
    const riichi = game.value.hand_results.riichi.includes(player_id)
    hand_log[`${player_id}_points_delta_with_riichi`] =
      `${delta - (riichi ? rules.riichi_cost : 0)}`
    if (riichi) {
      hand_log[`${player_id}_points_delta_with_riichi`] += '(立直)'
    }
  }

  if (game.value.hand_results.result == HandResults.DRAW) {
    hand_log.result += `[${game.value.hand_results.tenpai.map((x) => {
      return game.value.players[x].name
    })}]`
  } else if (game.value.hand_results.result == HandResults.TSUMO) {
    hand_log.result = `${game.value.players[game.value.hand_results.winner].name}` + hand_log.result
    const key = GetPointMapKey(game.value.hand_results.han, game.value.hand_results.fu)
    if (PointsLadderDisplayMap.hasOwnProperty(key)) {
      hand_log.result += `[${PointsLadderDisplayMap[key]}]`
    } else {
      hand_log.result += `[${key}]`
    }
  } else if (game.value.hand_results.result == HandResults.RON) {
    hand_log.result = `${game.value.players[game.value.hand_results.winner].name}` + hand_log.result
    const key = GetPointMapKey(game.value.hand_results.han, game.value.hand_results.fu)
    if (PointsLadderDisplayMap.hasOwnProperty(key)) {
      hand_log.result += `[${PointsLadderDisplayMap[key]}]`
    } else {
      hand_log.result += `[${key}]`
    }
  }
  game.value.log.push(hand_log)

  // set up a next hand.
  SetUpNewHand(game, rules)
}

// Handle player riichi event
function HandlePlayerRiichi(player_id, game, rules) {
  Log(`HandlePlayerRiichi called for ${player_id}`)
  let player = game.value.players[player_id]
  if (game.value.hand_results.riichi.includes(player_id)) {
    player.points -= rules.riichi_cost
    game.value.riichi_sticks += 1
  } else {
    player.points += rules.riichi_cost
    game.value.riichi_sticks -= 1
  }
}

const rules = ref({
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
})

const game = ref({
  on_going: false,
  // the keys are statring wind, also used as player id throughout the game.
  players: {
    [Winds.EAST]: {
      name: '赤木',
      starting_wind: Winds.EAST,
      current_wind: Winds.EAST
    },
    [Winds.SOUTH]: {
      name: '原田',
      starting_wind: Winds.SOUTH,
      current_wind: Winds.SOUTH
    },
    [Winds.WEST]: {
      name: '瓦西子',
      starting_wind: Winds.WEST,
      current_wind: Winds.WEST
    },
    [Winds.NORTH]: {
      name: '天',
      starting_wind: Winds.NORTH,
      current_wind: Winds.NORTH
    }
  }
})

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
  data: function () {
    return {
      game: game,
      Winds: Winds,
      WindsDisplayTextMap: WindsDisplayTextMap,
      HandResults: HandResults,
      ResultDisplayTextMap: ResultDisplayTextMap,
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
      SetUpGame(game, rules.value)
    },
    FinishGame: () => {
      FinishGame(game, rules.value)
    },
    CleanUpGame: () => {
      CleanUpGame(game, rules.value)
    },
    HandlePlayerRiichi: (player_id) => {
      HandlePlayerRiichi(player_id, game, rules.value)
    },
    FinishCurrentHand: () => {
      FinishCurrentHand(game, rules.value)
    }
  }
}
</script>
