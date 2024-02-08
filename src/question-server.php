<?php

if(isset($_POST['action'])){
    $action=$_POST['action'];
}


if ($action==="fragenladen"){
fragenAusgeben();
}

class answer{
    public $answer;
    public $correct;

    function __construct($answer,$correct) {
        $this->answer = $answer;
        $this->correct = $correct;
      }
}

class question{
    public $questionid;
    public $questiontext;
    public $explanation;
    public $answers;
    
    function __construct($questiontext,$explanation,$answerarray){
        $this->questiontext=$questiontext;
        $this->explanation=$explanation;
        $this->answers= $answerarray;
        
    }
    
}


function fragenAusgeben() {
$questions= array(
    new question("Welches Land liegt in Europa","Die Anderen Länder liegen in Amerika",array(
        new answer("Frankreich",true,),
        new answer("Argentinien",false),
        new answer("Brasilien",false),
        new answer("USA",false),
    )),
    new question("welche Farbe hat Schnee","Kann unter Umständen auch gelb sein",array(
        new answer("weiß",true),
        new answer("rot",false),
        new answer("blau",false),
        new answer("grün",false),
    )),
    new question("Was ist grün und innen hohl","Klar doch",array(
        new answer("Schnittlauch",true),
        new answer("Tür",false),
        new answer("Fenster",false),
        new answer("Bagger",false,))

    ));

    
        $myJSON = json_encode($questions);
    
        echo $myJSON;
    }

// $myJSON = json_encode($questions);

// echo $myJSON;
?>
