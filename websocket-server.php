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
        $this->clients = new \SplObjectStorage();
        $this->rooms = [];
    }


//Bei Anmeldung hinzufügen des clients zur clientliste "clients"
    public function onOpen(ConnectionInterface $conn)
    {
        // Connection opened
        echo "New connection! ({$conn->resourceId})\n";

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
            // Add more cases for other message types if needed
        }
    }

    private function handleSubscribe(ConnectionInterface $conn, $room)
    {
        // Create the room if it doesn't exist
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = new \SplObjectStorage();
        }

        // Subscribe the client to the room
        if($this->rooms[$room]->count()<2){
             $this->rooms[$room]->attach($conn);
             if($this->rooms[$room]->count()==2){
                $message="ready";
               $this->broadcastToRoom($room,$message,$conn);
             }
        echo "Client {$conn->resourceId} subscribed to room $room\n";
        }
       
    }

    private function handleMessage(ConnectionInterface $from, $room, $message)
    {
  

        // Broadcast the message to all clients in the specified room
        $this->broadcastToRoom($room, $message, $from);
    }

    private function broadcastToRoom($room, $message, $exclude)
    {
        echo "from:".$exclude->resourceId."\t";
        echo "Message:".$message."\n";
        if (!isset($this->rooms[$room])) {
            return; // Room doesn't exist
        }

        foreach ($this->rooms[$room] as $client) {
            // Do not send the message to the sender
           if($message!=="ready"){
             if ($exclude !== $client) {
                $client->send($message);
                echo "toinexclude:".$client->resourceId."\n";
            }
           }else{$client->send($message);
            echo "toall:".$client->resourceId."\n";
        }
           
            
        }
    }

    public function onCall(ConnectionInterface $conn, $id, $topic, array $params)
    {
        
    }

    public function onPublish(ConnectionInterface $conn, $topic, $event, array $exclude, array $eligible)
    {
        
    }
    // ... (Other MessageComponentInterface methods)
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

