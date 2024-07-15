<script setup>
import { Hand } from './hand'
import { WindsDisplayTextMap } from './seat_constants'
import { computed } from 'vue'
import { Lang } from './app_constants'

const props = defineProps({
  language: String,
  hand: Hand,
  game_finished: Boolean
})

const HandSignatureText = computed(() => {
  return `${WindsDisplayTextMap[props.hand.round_wind]}${props.hand.hand} - ${props.hand.honba}`
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
</template>

<style scoped>
.game_finished_div {
  font-size: 11px;
  color: red;
}
</style>
