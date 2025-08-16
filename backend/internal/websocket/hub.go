package websocket

import (
	"encoding/json"
	"log"
)

// メッセージタイプ
const (
	TypeCallIncoming  = "call_incoming"
	TypeCallConnected = "call_connected"
	TypeCallEnded     = "call_ended"
	TypeICECandidate  = "ice_candidate"
	TypeOffer         = "offer"
	TypeAnswer        = "answer"
	TypeError         = "error"
)

// WebSocketメッセージ
type Message struct {
	Type      string          `json:"type"`
	SessionID string          `json:"session_id,omitempty"`
	Data      json.RawMessage `json:"data"`
}

// クライアント接続
type Client struct {
	ID   string
	Conn *WSConn
	Send chan []byte
	Hub  *Hub
}

// WebSocketハブ
type Hub struct {
	clients    map[string]*Client
	broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.clients[client.ID] = client
			log.Printf("Client registered: %s", client.ID)

		case client := <-h.Unregister:
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
				log.Printf("Client unregistered: %s", client.ID)
			}

		case message := <-h.broadcast:
			for _, client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client.ID)
				}
			}
		}
	}
}

// 特定クライアントへメッセージ送信
func (h *Hub) SendToClient(clientID string, message *Message) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	if client, ok := h.clients[clientID]; ok {
		select {
		case client.Send <- data:
			return nil
		default:
			return err
		}
	}
	return nil
}

// 全クライアントへメッセージ送信
func (h *Hub) Broadcast(message *Message) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	h.broadcast <- data
	return nil
}

// クライアント処理
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		// メッセージ処理（ここで必要な処理を実装）
		log.Printf("Received message from %s: %s", c.ID, msg.Type)
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()

	for message := range c.Send {
		if err := c.Conn.WriteMessage(TextMessage, message); err != nil {
			return
		}
	}
	// チャネルが閉じられた場合、クローズメッセージを送信
	_ = c.Conn.WriteMessage(CloseMessage, []byte{})
}
