<template>
  <div v-if="hasName">
    <router-view />
  </div>


  <v-dialog
    v-model="nameDialog"
    width="400px"
    persistent
  >
    <v-card
      class="pa-5"
    >
      <v-card-title>Enter name</v-card-title>

      <v-text-field
        v-model="playerName"
        @keyup.enter="setName"
      ></v-text-field>

      <v-card-actions>
        <v-btn @click="setName" color="primary">Ready</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store/app';
  import { useRouter } from 'vue-router';
  import { ref } from 'vue'

  function generateRandomInt() {
    return Math.floor(10000000000 + Math.random() * 90000000000);
  }


  const router = useRouter();
  const store = useAppStore();

  const nameDialog = ref(false);
  const playerName = ref('');
  let hasName = localStorage.getItem('player_name') != null;
  store.connectToWebsocket();
  store.router = router;

  if (!localStorage.getItem('player_name')) {
    nameDialog.value = true;
  } else {
    store.player.name = localStorage.getItem('player_name') ?? '';
  }

  let uid: any = localStorage.getItem('uid');
  if (uid) {
    store.player.id = parseInt(uid);
  } else {
    uid = generateRandomInt();
    store.player.id = uid;
    localStorage.setItem('uid', uid.toString());
  }

  function setName() {
    localStorage.setItem('player_name', playerName.value);
    store.player.name = playerName.value;
    nameDialog.value = false;
    hasName = true;
  }
</script>
