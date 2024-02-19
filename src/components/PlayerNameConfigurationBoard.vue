<script setup>
import { computed } from 'vue'
import { WindsInOrder } from './seat_constants.ts'
const props = defineProps({
  num_players: Number
})
const player_names = defineModel('player_names')
const player_starting_winds = defineModel('player_starting_winds')
const PlayerNameDividerText = computed(() => {
  return `玩家信息`
})
</script>

<template>
  <el-divider>{{ PlayerNameDividerText }}</el-divider>
  <el-row v-for="i in num_players">
    <PlayerNameEntry
      v-model:player_name="player_names[i - 1]"
      v-model:player_starting_wind="player_starting_winds[i - 1]"
    />
  </el-row>
</template>
