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
}

const createBracketStore = () => {
  const regions = ["East", "West", "South", "Midwest"];
  const teams: Team[] = [];
  
  regions.forEach(region => {
    for (let i = 1; i <= 16; i++) {
      teams.push({ region, seed: i });
    }
  });
  
  // Initialize rounds with empty games
  const initialRounds: Round[] = [
    { name: 'First Round', games: [] },
    { name: 'Second Round', games: [] },
    { name: 'Sweet 16', games: [] },
    { name: 'Elite Eight', games: [] },
    { name: 'Final Four', games: [] },
    { name: 'Championship', games: [] }
  ];
  
  // Setup first round games
  for (let i = 0; i < 32; i++) {
    let offset = Math.floor(i / 8);
    
    let team1Index = i + (offset * 8);
    let team2Index = (15 + (offset * 16)) - (i - (offset * 8));
    
    initialRounds[0].games.push({
      id: `first-${i}`,
      team1: teams[team1Index],
      team2: teams[team2Index],
      winner: null
    });
  }
  
  // Reordering per the original algorithm
  for (let offset = 0; offset < 4; offset++) {
    let o = offset * 8;
    swapGames(initialRounds[0].games, 1 + o, 7 + o);
    swapGames(initialRounds[0].games, 2 + o, 5 + o);
    swapGames(initialRounds[0].games, 4 + o, 2 + o);
  }
  
  // Setup empty games for other rounds
  const gameCounts = [16, 8, 4, 2, 1];
  
  for (let round = 1; round < initialRounds.length; round++) {
    for (let i = 0; i < gameCounts[round-1]; i++) {
      initialRounds[round].games.push({
        id: `${initialRounds[round].name}-${i}`.toLowerCase().replace(' ', '-'),
        team1: null,
        team2: null,
        winner: null
      });
    }
  }
  
  const { subscribe, update } = writable({
    rounds: initialRounds,
    allTeams: teams,
    isGenerating: false,
    currentRound: 0,
    currentGame: 0
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
        return { ...state, isGenerating: true, currentRound: 0, currentGame: 0 };
      });
    },
    
    advanceGeneration: () => {
      update(state => {
        if (!state.isGenerating) return state;
        
        let newState = { ...state };
        const currentRound = state.currentRound;
        const currentGame = state.currentGame;
        
        // Check if we've already completed the bracket
        if (currentRound >= state.rounds.length - 1 && 
            currentGame >= state.rounds[currentRound].games.length) {
          return { ...state, isGenerating: false };
        }
        
        // Process the current game
        if (currentRound === 0) {
          // First round games already have teams assigned, just determine winner
          const game = state.rounds[currentRound].games[currentGame];
          newState.rounds[currentRound].games[currentGame] = {
            ...game, 
            winner: getWinner(game)
          };
        } else {
          // For later rounds, we need to get teams from previous round winners
          const prevRound = state.rounds[currentRound - 1];
          const gameIndex = currentGame * 2;
          
          if (gameIndex + 1 < prevRound.games.length) {
            const team1 = prevRound.games[gameIndex].winner;
            const team2 = prevRound.games[gameIndex + 1].winner;
            
            if (team1 && team2) {
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
        
        // Advance to next game or round
        if (currentGame < state.rounds[currentRound].games.length - 1) {
          newState.currentGame = currentGame + 1;
        } else if (currentRound < state.rounds.length - 1) {
          newState.currentRound = currentRound + 1;
          newState.currentGame = 0;
        } else {
          newState.isGenerating = false; // Done generating
        }
        
        return newState;
      });
    },
    
    resetBracket: () => {
      update(state => {
        // Reset all rounds except first round
        const resetRounds = state.rounds.map((round, index) => {
          if (index === 0) {
            return {
            ...round,
            games: round.games.map(game => ({
              ...game,
              team1: game.team1,
              team2: game.team2,
              winner: null
            }))
          }; // Keep first round unchanged
          }
          
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
          currentGame: 0
        };
      });
    }
  };
};

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