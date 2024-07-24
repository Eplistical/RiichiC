<script setup>
import { Hand } from './hand'
import { WindsDisplayTextMap } from './seat_constants'
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
  return `${WindsDisplayTextMap[props.hand.round_wind][props.language]}${props.hand.hand} - ${props.hand.honba}`
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
</script>

<template>
  <div>
    {{ HandSignatureText }}
  </div>
  <div>
    {{ RiichiSticksText }}
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
  font-size: 12px;
  color: red;
}
</style>
