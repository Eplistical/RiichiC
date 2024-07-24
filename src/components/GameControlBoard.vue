<script setup>
import { Game } from './game'
import { ref, computed, defineModel } from 'vue'
import { Lang } from './app_constants'
import { UploadableRulesets } from './rulesets'

const props = defineProps({
  ruleset_id: String,
  game: Game
})

const language = defineModel()
const LANG_CN_TEXT = ref('中文')
const LANG_EN_TEXT = ref('English')

const StartGameButtonText = computed(() => {
  if (language.value == Lang.CN) {
    return '开始对局'
  } else if (language.value == Lang.EN) {
    return `Start`
  }
})
const FinishGameButtonText = computed(() => {
  if (language.value == Lang.CN) {
    return '结束对局'
  } else if (language.value == Lang.EN) {
    return `End Game`
  }
})
const ExportResultButtonText = computed(() => {
  if (language.value == Lang.CN) {
    return '导出日志'
  } else if (language.value == Lang.EN) {
    return `Export Log`
  }
})
const NewGameButtonText = computed(() => {
  if (language.value == Lang.CN) {
    return '主界面'
  } else if (language.value == Lang.EN) {
    return `Main Panel`
  }
})
const ToLeaderBoardText = computed(() => {
  if (language.value == Lang.CN) {
    return '历史排名'
  } else if (language.value == Lang.EN) {
    return `Leaderboard`
  }
})

const WorksheetTitleText = computed(() => {
  if (language.value == Lang.CN) {
    return '日志'
  } else if (language.value == Lang.EN) {
    return `Log`
  }
})

const emit = defineEmits(['startGame', 'finishGame', 'exportResults', 'newGame', 'toLeaderBoard'])
</script>

<template>
  <span v-if="game.IsNotStarted()">
    <el-row>
      <el-col :span="6">
        <el-button type="primary" @click="$emit('startGame', $event)">{{
          StartGameButtonText
        }}</el-button>
      </el-col>
      <el-col :span="8">
        <el-button
          v-if="UploadableRulesets.has(ruleset_id)"
          type="primary"
          @click="$emit('toLeaderBoard', $event)"
          >{{ ToLeaderBoardText }}</el-button
        >
      </el-col>
      <el-col :span="8">
        <el-switch
          v-model="language"
          :active-text="LANG_CN_TEXT"
          :active-value="Lang.CN"
          :inactive-text="LANG_EN_TEXT"
          :inactive-value="Lang.EN"
        />
      </el-col>
    </el-row>
  </span>
  <span v-else-if="game.IsOnGoing()">
    <el-row>
      <el-col :span="14">
        <el-button type="danger" @click="$emit('finishGame', $event)">{{
          FinishGameButtonText
        }}</el-button>
      </el-col>
      <el-col :span="8">
        <el-switch
          v-model="language"
          :active-text="LANG_CN_TEXT"
          :active-value="Lang.CN"
          :inactive-text="LANG_EN_TEXT"
          :inactive-value="Lang.EN"
        />
      </el-col>
    </el-row>
  </span>
  <span v-else-if="game.IsFinished()">
    <el-row>
      <el-col :span="6">
        <el-button type="primary" @click="$emit('newGame', $event)">{{
          NewGameButtonText
        }}</el-button>
      </el-col>
      <el-col :span="8">
        <download-excel
          type="xlsx"
          :fields="game.GenerateGameLogTableFieldsForExport(language)"
          :data="game.GenerateGameLogTable(language)"
          :name="`${game.GenerateGameLogFileNameForExport()}.xlsx`"
          :worksheet="WorksheetTitleText"
        >
          <el-button type="primary">{{ ExportResultButtonText }}</el-button>
        </download-excel>
      </el-col>
      <el-col :span="8">
        <el-switch
          v-model="language"
          :active-text="LANG_CN_TEXT"
          :active-value="Lang.CN"
          :inactive-text="LANG_EN_TEXT"
          :inactive-value="Lang.EN"
        />
      </el-col>
    </el-row>
  </span>
</template>
