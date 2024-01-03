<?php

class Game {
    public $name;
    public $started; // Zeitstempel um alte offene Spiele zu beenden

    function __construct($name, $started) {
        $this->name = $name;
        $this->started = $started;
    }
}

// Verbindung zur MySQL-Datenbank herstellen
$servername="13.49.243.225";
$username="root";
$pw="";
$db="deine_datenbank";
$conn= new mysqli($servername,$username,$pw,$db);

// Überprüfen, ob die Verbindung erfolgreich war
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}
$action = $_POST['action'];

if(isset($_POST['gamename'])){
    $gamename=$_POST['gamename'];
}


if ($action === 'deleteGame') {
    $gameName = $_POST['gameName'];
    deleteGame($gamename, $conn);
} else if ($action === 'addGame') {
    addGame($gamename, $conn);
} else if ($action === 'getGameList') {
    sendGamelist($conn);
}

function addGame($name, $conn) {
    $started = time();
    $stmt = $conn->prepare('INSERT INTO games (name, started) VALUES (?, ?)');
    $stmt->bind_param('si', $name, $started);
    $stmt->execute();
    $stmt->close();
}

function deleteGame($name, $conn) {
    $stmt = $conn->prepare('DELETE FROM games WHERE name = ?');
    $stmt->bind_param('s', $name);
    $stmt->execute();
    $stmt->close();
}

function sendGamelist($conn) {
    $result = $conn->query('SELECT * FROM games');
    $gamesArray = array();

    while ($row = $result->fetch_assoc()) {
        $gamesArray[] = array(
            'name' => $row['name'],
            'started' => $row['started']
        );
    }

    // Konvertiere das Array in JSON
    $gamesJson = json_encode($gamesArray);

    // Ausgabe des JSON an den Client
    echo $gamesJson;
}

// Verbindung schließen
$conn->close();
?>
