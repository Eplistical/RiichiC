<script setup>
import { WindsDisplayTextMap, WindsInOrder } from './seat_constants'
import { computed } from 'vue'

const props = defineProps({
  registered_players: Array
})

const player_name = defineModel('player_name')
const player_starting_wind = defineModel('player_starting_wind')

const PlayerNameInputPlaceHolderText = computed(() => {
  return `玩家名`
})

function StartigWindText(wind) {
  return `${WindsDisplayTextMap[wind]}`
}
</script>

<template>
  <el-space wrap>
    <el-radio-group v-for="wind in WindsInOrder" v-model="player_starting_wind">
      <el-radio-button :label="wind">
        {{ StartigWindText(wind) }}
      </el-radio-button>
    </el-radio-group>
  </el-space>
  <el-select v-model="player_name" filterable allow-create>
    <el-option v-for="player in registered_players" :key="player" :label="player" :value="player" />
  </el-select>
</template>
