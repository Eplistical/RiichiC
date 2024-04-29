<script setup>
import { Game } from './game'
import { PlayerIdsInOrder } from './players'
import { computed } from 'vue'
import { WindsDisplayTextMap } from './seat_constants'
import { NumberDisplayMap } from './game_constants'
import { HandOutcomeEnum } from './hand'
import { PointsLadder } from './game_constants'

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

const GameStatsBoard = computed(() => {
  console.log('Generate GameStatsBoard')
  let table = []
  // scan log to compute stats
  for (const player_id of PlayerIdsInOrder) {
    // find players rank and points from current hand
    const points = GetPlayerPoints(player_id)
    const rank = GetPlayerRank(player_id)
    // loop log to compute game stats
    let stats = {
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
        return;
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
    const row = {
      player_summary: GetPlayerSummary(player_id, rank),
      points: points,
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
    </el-collapse-item>
  </el-collapse>
</template>
