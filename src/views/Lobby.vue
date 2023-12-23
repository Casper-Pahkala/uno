<template>
  <div class="main" v-if="store.lobby">
    <v-card
      class="code-container"
      elevation="10"
    >
      {{ store.lobby.code }}
    </v-card>

    <v-card

      elevation="2"
      class="players-container"
      :title="'Players ' + store.lobby.game.players.length + '/4'"
    >
      <div
        class="player-name"
        v-for="(player, index) in store.lobby.game.players"
        :key="index"
      >
        {{ player.name }}
        <span v-if="store.lobby.host === player.id" style="font-weight: 600;">Host</span>
      </div>
    </v-card>

    <v-btn
      v-if="store.lobby.host === store.player.id"
      id="start-btn"
      color="primary"
      size="large"
      :disabled="store.lobby.game.players.length < 2"
      @click="startGame()"
    >Start the game</v-btn>
  </div>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store/app';
  import { useRouter, useRoute } from 'vue-router';

  const store = useAppStore();
  const route = useRoute();
  const router = useRouter();
  if (!store.lobby) {
    const code = Array.isArray(route.query.code)
      ? route.query.code[0]
      : route.query.code;

    console.log(code);
    if (code) {
      store.joinLobby(parseInt(code));
      setTimeout(() => {
        console.log(store.lobby.host, store.player.id)
      }, 1000);
    } else {
      router.push({
        name: 'Home'
      });
    }
  }

  function startGame() {
    store.startGame(parseInt(store.lobby.code));
  }
</script>

<style scoped>
  .main {
    height: 100%;
    display: flex;
    /* justify-content: center; */
    align-items: center;
    flex-direction: column;
  }

  .code-container {
    width: 400px;
    height: 100px;
    margin-top: 200px;
    line-height: 100px;
    text-align: center;
    font-size: 50px;
    font-weight: 600;
  }

  .players-container {
    width: 400px;
    padding: 10px 20px;
    margin-top: 150px;
    background-color: rgb(240, 240, 240);
  }

  .player-name {
    padding: 5px 0;
    font-size: 16px;
  }

  #start-btn {
    position: absolute;
    bottom: 100px;
  }
</style>
