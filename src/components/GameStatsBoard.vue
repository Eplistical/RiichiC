<script setup>
import { Game } from './game'
import { PlayerIdsInOrder } from './players'
import { ref, computed, toRaw } from 'vue'
import { WindsDisplayTextMap } from './seat_constants'
import { NumberDisplayMap } from './game_constants'
import { HandOutcomeEnum } from './hand'
import { useFetch } from '@vueuse/core'
import { PointsLadder } from './game_constants'
import { RECORD_GAME_API } from './app_constants'
import { MLeagueRuleset, RulesetsAreEqual } from './rulesets'

const emit = defineEmits(['gameUploaded'])

const props = defineProps({
  game: Game
})

const StatsTitleText = computed(() => {
  return '统计'
})
const PlayerSummaryLabelText = computed(() => {
  return '玩家'
})
const PointsLabelText = computed(() => {
  return '点数'
})
const RiichiLabelText = computed(() => {
  return '立直'
})
const AgariSummaryLabelText = computed(() => {
  return '和/大和/立直和'
})
const DealInSummaryLabelText = computed(() => {
  return '铳/大铳/立直铳'
})
const TenpaiOnDrawSummaryLabelText = computed(() => {
  return '流听'
})

const ActionSummaryLabelText = ref(`立/和/铳/听`)
const AvgAgariPtSummaryLabelText = ref(`和牌平均打点`)
const AvgDealInPtSummaryLabelText = ref(`放铳平均损失`)
const HandCountLabelText = ref(`局数`)

const UploadGameStatsButtonText = ref('上传结果')

const game_stats = ref({})

function GetPlayerSummary(player_id, rank) {
  return `${GetPlayerName(player_id)}[${WindsDisplayTextMap[player_id]}起][${NumberDisplayMap[rank]}位]`
}

function GetPlayerAgariSummary(player_id, stats) {
  return `${stats.agari}/${stats.agari_over_mangan}/${stats.agari_after_riichi}`
}

function GetPlayerDealInSummary(player_id, stats) {
  return `${stats.deal_in}/${stats.deal_in_over_mangan}/${stats.deal_in_after_riichi}`
}

function GetActionSummary(stats) {
  return `${stats.riichi}/${stats.agari}/${stats.deal_in}/${stats.tenpai_on_draw}`
}

function GetAvgAgariPtSummary(stats) {
  return stats.agari == 0 ? 0 : Math.round(stats.agari_pt_sum / stats.agari)
}

function GetAvgDealInPtSummary(stats) {
  return stats.deal_in == 0 ? 0 : Math.round(-stats.deal_in_pt_sum / stats.deal_in)
}

function GetPlayerName(player_id) {
  return props.game.players.GetPlayer(player_id).name
}

function GetPlayerPoints(player_id) {
  return props.game.players.GetPlayer(player_id).points
}

function GetPlayerRank(player_id) {
  return props.game.players.player_rank[player_id]
}

function UploadGameStats() {
  console.log('UploadGameStats: ', game_stats.value)
  if (!game_stats.value) {
    console.warn('Invalid game stats to upload:', game_stats.value)
    alert('数据丢失，无法上传')
    return
  }
  if (!RulesetsAreEqual(props.game.ruleset, MLeagueRuleset)) {
    alert('非默认游戏规则，无法上传')
    return
  }
  if (props.game.Uploaded()) {
    alert('本局游戏已经上传，无需多次上传')
    return
  }
  const token = prompt('请输入上传口令')
  if (token == undefined || token == null) {
    return
  }
  console.log('game date = ', props.game.game_date, typeof props.game.game_date)
  const game_date =
    props.game.game_date.getFullYear() * 10000 +
    (props.game.game_date.getMonth() + 1) * 100 +
    props.game.game_date.getDate()
  const data_to_post = {
    action: 'record_game',
    token: token,
    game: {
      game_date: game_date,
      game_hand_count: GameHandCount()
    }
  }
  for (const player_id of PlayerIdsInOrder) {
    const stats = game_stats.value[player_id]
    data_to_post.game[player_id] = {
      name: GetPlayerName(player_id),
      points: stats.points,
      riichi: stats.riichi,
      agari: stats.agari,
      deal_in: stats.deal_in,
      tenpai_on_draw: stats.tenpai_on_draw,
      agari_pt_sum: stats.agari_pt_sum,
      deal_in_pt_sum: stats.deal_in_pt_sum
    }
  }
  const { data, onFetchResponse, onFetchError } = useFetch(RECORD_GAME_API)
    .post(data_to_post)
    .text()
  onFetchResponse((response) => {
    const game_id = JSON.parse(data.value).game_id
    alert(`数据上传成功! 游戏ID: ${game_id}`)
    emit('gameUploaded', game_id)
  })
  onFetchError((error) => {
    alert(`数据上传失败: ${data.value}`)
  })
}

function ComputeGameStats() {
  console.log('ComputeGameStats')
  for (const player_id of PlayerIdsInOrder) {
    // find players rank and points from current hand
    const points = GetPlayerPoints(player_id)
    const rank = GetPlayerRank(player_id)
    // loop log to compute game stats
    let stats = {
      points: points,
      rank: rank,

      riichi: 0,

      agari: 0,
      agari_over_mangan: 0,
      agari_after_riichi: 0,
      agari_pt_sum: 0,

      deal_in: 0,
      deal_in_over_mangan: 0,
      deal_in_after_riichi: 0,
      deal_in_pt_sum: 0,

      tenpai_on_draw: 0
    }
    props.game.log.forEach((log) => {
      if (log.assign_left_over_riichi) {
        // do not take the assign_left_over_riichi meta-hand into stats
        return
      }

      const hand = log.hand
      const player_riichi = log.hand.riichi && log.hand.riichi.includes(player_id)
      if (player_riichi) {
        stats.riichi += 1
      }
      if (
        hand.results.outcome == HandOutcomeEnum.DRAW &&
        hand.results.tenpai &&
        hand.results.tenpai.includes(player_id)
      ) {
        stats.tenpai_on_draw += 1
      }
      if (hand.results.outcome != HandOutcomeEnum.DRAW && hand.results.winner == player_id) {
        stats.agari += 1
        stats.agari_pt_sum += hand.results.points_delta[player_id]
        if (player_riichi) {
          stats.agari_after_riichi += 1
          stats.agari_pt_sum -= props.game.ruleset.riichi_cost
        }
        if (hand.results.han in PointsLadder) {
          stats.agari_over_mangan += 1
        }
      }
      if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
        stats.deal_in += 1
        stats.deal_in_pt_sum += hand.results.points_delta[player_id]
        if (player_riichi) {
          stats.deal_in_after_riichi += 1
          stats.deal_in_pt_sum -= props.game.ruleset.riichi_cost
        }
        if (hand.results.han in PointsLadder) {
          stats.deal_in_over_mangan += 1
        }
      }
    })
    game_stats.value[player_id] = stats
  }
}

const GameStatsBoard = computed(() => {
  console.log('Generate GameStatsBoard')
  ComputeGameStats()
  let table = []
  for (const player_id of PlayerIdsInOrder) {
    const stats = game_stats.value[player_id]
    const row = {
      player_summary: GetPlayerSummary(player_id, stats.rank),
      points: stats.points,
      //riichi: stats.riichi,
      //agari_summary: GetPlayerAgariSummary(player_id, stats),
      //deal_in_summary: GetPlayerDealInSummary(player_id, stats),
      action_summary: GetActionSummary(stats),
      //avg_agari_pt: (stats.agari > 0) ? (Math.abs(stats.agari_pt_sum / stats.agari)) : 0,
      //avg_deal_in_pt: (stats.deal_in > 0) ? (Math.abs(stats.deal_in_pt_sum / stats.deal_in)) : 0,
      //avg_pt_summary: GetAvgPtSummary(stats),
      avg_agari_pt_summary: GetAvgAgariPtSummary(stats),
      avg_deal_in_pt_summary: GetAvgDealInPtSummary(stats),
      tenpai_on_draw: stats.tenpai_on_draw
    }
    table.push(row)
  }
  return table
})

function GameHandCount() {
  return props.game.log.length - 1
}
</script>

<template>
  <el-collapse>
    <el-collapse-item :title="`${StatsTitleText} (${HandCountLabelText}: ${GameHandCount()})`">
      <el-table :data="GameStatsBoard" style="width: 100%" stripe table-layout="auto">
        <el-table-column fixed prop="player_summary" :label="PlayerSummaryLabelText" />
        <el-table-column prop="points" :label="PointsLabelText" />
        <el-table-column prop="action_summary" :label="ActionSummaryLabelText" />
        <el-table-column prop="avg_agari_pt_summary" :label="AvgAgariPtSummaryLabelText" />
        <el-table-column prop="avg_deal_in_pt_summary" :label="AvgDealInPtSummaryLabelText" />
      </el-table>
      <el-divider />
      <el-button v-if="props.game.IsFinished()" type="success" @click="UploadGameStats">
        {{ UploadGameStatsButtonText }}</el-button
      >
    </el-collapse-item>
  </el-collapse>
</template>
