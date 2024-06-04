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
  return `供托`
})
const HandResultsSummaryLabelText = computed(() => {
  return `结局`
})
const OperationLabelText = computed(() => {
  return `操作`
})
const ResetButtonText = computed(() => {
  return `回溯`
})

const GameLogTable = computed(() => {
  return props.game.GenerateGameLogTable()
})

function GetPlayerName(player_id) {
  return props.game.players.GetPlayer(player_id).name
}
</script>

<template>
  <el-collapse>
    <el-collapse-item :title="LogTitleText">
      <el-table :data="GameLogTable" height="250" style="width: 100%" stripe>
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
              v-if="scope.$index > 0"
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
