<script setup>
import { Game } from './game'
import { computed } from 'vue'
import { Lang } from './app_constants'

const props = defineProps({
  language: String,
  game: Game
})

const StartGameButtonText = computed(() => {
  if (props.language == Lang.CN) {
    return '开始对局'
  } else if (props.language == Lang.EN) {
    return `Start`
  }
})
const FinishGameButtonText = computed(() => {
  if (props.language == Lang.CN) {
    return '结束对局'
  } else if (props.language == Lang.EN) {
    return `End Game`
  }
})
const ExportResultButtonText = computed(() => {
  if (props.language == Lang.CN) {
    return '导出日志'
  } else if (props.language == Lang.EN) {
    return `Export Log`
  }
})
const NewGameButtonText = computed(() => {
  if (props.language == Lang.CN) {
    return '主界面'
  } else if (props.language == Lang.EN) {
    return `Main Panel`
  }
})
const ToLeaderBoardText = computed(() => {
  if (props.language == Lang.CN) {
    return '历史排名'
  } else if (props.language == Lang.EN) {
    return `Leaderboard`
  }
})

const WorksheetTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return '日志'
  } else if (props.language == Lang.EN) {
    return `Log`
  }
})

const emit = defineEmits(['startGame', 'finishGame', 'exportResults', 'newGame', 'toLeaderBoard'])
</script>

<template>
  <div v-if="game.IsNotStarted()">
    <el-row>
      <el-col :span="6">
        <el-button type="primary" @click="$emit('startGame', $event)">{{
          StartGameButtonText
        }}</el-button>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="$emit('toLeaderBoard', $event)">{{
          ToLeaderBoardText
        }}</el-button>
      </el-col>
    </el-row>
  </div>
  <div v-else-if="game.IsOnGoing()">
    <el-button type="danger" @click="$emit('finishGame', $event)">{{
      FinishGameButtonText
    }}</el-button>
  </div>
  <div v-else-if="game.IsFinished()">
    <el-row>
      <el-col :span="6">
        <el-button type="primary" @click="$emit('newGame', $event)">{{
          NewGameButtonText
        }}</el-button>
      </el-col>
      <el-col :span="6">
        <download-excel
          type="xlsx"
          :fields="game.GenerateGameLogTableFieldsForExport(props.language)"
          :data="game.GenerateGameLogTable(props.language)"
          :name="`${game.GenerateGameLogFileNameForExport()}.xlsx`"
          :worksheet="WorksheetTitleText"
        >
          <el-button type="primary">{{ ExportResultButtonText }}</el-button>
        </download-excel>
      </el-col>
    </el-row>
  </div>
</template>
