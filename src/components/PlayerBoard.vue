<script setup>
import { Player } from './players'
import { Winds, WindsDisplayTextMap } from './seat_constants'
import { ref, computed } from 'vue'

const props = defineProps({
  player_id: String,
  player: Player,
  riichi_disabled: Boolean
})

const riichi_players = defineModel()
const emit = defineEmits(['riichi'])

const PlayerName = computed(() => {
  return props.player.name
})

const PlayerCurrentWind = computed(() => {
  return WindsDisplayTextMap[props.player.current_wind]
})

const PlayerPoints = computed(() => {
  return props.player.points
})

const IsDealer = computed(() => {
  return props.player.current_wind == Winds.EAST
})

const RiichiText = computed(() => {
  return '立直'
})
</script>

<template>
  <div :class="IsDealer ? 'dealer_board' : 'non_dealer_board'">
    <div>{{ PlayerName }}[{{ PlayerCurrentWind }}]</div>
    <div>
      {{ PlayerPoints }}
    </div>
    <el-checkbox-group fill="#f7bc45" v-model="riichi_players">
      <el-checkbox-button
        :label="player_id"
        :disabled="riichi_disabled"
        @change="$emit('riichi', $event)"
      >
        {{ RiichiText }}
      </el-checkbox-button>
    </el-checkbox-group>
  </div>
</template>

<style scoped>
.dealer_board {
  color: #cc0000;
}

.non_dealer_board {
  color: #00589a;
}
</style>
