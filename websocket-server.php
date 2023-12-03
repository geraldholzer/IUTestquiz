<?php
require 'vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class MyWebSocketServer implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn) {
        // Connection opened
        echo "New connection! ({$conn->resourceId})\n";

        // Speichere die Verbindung für spätere Verwendung
        $this->clients->attach($conn);
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        // Message received
        echo "$msg\n";

        // Iteriere über alle Clients und sende die Nachricht
        foreach ($this->clients as $client) {
            // Sende die Nachricht nicht an den Absender
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // Connection closed
        echo "Connection {$conn->resourceId} has disconnected\n";

        // Entferne die Verbindung aus der Liste
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        // Error occurred
        echo "An error occurred: {$e->getMessage()}\n";

        // Close the connection
        $conn->close();
    }
}

// Setze den WebSocket-Server auf
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new MyWebSocketServer()
        )
    ),
    8080  // Wähle einen Port deiner Wahl
);

echo "WebSocket server started at 127.0.0.1:8080\n";

// Starte den WebSocket-Server
$server->run();









