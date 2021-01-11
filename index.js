let teamListString = ""
let teamList = []
let teamListResult = []
let numberOfRounds = 0

document.getElementById("team-list").addEventListener("change", (event) => {
  teamListString = event.target.value
})

document.getElementById("team-list-form").addEventListener("submit", (event) => {
  event.preventDefault()

  createGlobalTeamList()

  if(teamList.length > 1) {
    const rounds = createRounds(teamList)
    numberOfRounds = rounds.length
    const roundsWithResult = generateRandomResult(rounds)
    console.log(roundsWithResult)
  }
})

function createGlobalTeamList() {
  teamList = teamListString.split("\n").map((teamAndState, index) => {
    let [teamName, state] = teamAndState.split(";")
    return {
      teamName,
      state,
      teamIndex: index
    }
  })

  teamListResult = teamList.map(team => {
    return {
      teamName: team.teamName,
      score: 0,
      wins: 0,
      loses: 0,
      draws: 0,
      totalGoals: 0
    }
  })
}

function createRounds(teams) {
  if (teams.length % 2 == 1) {
    teams.push(null);
  }

  const teamsCount = teams.length;
  const numOfOneWayRounds = teamsCount - 1;
  const half = teamsCount / 2;

  const tournamentPairings = [];

  const playerIndexes = teams.map((_, i) => i).slice(1);

  // this will create one-way matches
  for (let round = 0; round < numOfOneWayRounds; round++) {
    const roundPairings = [];

    const newPlayerIndexes = [0].concat(playerIndexes);

    /* this will create a index (column) relation between the teams 
      [0, 1, 2, 3]
       |  |  |  |
      [7, 6, 5, 4]
    */
    const firstHalf = newPlayerIndexes.slice(0, half);
    const secondHalf = newPlayerIndexes.slice(half, teamsCount).reverse();

    for (let i = 0; i < firstHalf.length; i++) {
      roundPairings.push({
        homeTeam: teams[firstHalf[i]],
        awayTeam: teams[secondHalf[i]],
        place: teams[firstHalf[i]].state,
      });
    }

    // rotating the array
    playerIndexes.push(playerIndexes.shift());

    tournamentPairings.push(roundPairings);
  }

  // invert mandant to create two-way matches
  for (let round = 0; round < numOfOneWayRounds; round++) {
    const newReverseRounds = tournamentPairings[round].map(match => {
      return {
        homeTeam: match.awayTeam,
        awayTeam: match.homeTeam,
        place: match.awayTeam.state
      }
    })
    tournamentPairings.push(newReverseRounds)
  }

  return tournamentPairings
}

function generateRandomResult(rounds) {
  const newRounds = rounds.map(round => round)

  // generates numbers from 0 to 5
  function randomGoal() {
    return Math.floor(Math.random() * 6)
  }

  function incrementInGlobalResult(index, goals, situation) {
    switch (situation) {
      case "win":
        teamListResult[index].score += 3
        teamListResult[index].totalGoals += goals
        teamListResult[index].wins += 1
        break;
      case "lose":
        teamListResult[index].totalGoals += goals
        teamListResult[index].loses += 1
        break;
      case "draw":
        teamListResult[index].score += 1
        teamListResult[index].totalGoals += goals
        teamListResult[index].draws += 1
        break;
      default:
        break;
    }
  }

  return newRounds.map(round => {
    return round.map(match => {
      // I did this because the object reference in javascript would change the 
      // "match" object and the entire array
      const matchResult = JSON.parse(JSON.stringify(match))

      matchResult.homeTeam.goals = randomGoal()
      matchResult.awayTeam.goals = randomGoal()

      if (matchResult.homeTeam.goals > matchResult.awayTeam.goals) {
        matchResult.homeTeam.win = true
        matchResult.awayTeam.win = false

        incrementInGlobalResult(matchResult.homeTeam.teamIndex, matchResult.homeTeam.goals, "win")
        incrementInGlobalResult(matchResult.awayTeam.teamIndex, matchResult.awayTeam.goals, "lose")

      } else if (matchResult.awayTeam.goals > matchResult.homeTeam.goals) {
        matchResult.awayTeam.win = true
        matchResult.homeTeam.win = false

        incrementInGlobalResult(matchResult.homeTeam.teamIndex, matchResult.homeTeam.goals, "lose")
        incrementInGlobalResult(matchResult.awayTeam.teamIndex, matchResult.awayTeam.goals, "win")

      } else {
        matchResult.draw = true

        incrementInGlobalResult(matchResult.homeTeam.teamIndex, matchResult.homeTeam.goals, "draw")
        incrementInGlobalResult(matchResult.awayTeam.teamIndex, matchResult.awayTeam.goals, "draw")
      }

      return matchResult
    })
  })
}