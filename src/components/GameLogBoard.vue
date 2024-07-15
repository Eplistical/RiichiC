<script setup>
import { Game } from './game'
import { computed } from 'vue'
import { PlayerIdsInOrder } from './players'
import { Lang } from './app_constants'

const props = defineProps({
  language: String,
  game: Game
})

const emit = defineEmits(['resetLog'])

const LogTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `日志`
  } else if (props.language == Lang.EN) {
    return `Log`
  }
})
const HandSignatureLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `场`
  } else if (props.language == Lang.EN) {
    return `Hand`
  }
})
const StartGameRiichiSticksLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `供托`
  } else if (props.language == Lang.EN) {
    return `Riichi Sticks`
  }
})
const HandResultsSummaryLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `结局`
  } else if (props.language == Lang.EN) {
    return `Result`
  }
})
const OperationLabelText = computed(() => {
  if (props.language == Lang.CN) {
    return `操作`
  } else if (props.language == Lang.EN) {
    return `Action`
  }
})
const ResetButtonText = computed(() => {
  if (props.language == Lang.CN) {
    return `回溯`
  } else if (props.language == Lang.EN) {
    return `Backtrack`
  }
})

const GameLogTable = computed(() => {
  return props.game.GenerateGameLogTable(props.language)
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
