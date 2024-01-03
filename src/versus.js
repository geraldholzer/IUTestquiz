//Elemente aus dem DOM holen
let questioncounter = 0
let pointscounter = 0
let AnswerButton1 = document.getElementById('Answer1')
let AnswerButton2 = document.getElementById('Answer2')
let AnswerButton3 = document.getElementById('Answer3')
let AnswerButton4 = document.getElementById('Answer4')
let NextButton = document.getElementById('Next')
let Question = document.getElementById('question')
let StartButton = document.getElementById('Start')
let answercontainer = document.getElementById('answercontainer')
let resultpage = document.getElementById('result')
let resuttext = document.getElementById('resulttext')
let explanation=document.getElementById("explanation")
let explanationcontainer=document.getElementById("explanationcontainer")



//Seite für das erstellen oder beitreten zu einem spiel anzeigen
joinbutton.addEventListener('click', joingamepage)
//Ausblenden des Spielbeitreten buttons einblenden der Seite mit den Spielen loadGames wird aufgerufen zum laden aus der DB
function joingamepage() {
    joingamebutton.disabled=true;
    joingamecontainer.classList.remove('d-none')
    joinbutton.classList.add('d-none')
    loadGames()
}
//Funktion zum laden der offenen Spiele  aus der Datenbank
function loadGames() {
    //leeren der gamelist
    while (gamelist.firstChild) {
        gamelist.removeChild(gamelist.lastChild)
    }
    //Mit fetch API wird aus game-server.php die gamelist geholt
    fetch('game-server.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        //diese action wird im server abgefragt
        body: 'action=getGameList',
    }) //empfangene Daten in gamesarray speichern
        .then((response) => response.json())
        .then((data) => {
            gamesarray = data
            //Für jedes game im gamesarray wird ein button erstellt
            gamesarray.forEach((game) => {
                let button = document.createElement('button')
                button.classList.add('list-group-item') //bootstrap klasse
                button.classList.add('list-group-item-action') //bootstrap klasse
                button.innerHTML = game.name
                // bei click auf den Button wird das gewählte spiel in die room variable gespeichert
                //das wird gebraucht um die spieler zum richtigen Raum/Spiel zuzuweisen
                button.addEventListener('click', roomselect)
                //anhängen der buttons an die gamelist
                document.getElementById('gamelist').appendChild(button)
            })
        })

        .catch((error) => {
            console.error('Error:', error)
        })
}

//neues spiel erstellen
newgamebutton.addEventListener('click', addnewgame)

//Hier wird wieder die fetch API genutzt 
function addnewgame() {
    let game = gamenameInput.value
    //Dieser String wird übergeben action und gamename werden im Server abgefragt anschließend wird mit loadGames die liste neu geladen
    ;(actionstring = 'action=addGame&gamename=' + game),
    fetch('game-server.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: actionstring,
    }).then(loadGames)
}
//Funktioniert ähnlich wie die addnewgame Funktion nur das hier deletegame übergeben wird
function deletegame() {
    let game=room;//aktuell ausgewähltes Spiel verwenden
    actionstring = 'action=deleteGame&gamename=' + game
    fetch('game-server.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: actionstring,
    }).then(loadGames)
}
//Einlesen welches Spiel aus der Liste gewählt wurde Room weil die Sitzung als Websocket raum ausgeführt ist
function roomselect(e) {
    let selectedgame = e.target
    room = selectedgame.innerHTML
    joingamebutton.disabled=false;
}


    joingamebutton.addEventListener('click', joingame)

//Mit dieser function wird der benutzer zum entsprechenden raum hinzugefügt mit subsribeToRoom und Warteseite eingeblendet
function joingame() {

    subscribeToRoom(room)
    joingamecontainer.classList.add('d-none')
    joinbutton.classList.add('d-none')
    waitforopponent.classList.remove('d-none')
}
function subscribeToRoom(room) {
    // Subscribe to the room
    const subscribeMessage = JSON.stringify({ type: 'subscribe', room })
    socket.send(subscribeMessage)
}
const socket = new WebSocket('ws://127.0.0.1:8081')
socket.onmessage = (event) => {
    message = event.data

    

//Buttons in Array verwalten
const Answerbuttons = [
    AnswerButton1,
    AnswerButton2,
    AnswerButton3,
    AnswerButton4,
]

//Array mit den Fragen jede Frage hat ein Array mit Antworten mit attribut correct für die richtige Antwort
// Wird mit fetch von PHP geholt
function laden(){
    fetch("question-server.php")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json(); // JSON-Daten aus der Antwort extrahieren
    })
    .then(data => {
        //Array daten zuweisen
      questions=data;

    }).then(zuweisen)
    .catch(error => {
        console.error('Fehler beim Abrufen der Daten:', error);
    });
}

//Eventlistener für next button
NextButton.addEventListener('click', next)
//Eventlistener für Startbutton
StartButton.addEventListener('click', startquiz)

//Hier wird zuerst die laden funktion aufgerufen und anschließend die entsprechenden buttons ein/aus geblendet
function startquiz() {
    laden();
    StartButton.classList.add('d-none')
    Question.classList.remove('d-none')
    answercontainer.classList.remove('d-none')
    
}
// bei drücken des Next buttons wird die funktion zuweisen aufgerufen auser die fragen sind fertig dan finish
function next() {
    if (questioncounter >= questions.length) {
        finish()
    } else {
        zuweisen()
    }
}

// Funktion zum mixen der Antworten 
function shuffleFisherYates(array) {
    let i = array.length
    while (i--) {
        const ri = Math.floor(Math.random() * i)
        ;[array[i], array[ri]] = [array[ri], array[i]]
    }
    return array
}

//Funktion zum Zuweisen der Fragen und Antworten zu den  Buttons
function zuweisen() {
    //aufruf mix funktion
    mixedanswers = shuffleFisherYates(questions[questioncounter].answers)
    
    for (let i = 0; i < 4; i++) {
        explanation.innerHTML= questions[questioncounter].explanation;
        Question.innerHTML = questions[questioncounter].questiontext
        Answerbuttons[i].innerHTML = mixedanswers[i].answer
        Answerbuttons[i].dataset.correct = mixedanswers[i].correct
        //Event listener für auswahl
        Answerbuttons[i].addEventListener('click', antworten)
    }

    questioncounter++
    reset()
}
//Funktion zum zurücksetzen der class Attributte für richtige und falsche Antworten und freigeben der Buttons
function reset() {
    explanationcontainer.classList.add("d-none");
    Answerbuttons.forEach((button) => {
        button.classList.add('btn-outline-primary')
        button.classList.remove('btn-danger')
        button.classList.remove('btn-success')
    })
    Answerbuttons.forEach((button) => {
        button.disabled = false
    }),
    (NextButton.disabled = true)
}

// Ausblenden des answercontainers und einblenden des Ergebnistexts
function finish() {
    explanationcontainer.classList.add("d-none");
    StartButton.classList.add('d-none')
    Question.classList.add('d-none')
    answercontainer.classList.add('d-none')
    answercontainer.classList.add('d-none')
    resultpage.classList.remove('d-none')
    resuttext.innerHTML =
    'Du hast ' +
    pointscounter +
    ' von ' +
    questioncounter +
    ' Fragen richtig beantwortet'
    questioncounter = 0
}

// Funktion wird bei Antwortauswahl ausgeführt
function antworten(e) {
    //welcher button wurde gedrückt
    const selectedbutton = e.target
    let correctchoice = selectedbutton.dataset.correct
    explanationcontainer.classList.remove("d-none");
    
    if (correctchoice === 'true') {
        selectedbutton.classList.remove('btn-outline-primary')
        selectedbutton.classList.add('btn-success')
        
        Answerbuttons.forEach((button) => {
            button.disabled = true
        }),
            //NextButton aktivieren
            (NextButton.disabled = false)
            pointscounter++
        } else if (correctchoice === 'false') {
            selectedbutton.classList.remove('btn-outline-primary')
        selectedbutton.classList.add('btn-danger')
        Answerbuttons.forEach((button) => {
            button.disabled = true
        }),
        (NextButton.disabled = false)
    }
}
//############ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#ALT#AL
// default questions
// let questions = [
//     {
//         explanation:"a",
//         questiontext: 'Was ist 3-2',
//         answers: [
//             { answer: 'eins', correct: true },
//             { answer: 'zwei', correct: false },
//             { answer: 'drei', correct: false },
//             { answer: 'vier', correct: false },
//         ],
//     },
//     {
//         questiontext: 'Was ist 1+1',
//         explanation:"a",
//         answers: [
//             { answer: 'zwei', correct: true },
//             { answer: 'eins', correct: false },
//             { answer: 'drei', correct: false },
//             { answer: 'vier', correct: false },
//         ],
//     },
//     {
//         questiontext: 'Was ist 6/2',
//         explanation:"a",
//         answers: [
//             { answer: 'drei', correct: true },
//             { answer: 'zwei', correct: false },
//             { answer: 'eins', correct: false },
//             { answer: 'vier', correct: false },
//         ],
//     },
// ]

//default questions