

let regions = ["S", "W", "E", "MW"];
let teams = [];

regions.forEach(region => {
    for (i = 1; i <= 16; i++) {
        teams.push({ region: region, seed: i });
    }
});

// console.log("Teams: ", teams);

let firstRound = [];
let secondRound = [];
let sweet16 = [];
let eliteEight = [];
let finalFour = [];
let championship = [];

for (i = 0; i < 32; i++) {
    let offset = 0;
    if (i < 8) {
        offset = 0;
    } else if (i < 16) {
        offset = 1;
    } else if (i < 24) {
        offset = 2;
    } else {
        offset = 3;
    }

    let team1Index = i + (offset * 8);
    let team2Index = (15 + (offset * 16)) - (i - (offset * 8));
    let game = { team1: teams[team1Index], team2: teams[team2Index], winner: null };
    let winner = getWinner(game);
    game.winner = winner;
    firstRound.push(game);
}

// /*
for (offset = 0; offset < 4; offset++) {
    let o = offset * 8;
    swap(firstRound, 1 + o, 7 + o);
    swap(firstRound, 2 + o, 5 + o);
    swap(firstRound, 4 + o, 2 + o);
}
// */
// swap(firstRound, 1, 7);
// swap(firstRound, 2, 5);
// swap(firstRound, 4, 2);

for (i = 0; i < 32; i+=2) {
    let game = { team1: firstRound[i].winner, team2: firstRound[i+1].winner, winner: null };
    game.winner = getWinner(game);
    secondRound.push(game);
}

for (i = 0; i < 16; i+=2) {
    let game = { team1: secondRound[i].winner, team2: secondRound[i+1].winner, winner: null };
    game.winner = getWinner(game);
    sweet16.push(game);
}

for (i = 0; i < 8; i+=2) {
    let game = { team1: sweet16[i].winner, team2: sweet16[i+1].winner, winner: null };
    game.winner = getWinner(game);
    eliteEight.push(game);
}

for (i = 0; i < 4; i+=2) {
    let game = { team1: eliteEight[i].winner, team2: eliteEight[i+1].winner, winner: null };
    game.winner = getWinner(game);
    finalFour.push(game);
}

let championshipGame = { team1: finalFour[0].winner, team2: finalFour[1].winner, winner: null };
championshipGame.winner = getWinner(championshipGame);
championship.push(championshipGame);

console.log("First Round: ", firstRound);
console.log("Second Round: ", secondRound);
console.log("Sweet 16: ", sweet16);
console.log("Elite Eight: ", eliteEight);
console.log("Final Four: ", finalFour);
console.log("Championship: ", championship);

function getWinner(game) {
    let percentage = game.team1.seed / (game.team1.seed + game.team2.seed);
    let rand = Math.random();

    // console.log(`percentage: ${percentage}, rand: ${rand}`);

    return rand < percentage ? game.team2 : game.team1;
}

function swap(teams, index1, index2) {
    let temp = copy(teams[index1]);
    teams[index1] = copy(teams[index2]);
    teams[index2] = temp;
}

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}