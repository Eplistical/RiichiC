<script setup>
import { ref, computed } from 'vue'
import { Winds } from './seat_constants.ts'
import { Lang } from './app_constants'

const props = defineProps({
  language: String
})

const ruleset = defineModel()

const LANG_CN_TEXT = ref('中文')
const LANG_EN_TEXT = ref('English')

const LanguageTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `语言`
  } else if (props.language == Lang.EN) {
    return `Language`
  }
})

const RuleTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `规则`
  } else if (props.language == Lang.EN) {
    return `Ruleset`
  }
})

const StartingPointsStep = 5000
const StartingPointsTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `开局点数`
  } else if (props.language == Lang.EN) {
    return `Starting Points`
  }
})

const HonbaPointsStep = 300
const HonbaPointsTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `本场点数`
  } else if (props.language == Lang.EN) {
    return `Honba Points`
  }
})

const DrawTenpaiPointsStep = 600
const DrawTenpaiPointsTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `流局罚符`
  } else if (props.language == Lang.EN) {
    return `Tenpai Points on Draw`
  }
})

const RoundUpManganTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `切上满贯`
  } else if (props.language == Lang.EN) {
    return `Round-up Mangan`
  }
})
const RoundUpManganActiveText = computed(() => {
  if (props.language == Lang.CN) {
    return `开`
  } else if (props.language == Lang.EN) {
    return `On`
  }
})
const RoundUpManganInactiveText = computed(() => {
  if (props.language == Lang.CN) {
    return `关`
  } else if (props.language == Lang.EN) {
    return `Off`
  }
})

const LastRoundWindTitleText = computed(() => {
  if (props.language == Lang.CN) {
    return `半庄战`
  } else if (props.language == Lang.EN) {
    return `Hanchan`
  }
})
const LastRoundWindActiveText = computed(() => {
  if (props.language == Lang.CN) {
    return `半庄战`
  } else if (props.language == Lang.EN) {
    return `Hanchan`
  }
})
const LastRoundWindInactiveText = computed(() => {
  if (props.language == Lang.CN) {
    return `东风战`
  } else if (props.language == Lang.EN) {
    return `Tonpuusen`
  }
})
</script>

<template>
  <el-divider> {{ RuleTitleText }}</el-divider>
  <ConfigurationToggleEntry
    v-model="ruleset.language"
    :title="LanguageTitleText"
    :active_text="LANG_CN_TEXT"
    :inactive_text="LANG_EN_TEXT"
    :active_value="Lang.CN"
    :inactive_value="Lang.EN"
  />
  <ConfigurationToggleEntry
    v-model="ruleset.last_round_wind"
    :title="LastRoundWindTitleText"
    :active_text="LastRoundWindActiveText"
    :inactive_text="LastRoundWindInactiveText"
    :active_value="Winds.SOUTH"
    :inactive_value="Winds.EAST"
  />
  <RuleNumberEntry
    v-model="ruleset.starting_points"
    :title="StartingPointsTitleText"
    :step="StartingPointsStep"
  />
  <RuleNumberEntry
    v-model="ruleset.honba_points"
    :title="HonbaPointsTitleText"
    :step="HonbaPointsStep"
  />
  <RuleNumberEntry
    v-model="ruleset.draw_tenpai_points"
    :title="DrawTenpaiPointsTitleText"
    :step="DrawTenpaiPointsStep"
  />
  <ConfigurationToggleEntry
    v-model="ruleset.round_up_mangan"
    :title="RoundUpManganTitleText"
    :active_text="RoundUpManganActiveText"
    :inactive_text="RoundUpManganInactiveText"
    :active_value="true"
    :inactive_value="false"
  />
</template>
