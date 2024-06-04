<script setup>
import { Hand } from './hand'
import { WindsDisplayTextMap } from './seat_constants'
import { computed } from 'vue'

const props = defineProps({
  hand: Hand,
  game_finished: Boolean
})

const HandSignatureText = computed(() => {
  return `${WindsDisplayTextMap[props.hand.round_wind]}${props.hand.hand} - ${props.hand.honba}`
})

const RiichiSticksText = computed(() => {
  return `供托: ${props.hand.riichi_sticks}`
})

const GameFinishedText = computed(() => {
  return `[游戏已结束]`
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
