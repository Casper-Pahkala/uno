// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    websocket: null as WebSocket | null,
    baseUrl: 'rekrytor.fi',
    websocketStatus: 'Disconnected',
    lobby: null as any,
    router: null as any,
    player: {
      id: null as unknown as number,
      name: '' as string,
    },
    turnFinished: false
  }),
  actions: {
    connectToWebsocket() {
     console.log('CONNECTING TO WS');
     if (this.websocket && this.websocket.readyState !== 3) {
       console.log('WebSocket connection is already open or in progress.');
       return;
     }

     this.websocket = new WebSocket('wss://' + this.baseUrl + ':7000');

     this.websocket.addEventListener('open', () => {
       this.websocketStatus = 'Connected';
       console.log('Connected to ws');
     });

     this.websocket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Message received:', data);
        this.handleWSMessage(data);
     });

     this.websocket.addEventListener('close', () => {
       this.websocketStatus = 'Closed';
       setTimeout(() => {
         this.connectToWebsocket();
       }, 1000);
     });
   },
   createLobby() {
    if (this.websocket) {
      const payload = {
        action: 'CREATE_LOBBY',
        player: this.player
      };
      this.websocket.send(JSON.stringify(payload));
    }
   },
   handleWSMessage(data : any) {
    switch(data.action) {
      case 'LOBBY_CREATED':
        this.lobby = data.lobby;
        this.router.push({
          name: 'Lobby',
          query: {
            code: this.lobby.code
          },
        });

        console.log('Lobby created', this.lobby);
        break;

      case 'LOBBY_JOINED':
        this.lobby = data.lobby;
        if (this.lobby.game.gameStarted) {
          this.router.push({
            name: 'Game',
            query: {
              code: this.lobby.code
            },
          });
        } else {
          this.router.push({
            name: 'Lobby',
            query: {
              code: this.lobby.code
            },
          });
        }
        console.log('Lobby joined', this.lobby);
        break;
      case 'LOBBY_NOT_FOUND':
        this.router.replace({
          name: 'Home'
        })
        break;

      case 'STATE_UPDATE':
        this.lobby = data.lobby;
        this.turnFinished = false;
        break;

      case 'START_GAME':
        this.lobby = data.lobby;
        this.router.push({
          name: 'Game',
          query: {
            code: this.lobby.code
          },
        });
        break;
      case 'PLAYED_CARD':
        this.playedCard(data);
        break;
      case 'PLAY_AGAIN':
        this.gamePlayAgain(data.lobby_code);
        break;
    }
   },
   joinLobby(code : number) {
    if (this.websocketStatus == 'Connected' && this.websocket) {
      const payload = {
        action: 'JOIN_LOBBY',
        code: code,
        player: this.player
      };
      this.websocket.send(JSON.stringify(payload));
    } else {
      setTimeout(() => {
        this.joinLobby(code);
      }, 1000);
    }
   },
   startGame(lobbyCode: number) {
    const payload = {
      action: 'START_GAME',
      lobby_code: lobbyCode
    }
    this.websocket?.send(JSON.stringify(payload));
   },
   playCard(card: any) {
    if (this.websocket) {
      const payload = {
        action: 'PLAY_CARD',
        card,
        player: this.player,
        lobby_code: this.lobby.code
      };
      this.turnFinished = true;

      const player = this.lobby.game.players.find((p: any) => p.id === this.player.id);
      player.cards = player.cards.filter((c: any) => c.id !== card.id);
      this.websocket.send(JSON.stringify(payload));
    }
   },
   drawCard() {
    if (this.websocket) {
      const payload = {
        action: 'DRAW_CARD',
        player: this.player,
        lobby_code: this.lobby.code
      };
      this.turnFinished = true;
      this.websocket.send(JSON.stringify(payload));
    }

   },
   playedCard(data: any) {
    // const player = this.lobby.game.players.find(p => p.id === data.player.id);
    // player.cards = player.cards.filter(c => c.id !== data.card.id);

    // this.lobby.game.currentDeck.push(data.card);

    // console.log(`${data.player.name} played ${data.card.color} ${data.card.value}`)
   },
   playAgain() {
    if (this.websocket) {
      const payload = {
        action: 'PLAY_AGAIN',
        player: this.player,
        lobby_code: this.lobby.code
      };
      this.websocket.send(JSON.stringify(payload));
    }
   },
   gamePlayAgain(code: number) {
    this.joinLobby(code);
   }
  },
  getters: {
    isHost() {
      if (this.lobby && this.lobby.host === this.player.id) {
      return true;
      }
      return false;
    }
  }
})
