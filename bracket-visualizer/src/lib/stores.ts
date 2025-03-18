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
    { name: 'Final Four', games: [], position: 'center' },
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
    {
      id: 'final-four-1',
      team1: null,
      team2: null,
      winner: null
    }
  ];
  
  // Championship (1 game)
  initialRounds[9].games = [
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
            currentGame >= state.rounds[currentRound].games.length - 1) {
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
          } else if (round.position === 'center') {
            if (round.name === 'Final Four') {
              // Final Four gets winners from Elite Eight rounds
              const leftEliteEight = state.rounds.find(r => r.name === 'Elite Eight (Left)');
              const rightEliteEight = state.rounds.find(r => r.name === 'Elite Eight (Right)');
              
              if (leftEliteEight && rightEliteEight) {
                if (currentGame === 0 && leftEliteEight.games[0].winner) {
                  // First game in Final Four
                  const team1 = leftEliteEight.games[0].winner;
                  const team2 = leftEliteEight.games[1]?.winner || null;
                  
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
                } else if (currentGame === 1 && rightEliteEight.games[0].winner) {
                  // Second game in Final Four
                  const team1 = rightEliteEight.games[0].winner;
                  const team2 = rightEliteEight.games[1]?.winner || null;
                  
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
            } else if (round.name === 'Championship') {
              // Championship gets winners from Final Four
              const finalFour = state.rounds.find(r => r.name === 'Final Four');
              
              if (finalFour && finalFour.games[0].winner && finalFour.games[1].winner) {
                const team1 = finalFour.games[0].winner;
                const team2 = finalFour.games[1].winner;
                
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
          currentGame: 0
        };
      });
    }
  };
};

function getPreviousRoundName(roundName: string): string {
  if (roundName.includes('Second Round')) return 'First Round';
  if (roundName.includes('Sweet 16')) return 'Second Round';
  if (roundName.includes('Elite Eight')) return 'Sweet 16';
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