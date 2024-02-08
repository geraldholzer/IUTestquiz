<?php
require 'vendor/autoload.php';
//Ratchet wird für die Websockets benötigt
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\Wamp\WampServerInterface;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

//Websocket server class 
class MyWebSocketServer implements MessageComponentInterface
{
    protected $clients;
    protected $rooms;
 //Konstruktor
    public function __construct()
    {
        // Hier werden alle Verbindungen der Spieler gespeichert
        $this->clients = new \SplObjectStorage();
        // Hier werden die Spielsitzungen gespeichert in die dann die clients hinzugefügt werden
        $this->rooms = [];
    }


//Bei Anmeldung hinzufügen des clients zur clientliste "clients"
    public function onOpen(ConnectionInterface $conn)
    {
        // Connection opened
        echo "New connection! ({$conn->resourceId})\n";
        $conn->finishflag= false;
        // Client zu clients hinzufügen
        $this->clients->attach($conn);
    }
    // Bei schließen der Verbindung  
    public function onClose(ConnectionInterface $conn)
    {
        // Connection closed
        echo "Connection {$conn->resourceId} has disconnected\n";

        // Remove the connection from all rooms
        foreach ($this->rooms as $room) {
            $room->detach($conn);
        }

        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        // Error occurred
        echo "An error occurred: {$e->getMessage()}\n";

        // Close the connection
        $conn->close();
    }

   
    //Hier wird eine Nachricht vom Client ausgewertet
    public function onMessage(ConnectionInterface $from, $msg)
    {
        // Übergebene nachricht in Assoziatives array umwandeln
        $data = json_decode($msg, true);

        if (!isset($data['type'])) {
            return; // Invalid message format
        }
        
        switch ($data['type']) {
            case 'subscribe':
                $this->handleSubscribe($from, $data['room']);
                break;
            case 'message':
                $this->handleMessage($from, $data['room'], $data['message']);
                break;
            case 'finish':
                $this->handleFinish($from, $data['room'], $data['message']);
                break;
        }
    }
    // Hier wird ein Client zu einem Raum gleichbedeutend mit Spielsitzung hinzugefügt
    private function handleSubscribe(ConnectionInterface $conn, $room)
    {
        // Raum erstellen falls nicht vorhanden 
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = new \SplObjectStorage();
        }

        // Client zu Raum hinzufügen mit attach Wenn sich 2 Spieler im Raum befinden wird eine ready message gesendet.
        if($this->rooms[$room]->count()<2){
             $this->rooms[$room]->attach($conn);
             //Ready message dient dazu das Spiel nach dem Eintreffen beider Spieler zu Starten
             if($this->rooms[$room]->count()==2){
                $message="ready";
               $this->broadcastToRoom($room,json_encode(['type' => 'message', 'message' => $message]),null);
             }
        echo "Client {$conn->resourceId} subscribed to room $room\n";
        }
       
    }

    private function handleMessage(ConnectionInterface $from, $room, $message)
    {
        // Broadcast the message to all clients in the specified room
        $this->broadcastToRoom($room, json_encode(['type' => 'message', 'message' => $message]), $from);
    }

    private function handleFinish(ConnectionInterface $from, $room, $message)
    {
        $this->broadcastToRoom($room,  json_encode(['type' => 'finish', 'points' => $message]), $from);
        
        $from->finishflag= true;

        $allClientsFinished = true;
        foreach ($this->rooms[$room] as $client) {
            if (!isset($client->finishflag) || !$client->finishflag) {
                $allClientsFinished = false;
                break;
            }
        }

        // Wenn das Flag bei allen Clients gesetzt ist
        if ($allClientsFinished) {
           echo "game over";
            // Sende die 'gameover' Nachricht an alle Clients im Raum
            $this->broadcastToRoom($room, json_encode(['type' => 'gameover', 'message' =>"gameover"]), null);
        }
      
    }
    
    private function broadcastToRoom($room, $message, $exclude)
    {   
        if (!isset($this->rooms[$room])) {
            return; // Spiel existiert nicht
        }

        foreach ($this->rooms[$room] as $client) {
            // Do not send the message to the sender
           if($message!=="ready"){
             if ($exclude !== $client) {
                $client->send($message);
            }
           }else{$client->send($message); }
                    
        }
    }

}

// Set up the WebSocket Server
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new MyWebSocketServer()
        )
    ),
    8081  // Port wählen
);
//Port8081 weil sonst konflikt mit XAMPP
echo "WebSocket server started at 127.0.0.1:8081\n";

// Start the WebSocket Server
$server->run();
?>

