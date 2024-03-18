<script setup>
import { Game } from './game'
import { computed } from 'vue'

const props = defineProps({
  game: Game
})

const StartGameButtonText = computed(() => {
  return '开始对局'
})
const FinishGameButtonText = computed(() => {
  return '结束对局'
})
const ExportResultButtonText = computed(() => {
  return '导出日志'
})
const NewGameButtonText = computed(() => {
  return '新对局'
})

const emit = defineEmits(['startGame', 'finishGame', 'exportResults', 'newGame'])
</script>

<template>
  <div v-if="game.IsNotStarted()">
    <el-button type="primary" @click="$emit('startGame', $event)">{{
      StartGameButtonText
    }}</el-button>
  </div>
  <div v-else-if="game.IsOnGoing()">
    <el-button type="danger" @click="$emit('finishGame', $event)">{{
      FinishGameButtonText
    }}</el-button>
  </div>
  <div v-else-if="game.IsFinished()">
    <el-row>
      <el-col :span="6">
      <download-excel 
      type="xlsx"
      :fields="game.GenerateGameLogTableFieldsForExport()"
      :data="game.GenerateGameLogTable()"
      :name="`${game.GenerateGameLogFileNameForExport()}.xlsx`"
      worksheet="日志"
      >
        <el-button type="primary">{{ ExportResultButtonText }}</el-button>
      </download-excel>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="$emit('newGame', $event)">{{ NewGameButtonText }}</el-button>
      </el-col>
    </el-row>
  </div>
</template>
