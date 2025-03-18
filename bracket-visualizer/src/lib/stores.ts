import { writable } from 'svelte/store';

export interface Team {
  region: string;
  seed: number;
  name?: string;
  image?: string;
}

export interface Game {
  id: string;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
}

export interface Round {
  name: string;
  games: Game[];
  position: 'left' | 'right' | 'center';
}

const createBracketStore = () => {
  const regions = ["South", "West", "East", "Midwest"];
  const teams: Team[] = [];
  
  regions.forEach(region => {
    for (let i = 1; i <= 16; i++) {
      teams.push({ region, seed: i });
    }
  });
  
  // Initialize rounds with empty games
  const initialRounds: Round[] = [
    { name: 'First Round (Left)', games: [], position: 'left' },
    { name: 'First Round (Right)', games: [], position: 'right' },
    { name: 'Second Round (Left)', games: [], position: 'left' },
    { name: 'Second Round (Right)', games: [], position: 'right' },
    { name: 'Sweet 16 (Left)', games: [], position: 'left' },
    { name: 'Sweet 16 (Right)', games: [], position: 'right' },
    { name: 'Elite Eight (Left)', games: [], position: 'left' },
    { name: 'Elite Eight (Right)', games: [], position: 'right' },
    { name: 'Final Four (Left)', games: [], position: 'left' },
    { name: 'Final Four (Right)', games: [], position: 'right' },
    { name: 'Championship', games: [], position: 'center' }
  ];

  // Set up first round games - left side (first two regions)
  const leftRegions = [teams.filter(t => t.region === regions[0]), teams.filter(t => t.region === regions[1])];
  let gameId = 0;
  
  leftRegions.forEach((regionTeams, regionIdx) => {
    for (let i = 0; i < 8; i++) {
      const team1 = regionTeams[i];
      const team2 = regionTeams[15 - i];
      
      initialRounds[0].games.push({
        id: `first-left-${gameId}`,
        team1,
        team2,
        winner: null
      });
      gameId++;
    }
  });
  
  // Reorder games as per original algorithm for left side
  for (let offset = 0; offset < 2; offset++) {
    let o = offset * 8;
    swapGames(initialRounds[0].games, 1 + o, 7 + o);
    swapGames(initialRounds[0].games, 2 + o, 5 + o);
    swapGames(initialRounds[0].games, 4 + o, 2 + o);
  }
  
  // Set up first round games - right side (second two regions)
  const rightRegions = [teams.filter(t => t.region === regions[2]), teams.filter(t => t.region === regions[3])];
  gameId = 0;
  
  rightRegions.forEach((regionTeams, regionIdx) => {
    for (let i = 0; i < 8; i++) {
      const team1 = regionTeams[i];
      const team2 = regionTeams[15 - i];
      
      initialRounds[1].games.push({
        id: `first-right-${gameId}`,
        team1,
        team2,
        winner: null
      });
      gameId++;
    }
  });
  
  // Reorder games as per original algorithm for right side
  for (let offset = 0; offset < 2; offset++) {
    let o = offset * 8;
    swapGames(initialRounds[1].games, 1 + o, 7 + o);
    swapGames(initialRounds[1].games, 2 + o, 5 + o);
    swapGames(initialRounds[1].games, 4 + o, 2 + o);
  }
  
  // Setup empty games for later rounds
  // Left side (Second Round, Sweet 16, Elite Eight)
  for (let round = 2; round <= 6; round += 2) {
    const prevGamesCount = initialRounds[round-2].games.length;
    const gamesCount = prevGamesCount / 2;
    
    for (let i = 0; i < gamesCount; i++) {
      initialRounds[round].games.push({
        id: `${initialRounds[round].name.toLowerCase().replace(/\s/g, '-')}-${i}`,
        team1: null,
        team2: null,
        winner: null
      });
    }
  }
  
  // Right side (Second Round, Sweet 16, Elite Eight)
  for (let round = 3; round <= 7; round += 2) {
    const prevGamesCount = initialRounds[round-2].games.length;
    const gamesCount = prevGamesCount / 2;
    
    for (let i = 0; i < gamesCount; i++) {
      initialRounds[round].games.push({
        id: `${initialRounds[round].name.toLowerCase().replace(/\s/g, '-')}-${i}`,
        team1: null,
        team2: null,
        winner: null
      });
    }
  }
  
  // Final Four (2 games)
  initialRounds[8].games = [
    {
      id: 'final-four-0',
      team1: null,
      team2: null,
      winner: null
    },
  ]
  initialRounds[9].games = [
    {
      id: 'final-four-1',
      team1: null,
      team2: null,
      winner: null
    }
  ];
  
  // Championship (1 game)
  initialRounds[10].games = [
    {
      id: 'championship',
      team1: null,
      team2: null,
      winner: null
    }
  ];
  
  const { subscribe, update } = writable({
    rounds: initialRounds,
    allTeams: teams,
    isGenerating: false,
    currentRound: 0,
    currentGame: 0,
    pendingGameIndices: [] as number[], // Tracks which games still need to be played in current round
    activeGameIndex: -1 // Currently active game being decided
  });
  
  return {
    subscribe,
    updateTeamInfo: (teamIndex: number, data: { name?: string, image?: string }) => {
      update(state => {
        const updatedTeams = [...state.allTeams];
        updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], ...data };
        
        // Also update this team in any existing games
        const updatedRounds = state.rounds.map(round => {
          return {
            ...round,
            games: round.games.map(game => {
              let updatedGame = { ...game };
              
              if (game.team1 && game.team1.region === updatedTeams[teamIndex].region && 
                  game.team1.seed === updatedTeams[teamIndex].seed) {
                updatedGame.team1 = updatedTeams[teamIndex];
              }
              
              if (game.team2 && game.team2.region === updatedTeams[teamIndex].region && 
                  game.team2.seed === updatedTeams[teamIndex].seed) {
                updatedGame.team2 = updatedTeams[teamIndex];
              }
              
              if (game.winner && game.winner.region === updatedTeams[teamIndex].region && 
                  game.winner.seed === updatedTeams[teamIndex].seed) {
                updatedGame.winner = updatedTeams[teamIndex];
              }
              
              return updatedGame;
            })
          };
        });
        
        return { ...state, allTeams: updatedTeams, rounds: updatedRounds };
      });
    },
    
    generateBracket: () => {
      update(state => {
        // Initialize with all games in first round as pending
        const pendingGameIndices = Array.from({ length: state.rounds[0].games.length }, (_, i) => i);
        // Shuffle the order
        shuffleArray(pendingGameIndices);
        
        // Pick the first game to process
        const activeGameIndex = pendingGameIndices.pop() || 0;
        
        return { 
          ...state, 
          isGenerating: true, 
          currentRound: 0, 
          currentGame: activeGameIndex,
          pendingGameIndices,
          activeGameIndex
        };
      });
    },
    
    advanceGeneration: () => {
      update(state => {
        if (!state.isGenerating) return state;
        
        let newState = { ...state };
        const currentRound = state.currentRound;
        const currentGame = state.activeGameIndex;
        
        // Check if the current round exists
        if (!state.rounds[currentRound]) {
          return { ...state, isGenerating: false };
        }
        
        // Process the current game
        if (currentRound <= 1) { // First rounds (left and right)
          // First round games already have teams assigned, just determine winner
          const game = state.rounds[currentRound].games[currentGame];
          newState.rounds[currentRound].games[currentGame] = {
            ...game, 
            winner: getWinner(game)
          };
        } else {
          // For later rounds, we need to get teams from previous round winners
          const round = state.rounds[currentRound];
          
          if (round.position === 'left' || round.position === 'right') {
            // Find the correct previous round
            const prevRound = state.rounds.find(r => 
              r.position === round.position && 
              r.name.includes(getPreviousRoundName(round.name))
            );
            
            if (prevRound) {
              // For randomized order, we need to map the game indices correctly
              // The activeGameIndex is the randomized index in the current round
              const gameIdx = currentGame;
              
              // Calculate which two games from the previous round feed into this game
              const prevGameIdx1 = gameIdx * 2;
              const prevGameIdx2 = gameIdx * 2 + 1;
              
              if (prevGameIdx2 < prevRound.games.length) {
                const team1 = prevRound.games[prevGameIdx1].winner;
                const team2 = prevRound.games[prevGameIdx2].winner;
                
                if (team1 && team2) {
                  const game = {
                    ...state.rounds[currentRound].games[gameIdx],
                    team1,
                    team2
                  };
                  
                  newState.rounds[currentRound].games[gameIdx] = {
                    ...game,
                    winner: getWinner(game)
                  };
                }
              }
            }
          } else if (round.position === 'center') {
            if (round.name === 'Championship') {
              // Championship gets winners from Final Four
              const finalFourLeft = state.rounds.find(r => r.name === 'Final Four (Left)');
              const finalFourRight = state.rounds.find(r => r.name === 'Final Four (Right)');
              
              if (finalFourLeft && finalFourRight && finalFourLeft.games[0].winner && finalFourRight.games[0].winner) {
                const team1 = finalFourLeft.games[0].winner;
                const team2 = finalFourRight.games[0].winner;
                
                const game = {
                  ...state.rounds[currentRound].games[currentGame],
                  team1,
                  team2
                };
                
                newState.rounds[currentRound].games[currentGame] = {
                  ...game,
                  winner: getWinner(game)
                };
              }
            }
          }
        }
        
        // Check if we have more games in this round
        if (state.pendingGameIndices.length > 0) {
          // Pick the next game randomly from the remaining games
          const activeGameIndex = state.pendingGameIndices.pop() || 0;
          newState.activeGameIndex = activeGameIndex;
          newState.currentGame = activeGameIndex; // For UI display purposes
        } else {
          // Move to next round
          const nextRound = currentRound + 1;
          
          // Check if we've completed all rounds
          if (nextRound >= state.rounds.length) {
            return { ...state, isGenerating: false };
          }
          
          // Initialize next round with all games
          const nextRoundGames = state.rounds[nextRound].games;
          const pendingGameIndices = Array.from({ length: nextRoundGames.length }, (_, i) => i);
          // Shuffle the order
          shuffleArray(pendingGameIndices);
          
          // Pick the first game to process
          const activeGameIndex = pendingGameIndices.pop() || 0;
          
          newState.currentRound = nextRound;
          newState.pendingGameIndices = pendingGameIndices;
          newState.activeGameIndex = activeGameIndex;
          newState.currentGame = activeGameIndex; // For UI display
        }
        
        return newState;
      });
    },
    
    resetBracket: () => {
      update(state => {
        // Reset all rounds except first rounds (left and right)
        const resetRounds = state.rounds.map((round, index) => {
          if (index <= 1) return {
            ...round,
            games: round.games.map(game => ({
              ...game,
              team1: game.team1,
              team2: game.team2,
              winner: null
            }))
          }; // Keep first rounds unchanged
          
          return {
            ...round,
            games: round.games.map(game => ({
              ...game,
              team1: null,
              team2: null,
              winner: null
            }))
          };
        });
        
        return {
          ...state,
          rounds: resetRounds,
          isGenerating: false,
          currentRound: 0,
          currentGame: 0,
          pendingGameIndices: [],
          activeGameIndex: -1
        };
      });
    }
  };
};

// Fisher-Yates shuffle algorithm to randomize game order
function shuffleArray(array: number[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getPreviousRoundName(roundName: string): string {
  if (roundName.includes('Second Round')) return 'First Round';
  if (roundName.includes('Sweet 16')) return 'Second Round';
  if (roundName.includes('Elite Eight')) return 'Sweet 16';
  if (roundName.includes('Final Four')) return 'Elite Eight';
  return '';
}

function swapGames(games: Game[], index1: number, index2: number) {
  const temp = { ...games[index1] };
  games[index1] = { ...games[index2] };
  games[index2] = temp;
}

function getWinner(game: Game): Team | null {
  if (!game.team1 || !game.team2) return null;
  
  const percentage = game.team1.seed / (game.team1.seed + game.team2.seed);
  const rand = Math.random();
  
  return rand < percentage ? game.team2 : game.team1;
}

export const bracketStore = createBracketStore(); 