<script setup>
import { Game } from './game'
import { PlayerIdsInOrder } from './players'
import { ref, computed } from 'vue'
import { WindsDisplayTextMap } from './seat_constants'
import { NumberDisplayMap } from './game_constants'
import { HandOutcomeEnum } from './hand'
import { useFetch } from '@vueuse/core'
import { PointsLadder } from './game_constants'

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
  if (props.game.Uploaded()) {
    alert('本局游戏已经上传，无需多次上传')
    return
  }
  const token = prompt('请输入上传口令')
  console.log('game date = ', props.game.game_date, typeof props.game.game_date)
  const game_date =
    props.game.game_date.getFullYear() * 10000 +
    (props.game.game_date.getMonth() + 1) * 100 +
    props.game.game_date.getDate()
  const data_to_post = {
    action: 'record_game',
    token: token,
    game: {
      game_date: game_date
    }
  }
  for (const player_id of PlayerIdsInOrder) {
    const stats = game_stats.value[player_id]
    data_to_post.game[player_id] = {
      name: GetPlayerName(player_id),
      points: stats.points,
      riichi: stats.riichi,
      agari: stats.agari,
      deal_in: stats.deal_in
    }
  }
  console.log('Game data to post: ', data_to_post)
  const { data, onFetchResponse, onFetchError } = useFetch('/upload_game_api/data')
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

      deal_in: 0,
      deal_in_over_mangan: 0,
      deal_in_after_riichi: 0,

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
        if (player_riichi) {
          stats.agari_after_riichi += 1
        }
        if (hand.results.han in PointsLadder) {
          stats.agari_over_mangan += 1
        }
      }
      if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
        stats.deal_in += 1
        if (player_riichi) {
          stats.deal_in_after_riichi += 1
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
      riichi: stats.riichi,
      agari_summary: GetPlayerAgariSummary(player_id, stats),
      deal_in_summary: GetPlayerDealInSummary(player_id, stats),
      tenpai_on_draw: stats.tenpai_on_draw
    }
    table.push(row)
  }
  return table
})
</script>

<template>
  <el-collapse>
    <el-collapse-item :title="StatsTitleText">
      <el-table :data="GameStatsBoard" style="width: 100%" stripe>
        <el-table-column fixed prop="player_summary" :label="PlayerSummaryLabelText" />
        <el-table-column prop="points" :label="PointsLabelText" />
        <el-table-column prop="riichi" :label="RiichiLabelText" />
        <el-table-column prop="agari_summary" :label="AgariSummaryLabelText" />
        <el-table-column prop="deal_in_summary" :label="DealInSummaryLabelText" />
        <el-table-column prop="tenpai_on_draw" :label="TenpaiOnDrawSummaryLabelText" />
      </el-table>
      <el-divider />
      <el-button v-if="props.game.IsFinished()" type="success" @click="UploadGameStats">
        {{ UploadGameStatsButtonText }}</el-button
      >
    </el-collapse-item>
  </el-collapse>
</template>
