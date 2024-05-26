<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '@vueuse/core'
import { LIST_PLAYERS_API } from './app_constants'
const props = defineProps({
  num_players: Number
})
const player_names = defineModel('player_names')
const player_starting_winds = defineModel('player_starting_winds')
const PlayerNameDividerText = computed(() => {
  return `玩家信息`
})

const registered_players = ref([])

onMounted(() => {
  GetRegisteredPlayers()
})

function GetRegisteredPlayers() {
  console.log('GetRegisteredPlayers')
  const { data, onFetchResponse, onFetchError } = useFetch(
    `${LIST_PLAYERS_API}?action=list_players`
  )
    .get()
    .text()
  onFetchResponse((response) => {
    registered_players.value = JSON.parse(data.value).players
  })
  onFetchError((error) => {
    alert(`无法获得玩家信息: ${data.value}`)
  })
}
</script>

<template>
  <el-divider>{{ PlayerNameDividerText }}</el-divider>
  <el-row v-for="i in num_players">
    <PlayerNameEntry
      v-model:player_name="player_names[i - 1]"
      v-model:player_starting_wind="player_starting_winds[i - 1]"
      :registered_players="registered_players"
    />
  </el-row>
</template>
