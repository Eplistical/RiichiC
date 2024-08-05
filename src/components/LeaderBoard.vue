<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '@vueuse/core'
import { Game } from './game'
import { WindsDisplayTextMap, WindsInOrder } from './seat_constants'
import { PlaceNumberDisplayMap } from './game_constants'
import { Lang, GET_STATS_API, LIST_GAMES_API } from './app_constants'
import { RulesetName, UploadableRulesets, FixedRulesetMap } from './rulesets'

const props = defineProps({
  language: String,
  ruleset_id: String
})

const emit = defineEmits(['toGame'])

const init_date = ref(false)
const raw_stats = ref({})
const raw_games = ref({})
const date_range = ref([])

const detailed_game_log_visible = ref(false)
const detailed_game_log_index = ref(undefined)
const detailed_game_logs = computed(() => {
  return parseGameLogs(raw_games.value.value.games[detailed_game_log_index.value - 1].game_logs)
})

const RefreshDataText = computed(() => {
  if (props.language == Lang.CN) {
    return '刷新数据'
  } else if (props.language == Lang.EN) {
    return 'Refresh'
  }
})

const DateRangeTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return '统计范围'
  } else if (props.language == Lang.EN) {
    return 'Stats Range'
  }
})

const LeaderBoardTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `${RulesetName[props.ruleset_id][props.language]}`
  } else if (props.language == Lang.EN) {
    return `${RulesetName[props.ruleset_id][props.language]}`
  }
})

const ToGameText = computed(() => {
  if (props.language == Lang.CN) {
    return '主界面'
  } else if (props.language == Lang.EN) {
    return 'Main Panel'
  }
})

const StartDateText = computed(() => {
  if (props.language == Lang.CN) {
    return '开始日期'
  } else if (props.language == Lang.EN) {
    return 'Start Date'
  }
})
const EndDateText = computed(() => {
  if (props.language == Lang.CN) {
    return '结束日期'
  } else if (props.language == Lang.EN) {
    return 'End Date'
  }
})

const NameColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '选手'
  } else if (props.language == Lang.EN) {
    return 'Player'
  }
})
const PointsWithUmaColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '积分'
  } else if (props.language == Lang.EN) {
    return 'Total Pt'
  }
})
const PointsColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '素点'
  } else if (props.language == Lang.EN) {
    return 'Base Pt'
  }
})
const GamesCountText = computed(() => {
  if (props.language == Lang.CN) {
    return '试合'
  } else if (props.language == Lang.EN) {
    return 'Games'
  }
})
const ChomboCountText = computed(() => {
  if (props.language == Lang.CN) {
    return '犯规'
  } else if (props.language == Lang.EN) {
    return 'Chombo'
  }
})
const AvgRankColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '平着'
  } else if (props.language == Lang.EN) {
    return 'Avg Rank'
  }
})
const Top1RateColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return 'TOP率'
  } else if (props.language == Lang.EN) {
    return '1st%'
  }
})
const Top2RateColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '连对率'
  } else if (props.language == Lang.EN) {
    return 'Half%'
  }
})
const Top3RateColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '避四率'
  } else if (props.language == Lang.EN) {
    return 'Non4th%'
  }
})
const MaxPointsColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '最高得点'
  } else if (props.language == Lang.EN) {
    return 'Max Score'
  }
})
const AvgPointsColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '场均得点'
  } else if (props.language == Lang.EN) {
    return 'Avg Score'
  }
})
const RiichiRateColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '立直率'
  } else if (props.language == Lang.EN) {
    return 'Riichi%'
  }
})
const AgariRateColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '和率'
  } else if (props.language == Lang.EN) {
    return 'Agari%'
  }
})
const DealInRateColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '铳率'
  } else if (props.language == Lang.EN) {
    return 'Dealin%'
  }
})
const AvgAgariPtColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '平均和牌打点'
  } else if (props.language == Lang.EN) {
    return 'Avg Agari Income'
  }
})
const AvgDealInPtColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '平均放铳损失'
  } else if (props.language == Lang.EN) {
    return 'Avg Deal-in Cost'
  }
})
const ExpectedPtColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '期望得点'
  } else if (props.language == Lang.EN) {
    return 'Exp. Val.'
  }
})

const GamePlayerColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '选手'
  } else if (props.language == Lang.EN) {
    return 'Player'
  }
})
const GameRankColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '顺位'
  } else if (props.language == Lang.EN) {
    return 'Place'
  }
})
const GamePointsColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '点数'
  } else if (props.language == Lang.EN) {
    return 'Points'
  }
})
const GamePointsWithUmaColumnText = computed(() => {
  if (props.language == Lang.CN) {
    return '精算'
  } else if (props.language == Lang.EN) {
    return 'Pt'
  }
})

function GameDetailsColumnText(game) {
  const has_chombo = HasChombo(game)
  let text
  if (props.language == Lang.CN) {
    text = '立/和/铳/听'
    if (has_chombo) {
      text += '/罚'
    }
  } else if (props.language == Lang.EN) {
    text = 'R/A/D/T'
    if (has_chombo) {
      text += '/C'
    }
  }
  return text
}

const TotalGameCountText = computed(() => {
  if (props.language == Lang.CN) {
    return '总场次'
  } else if (props.language == Lang.EN) {
    return 'Games Count'
  }
})
const HandsCountText = computed(() => {
  if (props.language == Lang.CN) {
    return '局数'
  } else if (props.language == Lang.EN) {
    return 'Hands'
  }
})

const NoDatabaseForRulesetIdText = computed(() => {
  if (props.language == Lang.CN) {
    return '此规则没有配置后台数据库'
  } else if (props.language == Lang.EN) {
    return 'The Selected Ruleset Does Not Have Database'
  }
})

const GameLogNotAvailableText = computed(() => {
  if (props.language == Lang.CN) {
    return '未找到详细游戏日志'
  } else if (props.language == Lang.EN) {
    return 'Detailed Game Log Not Available'
  }
})

const DetailedGameLogText = computed(() => {
  if (props.language == Lang.CN) {
    return '详细游戏日志'
  } else if (props.language == Lang.EN) {
    return 'Detailed Game Log'
  }
})

const ruleset = computed(() => {
  return FixedRulesetMap[props.ruleset_id]
})

function parseGameLogs(game_logs) {
  return Game.ParseGameLogsFromObject(ruleset.value, game_logs)
}

function GetPlayerSummary(game, starting_wind) {
  return `${game[starting_wind].name}[${WindsDisplayTextMap[starting_wind][props.language]}][${PlaceNumberDisplayMap[game[starting_wind].rank][props.language]}]`
}

onMounted(() => {
  if (init_date.value == false) {
    date_range.value = getDefaultDateRange()
    init_date.value = true
  }
  RefreshData()
})

function fetchLeaderBoard(start_date, end_date, player_name) {
  console.log(
    `FetchLeaderBoard range: ${start_date} to ${end_date} player: ${player_name} ruleset_id: ${props.ruleset_id}`
  )
  return useFetch(
    `${GET_STATS_API}?action=get_stats&start_date=${start_date}&end_date=${end_date}&ruleset_id=${props.ruleset_id}`
  )
    .get()
    .json().data
}

function fetchGames(start_date, end_date, player_name) {
  console.log(
    `fetchGames range: ${start_date} to ${end_date} player: ${player_name} ruleset_id: ${props.ruleset_id}`
  )
  return useFetch(
    `${LIST_GAMES_API}?action=list_games&start_date=${start_date}&end_date=${end_date}&ruleset_id=${props.ruleset_id}`
  )
    .get()
    .json().data
}

function RefreshData() {
  console.log('RefreshData')
  if (!UploadableRulesets.has(props.ruleset_id)) {
    alert(`${NoDatabaseForRulesetIdText.value}: ${RulesetName[props.ruleset_id][props.language]}`)
    return
  }
  const start_date = date_range.value[0]
  const end_date = date_range.value[1]
  const start_date_int =
    start_date.getFullYear() * 10000 + (start_date.getMonth() + 1) * 100 + start_date.getDate()
  const end_date_int =
    end_date.getFullYear() * 10000 + (end_date.getMonth() + 1) * 100 + end_date.getDate()
  raw_stats.value = fetchLeaderBoard(start_date_int, end_date_int)
  raw_games.value = fetchGames(start_date_int, end_date_int)
  console.log('Getting stats=', raw_stats.value)
  console.log('Getting games=', raw_games.value)
}

function getDefaultDateRange() {
  const today = new Date()
  return [
    new Date(today.getFullYear(), today.getMonth(), 1),
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
  ]
}

function gamePointsDisplay(end_pt, pt_with_uma, starting_points) {
  const adjusted_pt_with_uma = (pt_with_uma - starting_points) / 1000
  return `${end_pt}(${adjusted_pt_with_uma > 0 ? '+' : ''}${adjusted_pt_with_uma.toFixed(1)})`
}

function getGameRecordTable(game) {
  const has_chombo = HasChombo(game)
  let table = []
  if (!(props.ruleset_id in FixedRulesetMap)) {
    return table
  }
  const starting_points = FixedRulesetMap[props.ruleset_id].starting_points
  for (const wind of WindsInOrder) {
    const row = {
      player: GetPlayerSummary(game, wind),
      rank: game[wind].rank,
      points: gamePointsDisplay(game[wind].points, game[wind].points_with_uma, starting_points),
      game_details:
        `${game[wind].riichi}/${game[wind].agari}/${game[wind].deal_in}/${game[wind].tenpai_on_draw}` +
        (has_chombo ? `/${game[wind].chombo}` : ``),
      avg_agari_points:
        game[wind].agari == 0 ? 0 : Math.round(game[wind].agari_pt_sum / game[wind].agari),
      avg_deal_in_points:
        game[wind].deal_in == 0 ? 0 : Math.round(-game[wind].deal_in_pt_sum / game[wind].deal_in)
    }
    table.push(row)
  }
  table.sort((a, b) => {
    return a.rank - b.rank
  })
  return table
}

function GenerateGameLabel(game) {
  return `[${game.game_date}] ${game.game_id.substr(0, 8)} ${HandsCountText.value}: ${game.game_hand_count}`
}

function HasChombo(game) {
  for (const wind of WindsInOrder) {
    if (game[wind].chombo > 0) {
      return true
    }
  }
  return false
}

const ComputedLeaderBoard = computed(() => {
  console.log('Generate ComputedLeaderBoard')
  let table = []
  if (!raw_stats.value || !raw_stats.value.value) {
    return table
  }
  if (!(props.ruleset_id in FixedRulesetMap)) {
    return table
  }
  const starting_points = FixedRulesetMap[props.ruleset_id].starting_points
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
      points_with_uma:
        (stats.points_sum_with_uma - starting_points * stats.games_count) / 1000 -
        20.0 * stats.chombo_sum,
      points: (stats.points_sum - starting_points * stats.games_count) / 1000,
      games_count: `${stats.games_count}[${stats.place_count_map[1]}|${stats.place_count_map[2]}|${stats.place_count_map[3]}|${stats.place_count_map[4]}]`,
      chombo_count: stats.chombo_sum,
      avg_rank: stats.rank_sum / stats.games_count,
      top1_rate: top1_rate,
      top2_rate: top2_rate,
      top3_rate: top3_rate,
      max_points: stats.max_points,
      avg_points: avg_points,

      riichi_rate: stats.hand_count == 0 ? 0 : stats.riichi_sum / stats.hand_count,
      agari_rate: stats.hand_count == 0 ? 0 : stats.agari_sum / stats.hand_count,
      avg_agari_points: stats.agari_sum == 0 ? 0 : stats.agari_pt_sum / stats.agari_sum,
      deal_in_rate: stats.hand_count == 0 ? 0 : stats.deal_in_sum / stats.hand_count,
      avg_deal_in_points: stats.deal_in_sum == 0 ? 0 : -stats.deal_in_pt_sum / stats.deal_in_sum,

      max_top1_rate: false,
      max_top2_rate: false,
      max_top3_rate: false,
      max_max_points: false,
      max_avg_points: false
    }
    // expected points
    row.expected_points =
      row.agari_rate * row.avg_agari_points - row.deal_in_rate * row.avg_deal_in_points
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

function AvgRankFormatter(row, col) {
  return row.avg_rank.toFixed(2)
}

function RateFormatter(rate) {
  return `${rate.toFixed(1)}%`
}

function RiichiRateFormatter(row, col) {
  return `${(row.riichi_rate * 100).toFixed(2)}%`
}

function AgariRateFormatter(row, col) {
  return `${(row.agari_rate * 100).toFixed(2)}%`
}

function DealInRateFormatter(row, col) {
  return `${(row.deal_in_rate * 100).toFixed(2)}%`
}

function ExpectedPtFormatter(row, col) {
  return `${Math.round(row.expected_points)}`
}

function DisplayDetailedGameLog(i) {
  console.log('DisplayDetailedGameLog called', i)
  detailed_game_log_visible.value = true
  detailed_game_log_index.value = i
}
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

    <el-divider> {{ LeaderBoardTitleText }} </el-divider>
    <el-table :data="ComputedLeaderBoard" style="width: 100%" stripe table-layout="auto">
      <el-table-column fixed prop="name" :label="NameColumnText" />
      <el-table-column prop="points_with_uma" :label="PointsWithUmaColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.points_with_uma >= 0 ? `success` : `danger`">
            {{ scope.row.points_with_uma.toFixed(1) }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="points" :label="PointsColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.points >= 0 ? `success` : `danger`">
            {{ scope.row.points.toFixed(1) }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="games_count" :label="GamesCountText" />
      <el-table-column
        prop="avg_rank"
        :label="AvgRankColumnText"
        :formatter="AvgRankFormatter"
        sortable
      />
      <el-table-column prop="avg_points" :label="AvgPointsColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.max_avg_points == true ? `success` : ``">
            {{ scope.row.avg_points.toFixed(0) }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="max_points" :label="MaxPointsColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.max_max_points == true ? `success` : ``">
            {{ scope.row.max_points }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="chombo_count" :label="ChomboCountText" />
      <el-table-column
        prop="riichi_rate"
        :label="RiichiRateColumnText"
        :formatter="RiichiRateFormatter"
        sortable
      />
      <el-table-column
        prop="agari_rate"
        :label="AgariRateColumnText"
        :formatter="AgariRateFormatter"
        sortable
      />
      <el-table-column
        prop="deal_in_rate"
        :label="DealInRateColumnText"
        :formatter="DealInRateFormatter"
        sortable
      />
      <el-table-column prop="avg_agari_points" :label="AvgAgariPtColumnText" sortable>
        <template #default="scope">
          {{ scope.row.avg_agari_points.toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column prop="avg_deal_in_points" :label="AvgDealInPtColumnText" sortable>
        <template #default="scope">
          {{ scope.row.avg_deal_in_points.toFixed(0) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="expected_points"
        :label="ExpectedPtColumnText"
        :formatter="ExpectedPtFormatter"
        sortable
      >
      </el-table-column>
      <el-table-column prop="top1_rate" :label="Top1RateColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.max_top1_rate == true ? `success` : ``">
            {{ RateFormatter(scope.row.top1_rate) }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="top2_rate" :label="Top2RateColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.max_top2_rate == true ? `success` : ``">
            {{ RateFormatter(scope.row.top2_rate) }}
          </el-text>
        </template>
      </el-table-column>

      <el-table-column prop="top3_rate" :label="Top3RateColumnText" sortable>
        <template #default="scope">
          <el-text :type="scope.row.max_top3_rate == true ? `success` : ``">
            {{ RateFormatter(scope.row.top3_rate) }}
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
              {{ GenerateGameLabel(raw_games.value.games[i - 1]) }}
            </el-text>
            <el-table
              :data="getGameRecordTable(raw_games.value.games[i - 1])"
              style="width: 100%"
              stripe
              table-layout="auto"
            >
              <el-table-column prop="player" :label="GamePlayerColumnText" />
              <el-table-column prop="points" :label="GamePointsColumnText" />
              <el-table-column
                prop="game_details"
                :label="GameDetailsColumnText(raw_games.value.games[i - 1])"
              />
              <el-table-column prop="avg_agari_points" :label="AvgAgariPtColumnText" />
              <el-table-column prop="avg_deal_in_points" :label="AvgDealInPtColumnText" />
            </el-table>
            <div v-if="raw_games.value.games[i - 1].game_logs != undefined">
              <el-button type="primary" @click="DisplayDetailedGameLog(i)">
                {{ DetailedGameLogText }}
              </el-button>
            </div>
            <div v-else>
              <el-text type="danger">
                {{ GameLogNotAvailableText }}
              </el-text>
            </div>
            <el-divider />

            <el-dialog
              v-if="detailed_game_log_index != undefined && detailed_game_logs.length > 0"
              v-model="detailed_game_log_visible"
              :title="GenerateGameLabel(raw_games.value.games[detailed_game_log_index - 1])"
              width="100%"
            >
              <GameLogBoard
                :language="language"
                :game_logs="detailed_game_logs"
                :players="detailed_game_logs[0].players"
                :ruleset="ruleset"
                :backtrace_enabled="false"
              />
            </el-dialog>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-divider />
  </div>
</template>
