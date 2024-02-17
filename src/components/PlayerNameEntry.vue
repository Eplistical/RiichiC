<script setup>
import { WindsDisplayTextMap } from './seat_constants'
import { computed } from 'vue'

const props = defineProps({
  starting_wind: String
})

const player_name = defineModel()

const StartingWindText = computed(() => {
  return `${WindsDisplayTextMap[props.starting_wind]}起`
})

const PlayerNameInputPlaceHolderText = computed(() => {
  return `玩家名`
})
</script>

<template>
  {{ StartingWindText }}
  <el-input
    v-model="player_name"
    size="large"
    clearable
    :placeholder="PlayerNameInputPlaceHolderText"
  />
</template>
