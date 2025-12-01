const WebSocket = require('ws');

class BattleServer {
     constructor(port){
        this.wss = new WebSocket.Server({port});
        this.clients = new Set();
        this.player = new Map();
        this.waitingPlayers = [];
        this.battles = new Map();
        this.setupServerEvents();
        console.log(`포트 ${port}에서 시작됨. `);


     }

     setupServerEvents()
     {
        this.wss.on('connection', (socket) => {
            this.clients.add(socket);
            const playerId = this.generatePlayerId();

            this.waitingPlayers.set(playerId , {
                socket : socket,
                id : playerId,
                name : `Player_${playerId,substr(-4)}`,
                hp : 100,
                maxHp : 100,
                inBattle : false,
                battleId : null

            });

            console.log(`플레이어 접속 : ${playerId} (총 ${this.clients.size} 명)`);


            this.sendToPlayer(playerId, {
                type: 'connected',
                playerId : playerId,
                playerData : this.waitingPlayers.get(playerId)
            })

            socket.on('message', (message) => 
            {
                try
                {
                    const data = JSON.parse(message);
                    this.handleMessage(playerId, data);
                }
                catch (error)
                {
                    console.error('메세지 파싱 에러 :', error);
                }
            });

            socket.on('close', () =>
            {
                this.handleDisconnect(playerId);
            });

            socket.on('error', (error) => 
            {
                console.error ( '소켓 에러 ', error);
            });


        });
     }

     handleMessage(playerId, data)
     {
        console.log(`메세지 수신 [${playerId}]:` , data.type);
        switch (data.type)
        {
            case 'findMatch' :
                this.handlefindMatch(playerId);
                break;
            case 'cancelMatch' : 
                this.handleCancelMatch(playerId);
                break;
            case 'battleAction' :
                this.handleBattleAction(playerId, data.action);
                break;

            default : 
                 console.log(`알 수 없는 메세지 타입 : ${data.type}`);      
        }
     }

     handleFindMatch(playerId)
     {
        const player = this.waitingPlayers.get(playerId);
        if (!player) return;

        if (player.inBattle){
            this.sendToPlayer(playerId, {
                type : 'error',
                message : '이미 배틀 중입니다.'
            });
            return;
        }

        if (this.waitingPlayers.includes(playerId))
        {
            this.sendToPlayer(playerId, {
                type : 'error',
                message : '이미 매칭 대기 중입니다.'
            });
            return;
        }
        console.log(`매칭 대기 추가 : ${playerId}`);
        this.waitingPlyers.push(playerId);

        this.sendToPlayer(playerId , {
            type : 'matchSearching',
            message : '상대를 찾는 중...'
        });

        this.tryMatchPlayers();
     }

     handleCancelMatch (playerId)
     {
        const index = this.waitingPlayers.indexOf(playerId);
        if (index > -1)
        {
            this.waitingPlayers.splice(index, 1);
            console.log(`매칭 취소 : ${playerId}`);

            this.sendToPlayer(plaerId, {
                type : 'machCanceled',
                message : '매칭이 취소되었습니다.'
            });
        }
     }
     // 2명 이상이면 매칭
     tryMatchPlayers()
     {
       while (this.waitingPlayers.length >= 2)
        {
        const player1Id = this.waitingPlayers.shift();
        const player2Id = this.waitingPlayers.shift();

        this.startBattle(player1Id, player2Id);
        }
     }
     startBattle(player1Id, player2Id)
     {
       const battleId = this.generatePlayerId();
       const player1 = this.players.get(player1Id);
       const player2 = this.players.get(player2Id);

       if (!player1 || !player2)
       {
        console.error('플레이어를 찾을 수 없습니다.');
        return;
       }

       player1.hp = player1.maxHp;
       player2.hp = player2.maxHp;
       player1.inBattle = true;
       player2.inBattle = true;
       player1.battleId = battleId;
       player2.battleId = battleId;
    }
}

const battleServer = new Battleserver(3001);

// 배틀 데이터 생성
const battle = {
    id: battleId,
    player1: player1Id,
    player2: player2Id,
    currentTurn: player1Id,
    turnCount: 1,
    player1LastAction: null,
    player2LastAction: null,
    isWaitingForActions: true
};

this.battles.set(battleId, battle);
console.log(`배틀 시작 : ${battleId}`);
console.log(`Player1 : ${player1Id} vs Player2 : ${player2Id}`);