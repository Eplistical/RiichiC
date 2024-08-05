<script setup>
import { Game, GameLogType } from './game'
import { computed } from 'vue'
import { PlayerIdsInOrder } from './players'
import { Lang } from './app_constants'

const props = defineProps(['language', 'game_logs', 'players', 'ruleset', 'backtrace_enabled'])
const emit = defineEmits(['resetLog'])

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
  return Game.GenerateGameLogTableStatic(props.game_logs, props.ruleset, props.language)
})

function GetPlayerName(player_id) {
  return props.players.GetPlayer(player_id).name
}

function HandResetable(log_index) {
  // not a valid log index
  if (log_index < 0 || log_index >= props.game_logs.length) {
    return false
  }
  // cannot reset the hand assigning left-over riichi
  if (props.game_logs[log_index].log_type == GameLogType.ASSIGN_LEFT_OVER_RIICHI) {
    return false
  }
  return true
}
</script>

<template>
  <el-table :data="GameLogTable" style="width: 100%" stripe>
    <el-table-column fixed prop="hand_signature" :label="HandSignatureLabelText" />
    <el-table-column prop="start_game_riichi_sticks" :label="StartGameRiichiSticksLabelText" />
    <el-table-column prop="results_summary" :label="HandResultsSummaryLabelText" />
    <el-table-column
      v-for="player_id in PlayerIdsInOrder"
      :prop="player_id"
      :label="GetPlayerName(player_id)"
    />
    <el-table-column :label="OperationLabelText" v-if="backtrace_enabled">
      <template #default="scope">
        <el-button
          v-if="HandResetable(game_logs.length - scope.$index - 1)"
          size="small"
          type="warning"
          @click="$emit('resetLog', scope.$index, scope.row)"
          >{{ ResetButtonText }}</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>
