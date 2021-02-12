let teamListString = ""
let teamList = []
let teamListResult = []
let numberOfRounds = 0
let roundShown = 1

document.getElementById("team-list").addEventListener("change", (event) => {
  teamListString = event.target.value
})

const copyTextareaBtn = document.getElementById("copy-example-button");

copyTextareaBtn.addEventListener('click', () => {
  const copyTextarea = document.getElementById("team-list-example");
  copyTextarea.select();
  document.execCommand('copy');
});

const restartButton = document.getElementById("restart")
restartButton.addEventListener("click", () => {
  location.reload()
})

document.getElementById("team-list-form").addEventListener("submit", (event) => {
  event.preventDefault()

  createGlobalTeamList()

  if (teamList.length > 1) {
    const rounds = createRounds(teamList)
    numberOfRounds = rounds.length
    const roundsWithResult = generateRandomResult(rounds)
    generateRoundsHtml(roundsWithResult)
    generateLeaderBoard(sortTeamsByPlacement())

    event.target.style.display = "none"
    document.getElementById("rounds").style.display = "block"
    document.getElementById("leaderBoard").style.display = "block"
    restartButton.style.display = "block"
  }
})

const previousRoundButton = document.getElementById("previousRound")
previousRoundButton.addEventListener("click", () => changeRoundShown("prev"))
const nextRoundButton = document.getElementById("nextRound")
nextRoundButton.addEventListener("click", () => changeRoundShown("next"))



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

      if((teams[firstHalf[i]] === null) || (teams[secondHalf[i]] === null)) {
        continue;
      }
      
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

  // this will check if exists another game in the same place
  const roundsChecked = tournamentPairings.map(round => {
    return round.map((match, index) => {
      const indexOfOtherMatch = round
        .map(otherMatch => otherMatch.place)
        .indexOf(match.place)

      if (indexOfOtherMatch !== -1 && indexOfOtherMatch !== index) {
        match.doubleRound = true
        round[indexOfOtherMatch].doubleRound = true
      }
      else {
        match.doubleRound = false
      }
      return match
    })
  })

  return roundsChecked
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
        incrementInGlobalResult(matchResult.homeTeam.teamIndex, matchResult.homeTeam.goals, "win")
        incrementInGlobalResult(matchResult.awayTeam.teamIndex, matchResult.awayTeam.goals, "lose")

      } else if (matchResult.awayTeam.goals > matchResult.homeTeam.goals) {
        incrementInGlobalResult(matchResult.homeTeam.teamIndex, matchResult.homeTeam.goals, "lose")
        incrementInGlobalResult(matchResult.awayTeam.teamIndex, matchResult.awayTeam.goals, "win")

      } else {
        incrementInGlobalResult(matchResult.homeTeam.teamIndex, matchResult.homeTeam.goals, "draw")
        incrementInGlobalResult(matchResult.awayTeam.teamIndex, matchResult.awayTeam.goals, "draw")
      }

      return matchResult
    })
  })
}

function generateRoundsHtml(rounds) {
  const roundsListHtml = document.getElementById("roundContent")

  const roundHtml = rounds.map((round, roundIndex) => {
    const roundLi = document.createElement("li")
    roundLi.dataset.round = roundIndex + 1

    const matchesHtml = round.map((match, matchIndex) => {
      const matchDiv = document.createElement("div")
      matchDiv.className = "match"

      const place = document.createElement("div")
      place.className = "place"
      place.innerHTML = match.place


      if (match.doubleRound) {
        const doubleRound = document.createElement("span")
        doubleRound.innerHTML = " (Rodada dupla)"
        place.appendChild(doubleRound)
      }


      const matchResult = document.createElement("div")
      matchResult.className = "match-result"

      const homeTeam = document.createElement("div")
      homeTeam.classList = "home-team"
      const homeTeamName = document.createElement("span")
      homeTeamName.innerHTML = match.homeTeam.teamName
      const homeTeamGoals = document.createElement("strong")
      homeTeamGoals.innerHTML = match.homeTeam.goals
      homeTeam.append(homeTeamName, homeTeamGoals)

      const versus = document.createElement("i")
      versus.classList = "versus fa fa-times"

      const awayTeam = document.createElement("div")
      awayTeam.className = "away-team"
      const awayTeamName = document.createElement("span")
      awayTeamName.innerHTML = match.awayTeam.teamName
      const awayTeamGoals = document.createElement("strong")
      awayTeamGoals.innerHTML = match.awayTeam.goals
      awayTeam.append(awayTeamName, awayTeamGoals)

      matchResult.append(homeTeam, versus, awayTeam)
      matchDiv.append(place, matchResult)

      return matchDiv
    })

    roundLi.append(...matchesHtml)
    return roundLi
  })

  roundsListHtml.append(...roundHtml)
}

function sortTeamsByPlacement() {
  return teamListResult.sort((a, b) => {
    if (a.score < b.score) return 1;
    else if (a.score > b.score) return -1;
    else if (a.totalGoals < b.totalGoals) return 1;
    else if (a.totalGoals > b.totalGoals) return -1;
    else return 0;
  })
}

function generateLeaderBoard(teamsPlacing) {

  const leaderBoardData = document.getElementById("leaderBoard").querySelector("tbody")
  const teamsRows = teamsPlacing.map((team, index) => {
    const teamRow = document.createElement("tr")

    const placing = document.createElement("td")
    placing.className = "placing"
    const placingNum = document.createElement("span")
    placingNum.innerHTML = `${index + 1}º`
    const teamNameHtml = document.createElement("span")
    teamNameHtml.innerHTML = team.teamName
    const trophySpan = document.createElement("span")

    function showTrophy(color) {
      const trophyIcon = document.createElement('i')
      trophyIcon.classList = "fa fa-trophy"
      trophyIcon.style.color = color
      trophySpan.appendChild(trophyIcon)
    }

    switch (index + 1) {
      case 1:
        showTrophy("#C9B037")
        break;
      case 2:
        showTrophy("#B4B4B4")
        break;
      case 3:
        showTrophy("#AD8A56")
        break;
      default:
        break;
    }
    placing.append(placingNum, teamNameHtml, trophySpan)

    const score = document.createElement("td")
    score.innerHTML = team.score
    const wins = document.createElement("td")
    wins.innerHTML = team.wins
    const loses = document.createElement("td")
    loses.innerHTML = team.loses
    const draws = document.createElement("td")
    draws.innerHTML = team.draws
    const totalGoals = document.createElement("td")
    totalGoals.innerHTML = team.totalGoals

    teamRow.append(placing, score, wins, loses, draws, totalGoals)

    return teamRow
  })
  leaderBoardData.append(...teamsRows)
}

function changeRoundShown(command) {

  if (command == "next" && roundShown < numberOfRounds) {
    roundShown++
  } else if (command == "prev" && roundShown > 1) {
    roundShown--
  } else {
    return;
  }

  previousRoundButton.style.display = roundShown > 1 ? "block" : "none"
  nextRoundButton.style.display = roundShown < numberOfRounds ? "block" : "none"

  document.getElementById("roundTitle").innerHTML = `Rodada ${roundShown}`

  // Get all elements with attribute data-round and hide them
  const roundsHtml = document.querySelectorAll("li[data-round]");
  for (let i = 0; i < roundsHtml.length; i++) {
    roundsHtml[i].style.display = "none";
  }

  // Show the current tab
  document.querySelector(`li[data-round="${roundShown}"]`).style.display = "block";
}