<template>
  <!-- pre-game display -->
  <div v-if="!game.on_going">
    <div>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center">东起家: </span>
        <el-input
          v-model="game.players.east.name"
          placeholder="East Player"
          class="w-50 m-2"
          size="small"
          clearable
        />
      </el-row>
    </div>
    <div>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center">南起家: </span>
        <el-input
          v-model="game.players.south.name"
          placeholder="South Player"
          class="w-50 m-2"
          size="small"
          clearable
        />
      </el-row>
    </div>
    <div>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center">西起家: </span>
        <el-input
          v-model="game.players.west.name"
          placeholder="West Player"
          class="w-50 m-2"
          size="small"
          clearable
        />
      </el-row>
    </div>
    <div>
      <el-row :gutter="20">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center">北起家: </span>
        <el-input
          v-model="game.players.north.name"
          placeholder="North Player"
          class="w-50 m-2"
          size="small"
          clearable
        />
      </el-row>
    </div>
    <el-button type="primary" @click="SetUpGame">开始游戏</el-button>
  </div>

  <!-- in-game display -->

  <div v-if="game.on_going">
    <el-button type="danger" @click="FinishGame">结束游戏</el-button>
    <div v-for="wind in Winds">
      {{ game.players[wind] }}
    </div>

  <div>
    current hand: {{ current_hand }}
  </div>
  <div>
    riichi sticks: {{ game.riichi_sticks }}
  </div>
  <div>
    honba: {{ game.honba }}
  </div>

  <div v-for="wind in Winds">
    {{game.players[wind].name}} <el-switch v-model="game.players[wind].riichi" @change="HandlePlayerRiichi(wind)" active-text="立直!"/>
  </div>

  </div>

</template>

<script>
import { ElButton } from 'element-plus'
import { ref } from 'vue'

const kDebugFlag = true

const Winds = Object.freeze({
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  NORTH: 'north',
})

function Log(msg, debug = false) {
  if (!debug || kDebugFlag) {
    console.log(JSON.stringify(msg))
  }
}

// Sets up the game.
function SetUpGame(game, rules) {
  if (game.value.on_going === true) {
    alert(`Game is already on going!`);
    return;
  }

  Log('SetUpGame');
  Log(rules);
  game.value.round_wind = Winds.EAST;
  game.value.hand = 1;
  game.value.honba = 0;
  game.value.riichi_sticks = 0;
  game.value.log = [];
  for (let [_, player] of Object.entries(game.value.players)) {
    player.starting_points = rules.starting_points;
    player.points = rules.starting_points;
    player.is_dealer = (player.starting_wind === Winds.EAST);
    player.riichi = false;
  }
  game.value.on_going = true;
}

// Finishes the whole game.
function FinishGame(game, rules) {
  Log('FinishGame');
  confirm("Are you sure to finish the game?");
  game.value.on_going = false;
  game.value.finished = true;
}

// Finishes the current hand and move to the next one.
function FinishHand(game, rules) {
  Log(`FinishHand`);
}

// Handle player riichi event
function HandlePlayerRiichi(player_id, game, rules) {
  Log("HandlePlayerRiichi");
  Log(player_id);
  let player = game.value.players[player_id];
  if (player.riichi === true) {
    player.points -= rules.riichi_cost;
    game.value.riichi_sticks += 1;
  } 
  else {
    player.points += rules.riichi_cost;
    game.value.riichi_sticks -= 1;
  }
  Log(player);
}

const rules = ref({
  starting_points: 25000,
  honba_points: 300,
  round_up_mangan: true,
  head_bump: true,
  draw_tenpai_points: 3000,
  riichi_cost: 1000,
});

const game = ref({
  on_going: false,
  // the keys are statring wind, also used as player id throughout the game.
  players: {
    [Winds.EAST]: {
      name: '赤木',
      starting_wind: Winds.EAST,
      current_wind: Winds.EAST,
    },
    [Winds.SOUTH]: {
      name: '藤原',
      starting_wind: Winds.SOUTH,
      current_wind: Winds.SOUTH,
    },
    [Winds.WEST]: {
      name: '瓦西子',
      starting_wind: Winds.WEST,
      current_wind: Winds.WEST,
    },
    [Winds.NORTH]: {
      name: '天',
      starting_wind: Winds.NORTH,
      current_wind: Winds.NORHT,
    }
  }
});

export default {
  name: 'RiichiCounter',
  components: {
    ElButton
  },
  setup() {
    Log('Setup');
  },
  created() {
    Log('created');
  },
  data: function () {
    return {
      game: game,
      Winds: Winds,
    }
  },
  computed: {
    current_hand() {
      if (game.value.on_going === true) {
        return `${game.value.round_wind} - ${game.value.hand}`;
      }
      else {
        return `Game Not Started`;
      }
    }
  },
  methods: {
    SetUpGame: () => {
      SetUpGame(game, rules.value);
    },
    FinishGame: () => {
      FinishGame(game, rules.value);
    },
    HandlePlayerRiichi: (player_id) => {
      HandlePlayerRiichi(player_id, game, rules.value);
    },
  },
}
</script>
