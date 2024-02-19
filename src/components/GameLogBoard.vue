<script setup>
import { Game } from './game'
import { computed } from 'vue'
import { PlayerIdsInOrder } from './players'
import { HandOutcomeEnum, HandOutcomeEnumDisplayTextMap } from './hand'
import { PointsLadderBriefDisplayMap, Actions, ActionBriefDisplayMap } from './game_constants'
import { WindsDisplayTextMap } from './seat_constants'

const props = defineProps({
  game: Game
})

const emit = defineEmits(['resetLog'])

const LogTitleText = computed(() => {
  return `日志`
})
const HandSignatureLabelText = computed(() => {
  return `场`
})
const StartGameRiichiSticksLabelText = computed(() => {
  return `开局供托`
})
const HandResultsSummaryLabelText = computed(() => {
  return `结局`
})
const OperationLabelText = computed(() => {
  return `操作`
})
const ResetButtonText = computed(() => {
  return `重置`
})

const GameLogTable = computed(() => {
  let table = []
  for (let i = 0; i < props.game.log.length; ++i) {
    const log = props.game.log[i]
    const hand = log.hand
    const players = log.players
    const last_log = i > 0 ? props.game.log[i - 1] : null
    const last_hand = last_log ? last_log.hand : null
    const last_hand_players = last_log ? last_log.players : null
    let row = {}
    row.log_index = i
    row.hand_signature = `${WindsDisplayTextMap[hand.round_wind]}${hand.hand}-${hand.honba}`
    row.end_game_riichi_sticks = hand.riichi_sticks
    row.start_game_riichi_sticks = last_hand ? last_hand.riichi_sticks : 0
    row.results_summary = `${HandOutcomeEnumDisplayTextMap[hand.results.outcome]}`

    if (
      hand.results.outcome == HandOutcomeEnum.RON ||
      hand.results.outcome == HandOutcomeEnum.TSUMO
    ) {
      if (typeof hand.results.han == 'string') {
        row.results_summary += `[${PointsLadderBriefDisplayMap[hand.results.han]}]`
      } else {
        row.results_summary += `[${hand.results.han},${hand.results.fu}]`
      }
    }
    for (const player_id of PlayerIdsInOrder) {
      const end_hand_pt = players.GetPlayer(player_id).points
      const start_hand_pt = last_hand_players
        ? last_hand_players.GetPlayer(player_id).points
        : props.game.ruleset.starting_points
      const pt_delta = end_hand_pt - start_hand_pt
      row[player_id] = `${end_hand_pt}`
      if (pt_delta > 0) {
        row[player_id] += `(+${pt_delta})`
      } else if (pt_delta < 0) {
        row[player_id] += `(${pt_delta})`
      }
      if (hand.riichi.includes(player_id)) {
        row[player_id] += `[${ActionBriefDisplayMap[Actions.RIICHI]}]`
      }
      if (hand.results.outcome == HandOutcomeEnum.DRAW && hand.results.tenpai.includes(player_id)) {
        row[player_id] += `[${ActionBriefDisplayMap[Actions.TENPAI]}]`
      }
      if (
        (hand.results.outcome == HandOutcomeEnum.TSUMO ||
          hand.results.outcome == HandOutcomeEnum.RON) &&
        hand.results.winner == player_id
      ) {
        row[player_id] += `[${ActionBriefDisplayMap[Actions.AGARI]}]`
      }
      if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
        row[player_id] += `[${ActionBriefDisplayMap[Actions.DEAL_IN]}]`
      }
    }
    table.push(row)
  }
  return table.reverse()
})

function GetPlayerName(player_id) {
  return props.game.players.GetPlayer(player_id).name
}
</script>

<template>
  <el-collapse>
    <el-collapse-item :title="LogTitleText">
      <el-table :data="GameLogTable" style="width: 100%" stripe>
        <el-table-column fixed prop="hand_signature" :label="HandSignatureLabelText" />
        <el-table-column prop="start_game_riichi_sticks" :label="StartGameRiichiSticksLabelText" />
        <el-table-column prop="results_summary" :label="HandResultsSummaryLabelText" />
        <el-table-column
          v-for="player_id in PlayerIdsInOrder"
          :prop="player_id"
          :label="GetPlayerName(player_id)"
        />
        <el-table-column :label="OperationLabelText">
          <template #default="scope">
            <el-button
              size="small"
              type="warning"
              @click="$emit('resetLog', scope.$index, scope.row)"
              >{{ ResetButtonText }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-collapse-item>
  </el-collapse>
</template>
