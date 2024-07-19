<script setup>
import { Game, GameLogType } from './game'
import { PlayerIdsInOrder } from './players'
import { ref, computed, toRaw } from 'vue'
import { WindsDisplayTextMap } from './seat_constants'
import { PlaceNumberDisplayMap } from './game_constants'
import { HandOutcomeEnum } from './hand'
import { useFetch } from '@vueuse/core'
import { PointsLadder } from './game_constants'
import { Lang, RECORD_GAME_API } from './app_constants'
import { FixedRulesetMap } from './rulesets'

const emit = defineEmits(['gameUploaded'])

const props = defineProps({
  game: Game
})

const language = computed(() => {
  return props.game.ruleset.language
})

const StatsTitleText = computed(() => {
  if (language.value == Lang.CN) {
    return '统计'
  } else if (language.value == Lang.EN) {
    return 'Stats'
  }
})

const PlayerSummaryLabelText = computed(() => {
  if (language.value == Lang.CN) {
    return '玩家'
  } else if (language.value == Lang.EN) {
    return 'Player'
  }
})

const PointsLabelText = computed(() => {
  if (language.value == Lang.CN) {
    return '点数'
  } else if (language.value == Lang.EN) {
    return 'Points'
  }
})

const ActionSummaryLabelText = computed(() => {
  let text
  if (language.value == Lang.CN) {
    text = '立/和/铳/听'
    if (has_chombo.value) {
      text += '/罚'
    }
  } else if (language.value == Lang.EN) {
    text = 'R/A/D/T'
    if (has_chombo.value) {
      text += '/C'
    }
  }
  return text
})

const HandCountLabelText = computed(() => {
  if (language.value == Lang.CN) {
    return `局数`
  } else if (language.value == Lang.EN) {
    return 'Hands'
  }
})

const AvgAgariPtSummaryLabelText = computed(() => {
  if (language.value == Lang.CN) {
    return `平均和牌打点`
  } else if (language.value == Lang.EN) {
    return 'Avg Agari Income'
  }
})

const AvgDealInPtSummaryLabelText = computed(() => {
  if (language.value == Lang.CN) {
    return `平均放铳损失`
  } else if (language.value == Lang.EN) {
    return 'Avg Deal-in Cost'
  }
})

const UploadGameStatsButtonText = computed(() => {
  if (language.value == Lang.CN) {
    return `上传结果`
  } else if (language.value == Lang.EN) {
    return `Upload Results`
  }
})

const InputTokenMsgText = computed(() => {
  if (language.value == Lang.CN) {
    return '请输入上传口令'
  } else if (language.value == Lang.EN) {
    return 'Please input token for uploading'
  }
})

function UploadCompleteMsgText(game_id) {
  if (language.value == Lang.CN) {
    return `数据上传成功! 游戏ID: ${game_id}`
  } else if (language.value == Lang.EN) {
    return `Upload Completed! Game ID: ${game_id}`
  }
}

const UploadFailedMsgText = computed(() => {
  if (language.value == Lang.CN) {
    return '上传失败!'
  } else if (language.value == Lang.EN) {
    return 'Upload Failed!'
  }
})

const UploadDuplicatedMsgText = computed(() => {
  if (language.value == Lang.CN) {
    return '本局游戏已经上传，无需多次上传!'
  } else if (language.value == Lang.EN) {
    return 'The game is already uploaded!'
  }
})

const UploadDataMissingMsgText = computed(() => {
  if (language.value == Lang.CN) {
    return '数据丢失，无法上传!'
  } else if (language.value == Lang.EN) {
    return 'Missing data, cannot upload!'
  }
})

const UploadRulesetNotSupportedMsgText = computed(() => {
  if (language.value == Lang.CN) {
    return '游戏设置规则不支持上传!'
  } else if (language.value == Lang.EN) {
    return 'Uploading the current rule set is not supported!'
  }
})

const has_chombo = computed(() => {
  const chombo_logs = props.game.log.reduce(
    (game_count, log) => (game_count += log.log_type == GameLogType.CHOMBO ? 1 : 0),
    0
  )
  return chombo_logs > 0
})

const game_stats = ref({})

function GetPlayerSummary(player_id, rank) {
  if (language.value == Lang.CN) {
    return `${GetPlayerName(player_id)}[${WindsDisplayTextMap[player_id]}起][${PlaceNumberDisplayMap[rank][language.value]}]`
  } else if (language.value == Lang.EN) {
    return `${GetPlayerName(player_id)}[${WindsDisplayTextMap[player_id]}][${PlaceNumberDisplayMap[rank][language.value]}]`
  }
}

function GetActionSummary(stats) {
  let summary = `${stats.riichi}/${stats.agari}/${stats.deal_in}/${stats.tenpai_on_draw}`
  if (has_chombo.value) {
    summary += `/${stats.chombo}`
  }
  return summary
}

function GetAvgAgariPtSummary(stats) {
  return stats.agari == 0 ? 0 : Math.round(stats.agari_pt_sum / stats.agari)
}

function GetAvgDealInPtSummary(stats) {
  return stats.deal_in == 0 ? 0 : Math.round(-stats.deal_in_pt_sum / stats.deal_in)
}

function GetPlayerName(player_id) {
  return props.game.players.GetPlayer(player_id).name
}

function GetPlayerPoints(player_id) {
  return props.game.players.GetPlayer(player_id).points
}

function GetPlayerRank(player_id) {
  return props.game.players.player_rank[player_id]
}

function UploadGameStats() {
  console.log('UploadGameStats: ', game_stats.value)
  if (!game_stats.value) {
    console.warn('Invalid game stats to upload:', game_stats.value)
    alert(UploadDataMissingMsgText.value)
    return
  }
  if (!Object.keys(FixedRulesetMap).includes(props.game.ruleset.id)) {
    alert(UploadRulesetNotSupportedMsgText.value)
    return
  }
  if (props.game.Uploaded()) {
    alert(UploadDuplicatedMsgText.value)
    return
  }
  const token = prompt(InputTokenMsgText.value)
  if (token == undefined || token == null) {
    return
  }
  console.log('game date = ', props.game.game_date, typeof props.game.game_date)
  const date_info = props.game.game_date
    .toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
    .split('/')
  const game_date =
    parseInt(date_info[2]) * 10000 + parseInt(date_info[0]) * 100 + parseInt(date_info[1])

  const data_to_post = {
    action: 'record_game',
    token: token,
    ruleset_id: props.game.ruleset.id,
    game: {
      game_date: game_date,
      game_hand_count: GameHandCount()
    }
  }
  for (const player_id of PlayerIdsInOrder) {
    const stats = game_stats.value[player_id]
    data_to_post.game[player_id] = {
      name: GetPlayerName(player_id),
      points: stats.points,
      riichi: stats.riichi,
      agari: stats.agari,
      deal_in: stats.deal_in,
      chombo: stats.chombo,
      tenpai_on_draw: stats.tenpai_on_draw,
      agari_pt_sum: stats.agari_pt_sum,
      deal_in_pt_sum: stats.deal_in_pt_sum
    }
  }
  const { data, onFetchResponse, onFetchError } = useFetch(RECORD_GAME_API)
    .post(data_to_post)
    .text()
  onFetchResponse((response) => {
    const game_id = JSON.parse(data.value).game_id
    alert(UploadCompleteMsgText(game_id))
    emit('gameUploaded', game_id)
  })
  onFetchError((error) => {
    alert(`${UploadFailedMsgText.value}: ${data.value}`)
  })
}

function ComputeGameStats() {
  console.log('ComputeGameStats')
  for (const player_id of PlayerIdsInOrder) {
    // find players rank and points from current hand
    const points = GetPlayerPoints(player_id)
    const rank = GetPlayerRank(player_id)
    // loop log to compute game stats
    let stats = {
      points: points,
      rank: rank,

      riichi: 0,

      agari: 0,
      agari_over_mangan: 0,
      agari_after_riichi: 0,
      agari_pt_sum: 0,

      deal_in: 0,
      deal_in_over_mangan: 0,
      deal_in_after_riichi: 0,
      deal_in_pt_sum: 0,

      tenpai_on_draw: 0,

      chombo: 0
    }
    props.game.log.forEach((log) => {
      if (log.log_type == GameLogType.ASSIGN_LEFT_OVER_RIICHI) {
        return
      } else if (log.log_type == GameLogType.CHOMBO) {
        if (log.hand.results.chombo.includes(player_id)) {
          stats.chombo += 1
        }
        return
      } else if (log.log_type == GameLogType.REGULAR) {
        const hand = log.hand
        const player_riichi = log.hand.riichi && log.hand.riichi.includes(player_id)
        if (player_riichi) {
          stats.riichi += 1
        }
        if (
          hand.results.outcome == HandOutcomeEnum.DRAW &&
          hand.results.tenpai &&
          hand.results.tenpai.includes(player_id)
        ) {
          stats.tenpai_on_draw += 1
        }
        if (
          hand.results.outcome != HandOutcomeEnum.DRAW &&
          hand.results.winner.includes(player_id)
        ) {
          stats.agari += 1
          stats.agari_pt_sum += hand.results.points_delta[player_id]
          if (player_riichi) {
            stats.agari_after_riichi += 1
            stats.agari_pt_sum -= props.game.ruleset.riichi_cost
          }
          if (hand.results.han in PointsLadder) {
            stats.agari_over_mangan += 1
          }
        }
        if (hand.results.outcome == HandOutcomeEnum.RON && hand.results.deal_in == player_id) {
          stats.deal_in += 1
          stats.deal_in_pt_sum += hand.results.points_delta[player_id]
          if (player_riichi) {
            stats.deal_in_after_riichi += 1
            stats.deal_in_pt_sum -= props.game.ruleset.riichi_cost
          }
          if (hand.results.han in PointsLadder) {
            stats.deal_in_over_mangan += 1
          }
        }
      }
    })
    game_stats.value[player_id] = stats
  }
}

const GameStatsBoard = computed(() => {
  console.log('Generate GameStatsBoard')
  ComputeGameStats()
  let table = []
  for (const player_id of PlayerIdsInOrder) {
    const stats = game_stats.value[player_id]
    const row = {
      player_summary: GetPlayerSummary(player_id, stats.rank),
      rank: stats.rank,
      points: stats.points,
      action_summary: GetActionSummary(stats),
      avg_agari_pt_summary: GetAvgAgariPtSummary(stats),
      avg_deal_in_pt_summary: GetAvgDealInPtSummary(stats),
      tenpai_on_draw: stats.tenpai_on_draw
    }
    table.push(row)
  }
  table.sort((a, b) => {
    return a.rank - b.rank
  })
  return table
})

function GameHandCount() {
  return props.game.log.reduce(
    (game_count, log) => (game_count += log.log_type == GameLogType.REGULAR ? 1 : 0),
    0
  )
}
</script>

<template>
  <el-collapse>
    <el-collapse-item :title="`${StatsTitleText} (${HandCountLabelText}: ${GameHandCount()})`">
      <el-table :data="GameStatsBoard" style="width: 100%" stripe table-layout="auto">
        <el-table-column fixed prop="player_summary" :label="PlayerSummaryLabelText" />
        <el-table-column prop="points" :label="PointsLabelText" />
        <el-table-column prop="action_summary" :label="ActionSummaryLabelText" />
        <el-table-column prop="avg_agari_pt_summary" :label="AvgAgariPtSummaryLabelText" />
        <el-table-column prop="avg_deal_in_pt_summary" :label="AvgDealInPtSummaryLabelText" />
      </el-table>
      <el-divider />
      <el-button v-if="props.game.IsFinished()" type="success" @click="UploadGameStats">
        {{ UploadGameStatsButtonText }}</el-button
      >
    </el-collapse-item>
  </el-collapse>
</template>
