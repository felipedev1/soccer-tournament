let teamListString = ""
let teamList = []
let teamListResult = []

document.getElementById("team-list").addEventListener("change", (event) => {
  teamListString = event.target.value
})

document.getElementById("team-list-form").addEventListener("submit", (event) => {
  event.preventDefault()

  createGlobalTeamList()
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