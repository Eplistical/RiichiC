<script setup>
import { Hand } from './hand'
import { WindsFullDisplayTextMap } from './seat_constants'
import { NumberDisplayMap } from './game_constants'
import { computed } from 'vue'
import { Lang } from './app_constants'
import { TickTimer } from './tick_timer'

const props = defineProps({
  language: String,
  hand: Hand,
  game_finished: Boolean,
  tick_timer: TickTimer
})

const emit = defineEmits(['saveState'])

const HandSignatureText = computed(() => {
  if (props.language == Lang.CN) {
    return `${WindsFullDisplayTextMap[props.hand.round_wind][props.language]}${NumberDisplayMap[props.hand.hand][props.language]}局`
  } else if (props.language == Lang.EN) {
    return `${WindsFullDisplayTextMap[props.hand.round_wind][props.language]}${NumberDisplayMap[props.hand.hand][props.language]}`
  }
})

const RiichiSticksText = computed(() => {
  if (props.language == Lang.CN) {
    return `供托: ${props.hand.riichi_sticks}`
  }
  if (props.language == Lang.EN) {
    return `Riichi Sticks: ${props.hand.riichi_sticks}`
  }
})

const GameFinishedText = computed(() => {
  if (props.language == Lang.CN) {
    return `[已结束]`
  }
  if (props.language == Lang.EN) {
    return `[Ended]`
  }
})

const RiichiStickIconSvg = computed(() => {
  return './riichi_stick_white.svg'
})

const HonbaIconSvg = computed(() => {
  return './honba_white.svg'
})
</script>

<template>
  <div>
    {{ HandSignatureText }}
  </div>
  <div>
    <el-image :src="RiichiStickIconSvg" class="riichi_stick_icon" />
    {{ hand.riichi_sticks }}
  </div>
  <div>
    <el-image :src="HonbaIconSvg" class="honba_icon" />
    {{ hand.honba }}
  </div>
  <div v-if="game_finished" class="game_finished_div">
    {{ GameFinishedText }}
  </div>
  <!--
  <div v-else-if="tick_timer != undefined" class="timer_widget_div">
    <TimerWidget :language="language" :tick_timer="tick_timer" @saveState="$emit('saveState')" />
  </div>
  -->
</template>

<style scoped>
.game_finished_div {
  font-size: 4vw;
  color: red;
}

.honba_icon,
.riichi_stick_icon {
  height: 4vw;
  width: 20vw;
  margin-top: 1vw;
  margin-right: 1vw;
}
</style>
