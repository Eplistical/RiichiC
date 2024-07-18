<script setup>
import { WindsDisplayTextMap, WindsInOrder } from './seat_constants'

const props = defineProps({
  language: String,
  registered_players: Array
})

const player_name = defineModel('player_name')
const player_starting_wind = defineModel('player_starting_wind')

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
