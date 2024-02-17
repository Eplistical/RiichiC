<script setup>
import { Players } from './players'
import { PlayerIdsInOrder } from './players'

const props = defineProps({
  players: Players,
  fill: String,
  multi_selection: Boolean
})

const selected_player = defineModel()

function GetPlayerName(player_id) {
  return props.players.GetPlayer(player_id).name
}
</script>

<template>
  <div v-if="multi_selection">
    <el-checkbox-group :fill="fill" v-model="selected_player">
      <el-checkbox-button v-for="player_id in PlayerIdsInOrder" :label="player_id">
        {{ GetPlayerName(player_id) }}
      </el-checkbox-button>
    </el-checkbox-group>
  </div>
  <div v-else>
    <el-radio-group :fill="fill" v-for="player_id in PlayerIdsInOrder" v-model="selected_player">
      <el-radio-button :label="player_id">
        {{ GetPlayerName(player_id) }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>
