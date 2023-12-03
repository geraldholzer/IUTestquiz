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
    fetch("server.php")
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
