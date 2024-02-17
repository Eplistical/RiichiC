<script setup>
import { WindsInOrder } from './seat_constants.ts'
const props = defineProps({
  num_players: Number
})
const player_names = defineModel()
</script>

<template>
  <el-row v-for="i in num_players">
    <PlayerNameEntry v-model="player_names[i - 1]" :starting_wind="WindsInOrder[i - 1]" />
  </el-row>
</template>
