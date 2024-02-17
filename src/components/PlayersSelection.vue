<script setup>
import { Players, PlayerIdsInOrder } from './players'

const props = defineProps({
  players: Players,
  fill: String,
  multi_selection: Boolean,
  disabled_options: Array
})

const selected_player = defineModel()
const emit = defineEmits(['change'])

function GetPlayerName(player_id) {
  return props.players.GetPlayer(player_id).name
}

function PlayerDisabled(player_id) {
  return props.disabled_options && props.disabled_options.includes(player_id)
}
</script>

<template>
  <div v-if="multi_selection">
    <el-checkbox-group :fill="fill" v-model="selected_player">
      <el-checkbox-button
        v-for="player_id in PlayerIdsInOrder"
        :label="player_id"
        :disabled="PlayerDisabled(player_id)"
        @change="$emit('change', player_id, $event)"
      >
        {{ GetPlayerName(player_id) }}
      </el-checkbox-button>
    </el-checkbox-group>
  </div>
  <div v-else>
    <el-radio-group
      :fill="fill"
      v-for="player_id in PlayerIdsInOrder"
      v-model="selected_player"
      :disabled="PlayerDisabled(player_id)"
    >
      <el-radio-button :label="player_id" @change="$emit('change', player_id)">
        {{ GetPlayerName(player_id) }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>
