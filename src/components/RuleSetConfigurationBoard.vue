<script setup>
import { computed } from 'vue'
import { Winds } from './seat_constants.ts'

const ruleset = defineModel()

const RuleTitleText = computed(() => {
  return `规则`
})
const StartingPointsStep = 5000
const StartingPointsTitleText = computed(() => {
  return `开局点数`
})
const HonbaPointsStep = 300
const HonbaPointsTitleText = computed(() => {
  return `本场点数`
})
const DrawTenpaiPointsStep = 600
const DrawTenpaiPointsTitleText = computed(() => {
  return `流局罚符`
})
const RoundUpManganTitleText = computed(() => {
  return `切上满贯`
})
const RoundUpManganActiveText = computed(() => {
  return `开`
})
const RoundUpManganInactiveText = computed(() => {
  return `关`
})
const LastRoundWindTitleText = computed(() => {
  return `半庄战`
})
const LastRoundWindActiveText = computed(() => {
  return `半庄战`
})
const LastRoundWindInactiveText = computed(() => {
  return `东风战`
})
</script>

<template>
  <el-divider> {{ RuleTitleText }}</el-divider>
  <RuleToggleEntry
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
  <RuleToggleEntry
    v-model="ruleset.round_up_mangan"
    :title="RoundUpManganTitleText"
    :active_text="RoundUpManganActiveText"
    :inactive_text="RoundUpManganInactiveText"
    :active_value="true"
    :inactive_value="false"
  />
</template>
