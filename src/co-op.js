//Elemente aus dem DOM holen
let questioncounter = 0 //zähler für die aktuelle Frage
let pointscounter = 0 //Zähler für die erreichten Punkte
let AnswerButton1 = document.getElementById('Answer1') //Antwortbutton1
let AnswerButton2 = document.getElementById('Answer2') //Antwortbutton2
let AnswerButton3 = document.getElementById('Answer3') //Antwortbutton3
let AnswerButton4 = document.getElementById('Answer4') //Antwortbutton4
let NextButton = document.getElementById('Next') //Nextbutton
let Question = document.getElementById('question') //Frage text
let StartButton = document.getElementById('Start') //Startbutton
let answercontainer = document.getElementById('answercontainer') //COntainer (div) in dem sich die answerbuttons befinden
let resultpage = document.getElementById('result') //wird eingeblendet am schluss als ergebnis
let resuttext = document.getElementById('resulttext') // Zeigt am Schluss etwa ihr habt "3/3" Fragen richtig beantwortet
let explanation = document.getElementById('explanation') //Erklärungstext zu jeder Frage
let explanationcontainer = document.getElementById('explanationcontainer') //Container(div)in dem sich die Erklärung befindet
let chatcontainer = document.getElementById('chatcontainer') //Container (div) für den chat
let messageInput = document.getElementById('messageInput') //Inputfeld für die chatnachricht
let chat = document.getElementById('chat') //chat div hier wird der chat verlauf angezeigt
let sendbutton = document.getElementById('sendbutton') //button zum absenden einer Chatnachricht
let joinbutton = document.getElementById('Joingame') //Dient zum aufrufen der Seite mit den offenen Spielen
let joingamebutton = document.getElementById('joingamebutton') //Mit diesem Button kann man einem Spiel beitreten
let newgamebutton = document.getElementById('newgamebutton') //Mit diesem Button kann man ein neues Spiel erstellen
let joingamecontainer = document.getElementById('joingamecontainer') //Container der Seite mit offenen spielen
let gamelist = document.getElementById('gamelist') //Liste mit den offenen spielen
let waitforopponent = document.getElementById('wait') //Zeigt Warte auf Gegner
let room = '' // die Spielsitzungen werden als WebsocketRäume umgesetzt damit immer nur 2 Spieler gleichzeitig spielen können
let gamesarray = [] // Hier werden die offenen Spiele die aus der Datenbank geholt wurden gespeichert
let answered = false //Verhindert eine Endlosschleife bei den Answerbuttons
let ready = false // wird wahr wen sich der zweite Spieler dem spiel anschließt
let gamenameInput = document.getElementById('gamenameInput') //Eingabefeld für den Spielnamen
let gameserver="http://13.49.243.225/game-server.php" //gameserver ip von aws server
let questionserver= "http://13.49.243.225/question-server.php"//questionserver ip von aws server
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
    fetch(gameserver, {
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
    fetch(gameserver, {
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
    fetch(gameserver, {
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

//Buttons in Array verwalten so kann man foreach schleifen nutzen
const Answerbuttons = [
    AnswerButton1,
    AnswerButton2,
    AnswerButton3,
    AnswerButton4,
]

//Array mit den Fragen jede Frage hat ein Array mit Antworten mit attribut correct für die richtige Antwort
// Wird mit fetch von PHP geholt
function laden() {
    fetch(questionserver)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Network response was not ok: ${response.statusText}`
                )
            }
            return response.json() // JSON-Daten aus der Antwort extrahieren
        })
        .then((data) => {
            //Array daten zuweisen
            questions = data
        })
        .then(zuweisen)
        .catch((error) => {
            console.error('Fehler beim Abrufen der Daten:', error)
        })
}

//Eventlistener für next button
NextButton.addEventListener('click', next)
//Eventlistener für Startbutton
StartButton.addEventListener('click', startquiz)

//Hier wird zuerst die laden funktion aufgerufen und anschließend die entsprechenden buttons ein/aus geblendet
function startquiz() {
    laden()
    StartButton.classList.add('d-none')
    Question.classList.remove('d-none')
    answercontainer.classList.remove('d-none')
    chatcontainer.classList.remove('d-none')
}
// bei drücken des Next buttons wird die funktion zuweisen aufgerufen  oder die Fragen sind fertig -> finish
function next() {
    if (questioncounter >= questions.length) {
        finish()
    } else {
        zuweisen()
    }
}

// Funktion zum mixen der Antworten muss noch entschieden werden ob es im multiplayer eingesetzt werden kann
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
    //mixedanswers = shuffleFisherYates(questions[questioncounter].answers)
    mixedanswers = questions[questioncounter].answers
    for (let i = 0; i < 4; i++) {
        explanation.innerHTML = questions[questioncounter].explanation
        Question.innerHTML = questions[questioncounter].questiontext
        Answerbuttons[i].innerHTML = mixedanswers[i].answer
        Answerbuttons[i].dataset.correct = mixedanswers[i].correct
        //Event listener für auswahl
        Answerbuttons[i].addEventListener('click', antworten)
    }
    //inkrementieren des questioncounter 
    questioncounter++
    //reset um wieder alles richtig einzublenden und die richtigen buttons freizugeben
    reset()
}
//Funktion zum zurücksetzen der class Attributte für richtige und falsche Antworten und freigeben der Buttons
function reset() {
    answered = false
    buttonpressed = false
    explanationcontainer.classList.add('d-none')
    waitforopponent.classList.add('d-none')
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
    explanationcontainer.classList.add('d-none')
    StartButton.classList.add('d-none')
    Question.classList.add('d-none')
    answercontainer.classList.add('d-none')
    answercontainer.classList.add('d-none')
    resultpage.classList.remove('d-none')
    resuttext.innerHTML =
        'Ihr habt ' +
        pointscounter +
        ' von ' +
        questioncounter +
        ' Fragen richtig beantwortet'
    questioncounter = 0
}

// Funktion wird bei Antwortauswahl ausgeführt
function antworten(e) {
    //Dieses Ereignis wird an den Mitspieler geschickt und würde dadurch zu einer Endlosschleife führen darum abgesichert mit answered
    if (answered === false) {
        //welcher button wurde gedrückt
        const selectedbutton = e.target
        let correctchoice = selectedbutton.dataset.correct
        //Einblenden der Erklärung
        explanationcontainer.classList.remove('d-none')
        //Ausführen wen die Frage richtig ist
        if (correctchoice === 'true') {
            selectedbutton.classList.remove('btn-outline-primary')
            selectedbutton.classList.add('btn-success')
            //deaktivieren der Answerbuttons
            Answerbuttons.forEach((button) => {
                button.disabled = true
            }),
                //NextButton aktivieren
                (NextButton.disabled = false)
            pointscounter++
            //Ausführen falls Antwort falsch war
        } else if (correctchoice === 'false') {
            selectedbutton.classList.remove('btn-outline-primary')
            selectedbutton.classList.add('btn-danger')
            Answerbuttons.forEach((button) => {
                button.disabled = true
            }),
                (NextButton.disabled = false)
        }
        answered = true
    }
}
// Websocket für Multiplayer//////////////////////////////////////////////////////////////////////////////////
//Verbindung zu Websocketserver erstellen der PORT 8081 weil ich sonst einen Konflikt mit XAMPP hatte  ip adresse von aws
const socket = new WebSocket('ws://13.49.243.225:8081') 

socket.onopen = (event) => {
    console.log('WebSocket connection opened:', event)
}

//Rücksetzen button pressed sonst Endlosschleife
let buttonpressed = false
// Hier wird eine Nachricht vom Server ausgewertet
socket.onmessage = (event) => {
    message = event.data
    //Nextfunktion aufrufen wenn Mitspieler Next gedrückt hat
    if (event.data == 'nextbuttonclick') {
        next()
    } 
    //Sobald vom Mitspieler ein Answerbutton gedrückt wurde kommt die entsprechende Message
    //Hier wird dann mit dispatch event das click Event des eigenen Buttons simuliert 
    //So wird immer bei beiden Clients der Button gedrückt
    else if (event.data == 'Answerbutton1clicked') {
        if (!buttonpressed) {
            const clickEvent = new Event('click')
            buttonpressed = true
            Answerbuttons[0].dispatchEvent(clickEvent)
        }
    } else if (event.data == 'Answerbutton2clicked') {
        if (!buttonpressed) {
            const clickEvent = new Event('click')
            buttonpressed = true
            Answerbuttons[1].dispatchEvent(clickEvent)
        }
    } else if (event.data == 'Answerbutton3clicked') {
        if (!buttonpressed) {
            const clickEvent = new Event('click')
            buttonpressed = true
            Answerbuttons[2].dispatchEvent(clickEvent)
        }
    } else if (event.data == 'Answerbutton4clicked') {
        if (!buttonpressed) {
            const clickEvent = new Event('click')
            buttonpressed = true
            Answerbuttons[3].dispatchEvent(clickEvent)
        }
        //Wenn zwei Spieler verbunden sind wird das Spiel gestartet der Server sendet hierzu "ready"
    } else if (event.data == 'ready') {
        startquiz();
        deletegame();
    } else {
        chat.innerHTML += event.data + '</br>'
    }
}

socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event)
}
//Eventlistener für Chat Send button
sendbutton.addEventListener('click', sendMessage)

//Einlesen des Inhalts des Chatinputfelds und senden an den Server
function sendMessage() {
    const message = messageInput.value
    //Ausgeben in eigenem Verlauf
    chat.innerHTML += 'Du:' + message + '</br>'
    //Mit JSON.stringify wird ein Datenstring erzeugt mit dem Der Server arbeiten kann 
    //type zur unterscheidung ob normale nachricht oder anmeldung zu einem raum  
    const message1 = JSON.stringify({ type: 'message', room, message })
    socket.send(message1)
}

// Bei drücken eines Buttons wird eine Nachricht an den Mitspieler gesendet mit der dann das click event ausgelöst wird
NextButton.addEventListener('click', function () {
    const message = 'nextbuttonclick'
    const message1 = JSON.stringify({ type: 'message', room, message })
    socket.send(message1)
})

Answerbuttons[0].addEventListener('click', function () {
    const message = 'Answerbutton1clicked'
    const message1 = JSON.stringify({ type: 'message', room, message })
    socket.send(message1)
})
Answerbuttons[1].addEventListener('click', function () {
    const message = 'Answerbutton2clicked'
    const message1 = JSON.stringify({ type: 'message', room, message })
    socket.send(message1)
})
Answerbuttons[2].addEventListener('click', function () {
    const message = 'Answerbutton3clicked'
    const message1 = JSON.stringify({ type: 'message', room, message })
    socket.send(message1)
})
Answerbuttons[3].addEventListener('click', function () {
    const message = 'Answerbutton4clicked'
    const message1 = JSON.stringify({ type: 'message', room, message })
    socket.send(message1)
})
// Zuweisen des Clients zu einem Raum
function subscribeToRoom(room) {
    // Subscribe to the room
    const subscribeMessage = JSON.stringify({ type: 'subscribe', room })
    socket.send(subscribeMessage)
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
