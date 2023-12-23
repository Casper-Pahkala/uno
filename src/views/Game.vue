<template>
  <div class="game" v-if="store.lobby">

    <div class="player-turn" >
      <span v-if="myTurn" style="color: #388E3C; font-weight: 600; font-size: 50px;">
        Your turn
      </span>
      <template v-else-if="currentPlayer">
        {{ currentPlayer.name }}'s Turn
      </template>
    </div>

    <div class="mid">
      <div :class="'card ' + latestGameCard.color">

        <template v-if="latestGameCard.value === 'Wild'">
          <img class="wild" :src="`/wild_${latestGameCard.color}.jpg`">
        </template>

        <template v-else-if="latestGameCard.value === 'Wild Draw Four'">
            <img class="wild" :src="`/wild_4_${latestGameCard.color}.png`">
          </template>

        <template v-else>
          {{ latestGameCard.value }}
        </template>
      </div>

      <v-btn @click="drawCard" class="draw-card-btn" color="primary" size="large" :disabled="!myTurn">
        Draw card
      </v-btn>
    </div>


    <div class="my-cards">
      <div class="my-cards-wrapper">
        <div
            v-for="(card, index) in myCards"
            :key="index"
            :class="'card ' + card.color + (myTurn ? ' myturn' : '')"
            @click="onCardClick(card)"
          >
          <template v-if="card.value === 'Wild'">
            <img class="wild" src="/wild.jpg">
          </template>

          <template v-else-if="card.value === 'Wild Draw Four'">
            <img class="wild" src="/wild_4.png">
          </template>

          <template v-else>
            {{ card.value }}
          </template>

        </div>
      </div>
    </div>

    <v-card class="players pa-10" elevation="8">
      <div
        v-for="player in store.lobby.game.players"
        :key="player.id"
        class="player"
        :class="{ turn: currentPlayer && currentPlayer.id === player.id }"
      >
      <span>
        {{ player.name }}
      </span>
      <span>
        {{ ' (' + player.cards.length + ')' }}
      </span>
    </div>
    </v-card>
  </div>


  <v-dialog v-model="colorDialog" persistent width="400px">
    <v-card>
      <v-btn @click="selectColor('blue')">
        Blue
      </v-btn>

      <v-btn @click="selectColor('red')">
        Red
      </v-btn>

      <v-btn @click="selectColor('yellow')">
        Yellow
      </v-btn>

      <v-btn @click="selectColor('green')">
        Green
      </v-btn>
    </v-card>

  </v-dialog>


  <v-dialog v-model="gameWon" persistent width="600px">
    <v-card
    class="pt-5 pl-10 pr-10 pb-5"
    >
      <h1 style="text-align: center;">
        WINNER: {{ gameWinner() }}
      </h1>

      <v-btn color="primary" size="large" class="mt-10" @click="store.playAgain()">
        Play again
      </v-btn>
    </v-card>
  </v-dialog>

</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const store = useAppStore();
const route = useRoute();
const router = useRouter();

if (!store.lobby) {
  const code = Array.isArray(route.query.code)
    ? route.query.code[0]
    : route.query.code;

  if (code) {
    store.joinLobby(parseInt(code));
  } else {
    router.push({
      name: 'Home'
    });
  }
}


const colorDialog = ref(false);
const toPlayWildCard = ref(null);

const latestGameCard = computed(() => {
  if (!store.lobby) {
    return null;
  }
  if (!store.lobby.game) {
    return null;
  }
  return store.lobby.game.currentDeck[store.lobby.game.currentDeck.length - 1];
})

const gameWon = computed(() => {
   if (!store.lobby) {
    return false;
  }
  if (!store.lobby.game) {
    return false;
  }
  return store.lobby.game.gameWon !== null;
})

const myCards = computed(() => {
   if (!store.lobby) {
    return null;
  }
  const player = store.lobby.game.players.find((p: any) => p.id === store.player.id);
  console.log(store.lobby.game.players, store.player.id);
  if (!player) {
    return [];
  }
  return player.cards;
})

const currentPlayer = computed(() => {
   if (!store.lobby) {
    return null;
  }
  const player = store.lobby.game.players[store.lobby.game.currentPlayerIndex];
  if (!player) {
    return null;
  }
  return player;
})

const myTurn = computed(() => {
   if (!store.lobby) {
    return null;
  }
  return store.lobby.game.currentPlayerIndex === store.lobby.game.players.findIndex((p: any) => p.id === store.player.id) && !store.turnFinished;
})

function onCardClick(card: any) {
  if (myTurn.value) {
    if (canPlayCard(card)) {
      if (card.color === 'wild') {
        colorDialog.value = true;
        toPlayWildCard.value = card;
      } else {
        store.playCard(card);
      }
    }
  }

}


function canPlayCard(card: any) {
  if (
    latestGameCard.value.color === card.color
    || latestGameCard.value.value === card.value
    || card.color === 'wild'
    ) {
    return true;
  }
  return false;
}

function drawCard() {
  if (myTurn.value) {
    store.drawCard();
  }
}

function selectColor(color: string) {
  // Handle the selected color, you can use it as needed
  console.log('Selected color:', color);

  // Close the dialog
  colorDialog.value = false;
  if (toPlayWildCard.value) {
    // @ts-ignore
    toPlayWildCard.value.color = color;
  }
  store.playCard(toPlayWildCard.value);
}

function gameWinner() {
  let id = store.lobby.game.gameWon;
  return store.lobby.game.players.find((p: any) => p.id === id).name;
}

</script>

<style scoped>

.game {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.my-cards {
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

}

.my-cards-wrapper {
  display: flex;
  max-width: 1200px;
  height: 100%;
  overflow-x: scroll;
  padding: 10px;
}

.card {
  margin-left: 10px;
  height: 100%;
  width: 150px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
  color: white;
  text-shadow: 0 0 2px black, 0 0 2px black, 0 0 2px black, 0 0 2px black;
  flex-shrink: 0;
  overflow: hidden;
  text-align: center;
}


.card.blue {
  background-color: blue;
}

.card.red {
  background-color: red;
}

.card.yellow {
  background-color: yellow;
}

.card.green {
  background-color: green;
}

.card.wild {
  background-color: black;
}


.player-turn {
  /* position: absolute; */
  /* top: 50px; */
  font-size: 30px;
  height: 100px;
}

.my-cards .card.myturn {
  cursor: pointer;
  transition: 0.3s all ease;
}

.my-cards .card.myturn:hover {
  transform: scale(1.08);
}

.players {
  position: absolute;
  right: 25%;
  height: 300px;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  color: #808080;
  top: 40%;
  transform: translateY(-50%);
}

.player.turn {
  color: rgb(39, 103, 254);
}

.mid {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.mid .card {
  height: 280px;
  width: 200px;
}

.card .wild {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
