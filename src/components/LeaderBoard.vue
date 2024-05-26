<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '@vueuse/core'
import { WindsDisplayTextMap, WindsInOrder } from './seat_constants'
import { NumberDisplayMap } from './game_constants'
import { GET_STATS_API, LIST_GAMES_API } from './app_constants'

const emit = defineEmits(['toGame'])

const init_date = ref(false)
const raw_stats = ref({})
const raw_games = ref({})
const date_range = ref([])

const RefreshDataText = ref('刷新数据')
const DateRangeTitleText = ref('统计范围')
const LeaderBoardTitleText = ref('排行榜')
const GameRecordsTitleText = ref('具体场次')
const ToGameText = ref('返回游戏')

const StartDateText = ref('开始日期')
const EndDateText = ref('结束日期')

const NameColumnText = ref('选手')
const PointsWithUmaColumnText = ref('积分')
const PointsColumnText = ref('素点')
const GamesCountText = ref('试合')
const AvgRankColumnText = ref('平着')
const Top1RateColumnText = ref('TOP率')
const Top2RateColumnText = ref('连对率')
const Top3RateColumnText = ref('避四率')
const MaxPointsColumnText = ref('最高得点')
const AvgPointsColumnText = ref('场均得点')

const GamePlayerColumnText = ref('选手')
const GameRankColumnText = ref('点数顺位')
const GamePointsColumnText = ref('点数')
const GamePointsWithUmaColumnText = ref('精算')
const GameDetailsColumnText = ref('立/和/铳')
const TotalGameCountText = ref('总场次')

onMounted(() => {
  if (init_date.value == false) {
    date_range.value = getDefaultDateRange()
    init_date.value = true
  }
  RefreshData()
})

function fetchLeaderBoard(start_date, end_date, player_name) {
  console.log(`FetchLeaderBoard range: ${start_date} to ${end_date} player: ${player_name}`)
  return useFetch(`${GET_STATS_API}?action=get_stats&start_date=${start_date}&end_date=${end_date}`)
    .get()
    .json().data
}

function fetchGames(start_date, end_date, player_name) {
  console.log(`fetchGames range: ${start_date} to ${end_date} player: ${player_name}`)
  return useFetch(
    `${LIST_GAMES_API}?action=list_games&start_date=${start_date}&end_date=${end_date}`
  )
    .get()
    .json().data
}

function RefreshData() {
  console.log('RefreshData')
  const start_date = date_range.value[0]
  const end_date = date_range.value[1]
  const start_date_int =
    start_date.getFullYear() * 10000 + (start_date.getMonth() + 1) * 100 + start_date.getDate()
  const end_date_int =
    end_date.getFullYear() * 10000 + (end_date.getMonth() + 1) * 100 + end_date.getDate()
  raw_stats.value = fetchLeaderBoard(start_date_int, end_date_int)
  raw_games.value = fetchGames(start_date_int, end_date_int)
}

function getDefaultDateRange() {
  const today = new Date()
  return [
    new Date(today.getFullYear(), today.getMonth(), 1),
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
  ]
}

function getGameRecordTable(game) {
  let table = []
  for (const wind of WindsInOrder) {
    const row = {
      player: `[${WindsDisplayTextMap[wind]}]${game[wind].name}`,
      rank: `${NumberDisplayMap[game[wind].rank]}位`,
      points: game[wind].points,
      points_with_uma: (game[wind].points_with_uma - 25000) / 1000,
      game_details: `${game[wind].riichi}/${game[wind].agari}/${game[wind].deal_in}`
    }
    table.push(row)
  }
  return table
}

function GenerateGameLabel(game) {
  const timestamp = game.record_timestamp
  const id = game.game_id
  return `[${timestamp.substr(0, timestamp.length - 3)}] ${id.substr(0, 8)}`
}

const ComputedLeaderBoard = computed(() => {
  console.log('Generate ComputedLeaderBoard')
  let table = []
  if (!raw_stats.value || !raw_stats.value.value) {
    return table
  }
  let idx = 0
  let max_top1_rate = 0.0
  let max_top1_rate_idx = []
  let max_top2_rate = 0.0
  let max_top2_rate_idx = []
  let max_top3_rate = 0.0
  let max_top3_rate_idx = []
  let max_max_points = 0
  let max_max_points_idx = []
  let max_avg_points = 0
  let max_avg_points_idx = []
  for (const stats of raw_stats.value.value.stats) {
    const top1_rate = (stats.top_k_count_map[1] / stats.games_count) * 100
    const top2_rate = (stats.top_k_count_map[2] / stats.games_count) * 100
    const top3_rate = (stats.top_k_count_map[3] / stats.games_count) * 100
    const avg_points = stats.points_sum / stats.games_count
    const row = {
      name: `[${idx + 1}]${stats.player_name}`,
      points_with_uma: (stats.points_sum_with_uma - 25000 * stats.games_count) / 1000,
      points: (stats.points_sum - 25000 * stats.games_count) / 1000,
      games_count: `${stats.games_count}[${stats.place_count_map[1]}|${stats.place_count_map[2]}|${stats.place_count_map[3]}|${stats.place_count_map[4]}]`,
      avg_rank: (stats.rank_sum / stats.games_count).toFixed(2),
      top1_rate: `${top1_rate.toFixed(1)}%`,
      top2_rate: `${top2_rate.toFixed(1)}%`,
      top3_rate: `${top3_rate.toFixed(1)}%`,
      max_points: stats.max_points,
      avg_points: avg_points.toFixed(0),

      max_top1_rate: false,
      max_top2_rate: false,
      max_top3_rate: false,
      max_max_points: false,
      max_avg_points: false
    }
    // find max top 1 rate
    if (top1_rate > max_top1_rate) {
      max_top1_rate = top1_rate
      max_top1_rate_idx = [idx]
    } else if (top1_rate == max_top1_rate) {
      max_top1_rate_idx.push(idx)
    }
    // find max top 2 rate
    if (top2_rate > max_top2_rate) {
      max_top2_rate = top2_rate
      max_top2_rate_idx = [idx]
    } else if (top2_rate == max_top2_rate) {
      max_top2_rate_idx.push(idx)
    }
    // find max top 3 rate
    if (top3_rate > max_top3_rate) {
      max_top3_rate = top3_rate
      max_top3_rate_idx = [idx]
    } else if (top3_rate == max_top3_rate) {
      max_top3_rate_idx.push(idx)
    }
    // find max of max_points
    if (stats.max_points > max_max_points) {
      max_max_points = stats.max_points
      max_max_points_idx = [idx]
    } else if (stats.max_points == max_max_points) {
      max_max_points_idx.push(idx)
    }
    // find max of avg_points
    if (avg_points > max_avg_points) {
      max_avg_points = avg_points
      max_avg_points_idx = [idx]
    } else if (avg_points == max_avg_points) {
      max_avg_points_idx.push(idx)
    }
    table.push(row)
    idx += 1
  }

  for (let i of max_top1_rate_idx) {
    table[i].max_top1_rate = true
  }
  for (let i of max_top2_rate_idx) {
    table[i].max_top2_rate = true
  }
  for (let i of max_top3_rate_idx) {
    table[i].max_top3_rate = true
  }
  for (let i of max_max_points_idx) {
    table[i].max_max_points = true
  }
  for (let i of max_avg_points_idx) {
    table[i].max_avg_points = true
  }
  return table
})
</script>

<template>
  <div>
    <el-divider> {{ DateRangeTitleText }} </el-divider>
    <el-space wrap>
    <el-row>
      <el-col :span="6">
        {{ StartDateText }}
      </el-col>
      <el-col :span="18">
        <el-date-picker v-model="date_range[0]" type="date" />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        {{ EndDateText }}
      </el-col>
      <el-col :span="18">
        <el-date-picker v-model="date_range[1]" type="date" />
      </el-col>
    </el-row>
    <el-row>
      <el-button type="primary" @click="RefreshData">{{ RefreshDataText }}</el-button>
      <el-button type="primary" @click="$emit('toGame', $event)">{{ ToGameText }}</el-button>
    </el-row>
    </el-space>

    <el-text type="danger"> 内测中</el-text>
    <el-divider> {{ LeaderBoardTitleText }} </el-divider>
    <el-table :data="ComputedLeaderBoard" style="width: 100%" stripe table-layout="auto">
      <el-table-column fixed prop="name" :label="NameColumnText" />
      <el-table-column prop="points_with_uma" :label="PointsWithUmaColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.points_with_uma >= 0 ? `success` : `danger`">
            {{ scope.row.points_with_uma }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="points" :label="PointsColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.points >= 0 ? `success` : `danger`">
            {{ scope.row.points }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="games_count" :label="GamesCountText" />
      <el-table-column prop="avg_rank" :label="AvgRankColumnText" />
      <el-table-column prop="top1_rate" :label="Top1RateColumnText">
        <template #default="scope">
          <el-text :type="scope.row.max_top1_rate == true ? `success` : ``">
            {{ scope.row.top1_rate }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="top2_rate" :label="Top2RateColumnText">
        <template #default="scope">
          <el-text :type="scope.row.max_top2_rate == true ? `success` : ``">
            {{ scope.row.top2_rate }}
          </el-text>
        </template>
      </el-table-column>

      <el-table-column prop="top3_rate" :label="Top3RateColumnText">
        <template #default="scope">
          <el-text :type="scope.row.max_top3_rate == true ? `success` : ``">
            {{ scope.row.top3_rate }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="max_points" :label="MaxPointsColumnText">
        <template #default="scope">
          <el-text :type="scope.row.max_max_points == true ? `success` : ``">
            {{ scope.row.max_points }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="avg_points" :label="AvgPointsColumnText">
        <template #default="scope">
          <el-text :type="scope.row.max_avg_points == true ? `success` : ``">
            {{ scope.row.avg_points }}
          </el-text>
        </template>
      </el-table-column>
    </el-table>
    <el-divider />
    <el-collapse>
      <el-collapse-item
        :title="`${TotalGameCountText}: ${raw_games.value && !raw_games.value.value ? raw_games.value.count : 0}`"
      >
        <div v-if="raw_games.value && !raw_games.value.value">
          <div v-for="i in raw_games.value.count">
            <el-text type="primary">
              {{ 
                GenerateGameLabel(raw_games.value.games[i - 1])
              }}
            </el-text>
            <el-table
              :data="getGameRecordTable(raw_games.value.games[i - 1])"
              style="width: 100%"
              stripe
              table-layout="auto"
            >
              <el-table-column prop="player" :label="GamePlayerColumnText" />
              <el-table-column prop="rank" :label="GameRankColumnText" />
              <el-table-column prop="points" :label="GamePointsColumnText" />
              <el-table-column prop="points_with_uma" :label="GamePointsWithUmaColumnText" />
              <el-table-column prop="game_details" :label="GameDetailsColumnText" />
            </el-table>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-divider />
  </div>
</template>
