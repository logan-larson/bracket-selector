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
  nextGameIndex?: number; // Index of the game this feeds into in the next round
  nextIsTeam1?: boolean; // Whether this winner becomes team1 in the next game
}

export interface Round {
  name: string;
  games: Game[];
  position: 'left' | 'right' | 'center';
}

// Local storage keys
const TEAM_DATA_KEY = 'bracket-visualizer-team-data';

const createBracketStore = () => {
  const regions = ["South", "West", "East", "Midwest"];
  const teams: Team[] = [];
  
  regions.forEach(region => {
    for (let i = 1; i <= 16; i++) {
      teams.push({ region, seed: i });
    }
  });
  
  // Load saved team data from localStorage if available
  try {
    const savedTeamData = localStorage.getItem(TEAM_DATA_KEY);
    if (savedTeamData) {
      const savedTeams = JSON.parse(savedTeamData);
      
      // Update teams with saved data
      savedTeams.forEach((savedTeam: Team) => {
        const matchingTeam = teams.find(t => 
          t.region === savedTeam.region && t.seed === savedTeam.seed
        );
        
        if (matchingTeam) {
          matchingTeam.name = savedTeam.name;
          matchingTeam.image = savedTeam.image;
        }
      });
    }
  } catch (error) {
    console.error('Error loading team data from localStorage:', error);
  }
  
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

  // Find the index of the round
  const getNextRoundIndex = (currentRoundIndex: number, position: 'left' | 'right' | 'center'): number => {
    for (let i = currentRoundIndex + 1; i < initialRounds.length; i++) {
      if (initialRounds[i].position === position) return i;
    }
    // If no matching position is found, check for center position (championship)
    if (position !== 'center') {
      for (let i = currentRoundIndex + 1; i < initialRounds.length; i++) {
        if (initialRounds[i].position === 'center') return i;
      }
    }
    return -1;
  };
  
  // Set up first round games - left side (first two regions)
  const leftRegions = [teams.filter(t => t.region === regions[0]), teams.filter(t => t.region === regions[1])];
  let gameId = 0;
  
  leftRegions.forEach((regionTeams, regionIdx) => {
    for (let i = 0; i < 8; i++) {
      const team1 = regionTeams[i];
      const team2 = regionTeams[15 - i];
      
      // Calculate which game in the next round this feeds into
      const nextGameIndex = Math.floor(i / 2);
      const nextIsTeam1 = i % 2 === 0;
      
      initialRounds[0].games.push({
        id: `first-left-${gameId}`,
        team1,
        team2,
        winner: null,
        nextGameIndex,
        nextIsTeam1
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
      
      // Calculate which game in the next round this feeds into
      const nextGameIndex = Math.floor(i / 2);
      const nextIsTeam1 = i % 2 === 0;
      
      initialRounds[1].games.push({
        id: `first-right-${gameId}`,
        team1,
        team2,
        winner: null,
        nextGameIndex,
        nextIsTeam1
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
  // Left side (Second Round, Sweet 16, Elite Eight, Final Four)
  // Each round should have half as many games as the previous round
  initialRounds[2].games = createGames('second-round-left', 8);
  initialRounds[4].games = createGames('sweet-16-left', 4);
  initialRounds[6].games = createGames('elite-eight-left', 2);
  initialRounds[8].games = createGames('final-four-left', 1);
  
  // Right side (Second Round, Sweet 16, Elite Eight, Final Four)
  initialRounds[3].games = createGames('second-round-right', 8);
  initialRounds[5].games = createGames('sweet-16-right', 4);
  initialRounds[7].games = createGames('elite-eight-right', 2);
  initialRounds[9].games = createGames('final-four-right', 1);
  
  // Championship (1 game)
  initialRounds[10].games = [
    {
      id: 'championship',
      team1: null,
      team2: null,
      winner: null
    }
  ];
  
  // Helper function to create games with the correct count
  function createGames(idPrefix: string, count: number): Game[] {
    const games: Game[] = [];
    for (let i = 0; i < count; i++) {
      games.push({
        id: `${idPrefix}-${i}`,
        team1: null,
        team2: null,
        winner: null
      });
    }
    return games;
  }
  
  // Set up advancement paths from first round to second round
  initialRounds[0].games.forEach((game, gameIndex) => {
    game.nextGameIndex = Math.floor(gameIndex / 2);
    game.nextIsTeam1 = gameIndex % 2 === 0;
  });
  
  initialRounds[1].games.forEach((game, gameIndex) => {
    game.nextGameIndex = Math.floor(gameIndex / 2);
    game.nextIsTeam1 = gameIndex % 2 === 0;
  });
  
  // Set up advancement paths for all other rounds
  for (let roundIndex = 2; roundIndex < initialRounds.length - 1; roundIndex++) {
    const round = initialRounds[roundIndex];
    const nextRoundIndex = getNextRoundIndex(roundIndex, round.position);
    
    if (nextRoundIndex !== -1) {
      round.games.forEach((game, gameIndex) => {
        // Calculate which game in the next round this feeds into
        let nextGameIndex = Math.floor(gameIndex / 2);
        
        // For Final Four, both left and right sides feed into championship
        if ((round.name === 'Final Four (Left)' || round.name === 'Final Four (Right)') && 
            initialRounds[nextRoundIndex].name === 'Championship') {
          nextGameIndex = 0; // Championship only has one game
        }
        
        // Determine if this will be team1 or team2 in the next game
        // Fixed logic: Left side always goes to team1, right side to team2 for championship
        let nextIsTeam1: boolean;
        
        if (round.name === 'Final Four (Left)') {
          nextIsTeam1 = true; // Always team1 for left side going to championship
        } else if (round.name === 'Final Four (Right)') {
          nextIsTeam1 = false; // Always team2 for right side going to championship
        } else {
          nextIsTeam1 = gameIndex % 2 === 0; // Standard alternating for other rounds
        }
        
        game.nextGameIndex = nextGameIndex;
        game.nextIsTeam1 = nextIsTeam1;
      });
    }
  }
  
  const { subscribe, update } = writable({
    rounds: initialRounds,
    allTeams: teams,
    isGenerating: false,
    currentRound: 0,
    currentGame: 0,
    pendingGames: [] as { roundIndex: number, gameIndex: number }[],
    activeGameInfo: { roundIndex: -1, gameIndex: -1 }
  });
  
  // Find all games that have both teams assigned but no winner yet
  const findPlayableGames = (rounds: Round[]): { roundIndex: number, gameIndex: number }[] => {
    const playableGames: { roundIndex: number, gameIndex: number }[] = [];
    
    rounds.forEach((round, roundIndex) => {
      round.games.forEach((game, gameIndex) => {
        if (game.team1 && game.team2 && !game.winner) {
          playableGames.push({ roundIndex, gameIndex });
        }
      });
    });
    
    return playableGames;
  };

  // Helper function to save teams to localStorage
  const saveTeamsToLocalStorage = (teams: Team[]) => {
    try {
      // Only save teams that have custom data (name or image)
      const teamsToSave = teams.filter(team => team.name || team.image);
      localStorage.setItem(TEAM_DATA_KEY, JSON.stringify(teamsToSave));
    } catch (error) {
      console.error('Error saving team data to localStorage:', error);
    }
  };
  
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

        // Save to localStorage
        saveTeamsToLocalStorage(updatedTeams);
        
        return { ...state, allTeams: updatedTeams, rounds: updatedRounds };
      });
    },
    
    generateBracket: () => {
      update(state => {
        // Find all the playable games in the first round (which should be all games)
        const firstRoundGames = [
          ...state.rounds[0].games.map((_, i) => ({ roundIndex: 0, gameIndex: i })),
          ...state.rounds[1].games.map((_, i) => ({ roundIndex: 1, gameIndex: i }))
        ];
        
        // Shuffle the order of games
        shuffleArray(firstRoundGames);
        
        // Pick the first game to play
        const activeGame = firstRoundGames.pop() || { roundIndex: 0, gameIndex: 0 };
        
        return { 
          ...state, 
          isGenerating: true,
          pendingGames: firstRoundGames,
          activeGameInfo: activeGame,
          currentRound: activeGame.roundIndex,
          currentGame: activeGame.gameIndex
        };
      });
    },
    
    advanceGeneration: () => {
      update(state => {
        if (!state.isGenerating) return state;
        
        let newState = { ...state };
        const { roundIndex, gameIndex } = state.activeGameInfo;
        
        // Check if the current round exists
        if (roundIndex < 0 || roundIndex >= state.rounds.length) {
          return { ...state, isGenerating: false };
        }
        
        const currentRound = state.rounds[roundIndex];
        const currentGame = currentRound.games[gameIndex];
        
        if (!currentGame) {
          return { ...state, isGenerating: false };
        }
        
        // Determine winner for this game
        if (currentGame.team1 && currentGame.team2 && !currentGame.winner) {
          const winner = getWinner(currentGame);
          
          // Update the winner
          newState.rounds[roundIndex].games[gameIndex] = {
            ...currentGame,
            winner
          };
          
          // Find the next round and advance the winner
          if (typeof currentGame.nextGameIndex === 'number' && roundIndex < state.rounds.length - 1) {
            // Find the next round with the same position
            let nextRoundIndex = -1;
            
            if (currentRound.name === 'Final Four (Left)' || currentRound.name === 'Final Four (Right)') {
              // Final Four feeds into Championship
              nextRoundIndex = state.rounds.findIndex(r => r.name === 'Championship');
            } else {
              for (let i = roundIndex + 1; i < state.rounds.length; i++) {
                if (state.rounds[i].position === currentRound.position) {
                  nextRoundIndex = i;
                  break;
                }
              }
            }
            
            if (nextRoundIndex !== -1 && winner) {
              const nextRound = state.rounds[nextRoundIndex];
              const nextGameIndex = currentGame.nextGameIndex;
              
              if (nextGameIndex < nextRound.games.length) {
                const nextGame = nextRound.games[nextGameIndex];
                
                // Place winner in the correct position (team1 or team2)
                if (currentGame.nextIsTeam1) {
                  newState.rounds[nextRoundIndex].games[nextGameIndex] = {
                    ...nextGame,
                    team1: winner
                  };
                } else {
                  newState.rounds[nextRoundIndex].games[nextGameIndex] = {
                    ...nextGame,
                    team2: winner
                  };
                }
                
                // Debug log for championship game
                if (nextRound.name === 'Championship') {
                  console.log(`Added ${winner.region} ${winner.seed} to ${currentGame.nextIsTeam1 ? 'team1' : 'team2'} in Championship`);
                }
              }
            }
          }
        }
        
        // Find the next playable game
        if (state.pendingGames.length > 0) {
          // Take the next game from the pending list
          const nextGame = state.pendingGames.pop() || { roundIndex: 0, gameIndex: 0 };
          newState.activeGameInfo = nextGame;
          newState.currentRound = nextGame.roundIndex;
          newState.currentGame = nextGame.gameIndex;
        } else {
          // Find any new games that are now playable (have both teams assigned)
          const playableGames = findPlayableGames(newState.rounds);
          
          if (playableGames.length > 0) {
            // Shuffle the new playable games
            shuffleArray(playableGames);
            
            // Pop the first one to be the active game
            const nextGame = playableGames.pop() || { roundIndex: 0, gameIndex: 0 };
            
            newState.pendingGames = playableGames;
            newState.activeGameInfo = nextGame;
            newState.currentRound = nextGame.roundIndex;
            newState.currentGame = nextGame.gameIndex;
          } else {
            // No more games to play - we're done!
            newState.isGenerating = false;
            newState.activeGameInfo = { roundIndex: -1, gameIndex: -1 };
          }
        }
        
        return newState;
      });
    },
    
    resetBracket: () => {
      update(state => {
        // Reset all rounds
        const resetRounds = state.rounds.map((round, index) => {
          if (index <= 1) return {
            ...round,
            games: round.games.map(game => ({
              ...game,
              winner: null
            }))
          }; // Keep first rounds unchanged except for winners
          
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
          pendingGames: [],
          activeGameInfo: { roundIndex: -1, gameIndex: -1 }
        };
      });
    }
  };
};

// Fisher-Yates shuffle algorithm to randomize game order
function shuffleArray<T>(array: T[]): void {
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