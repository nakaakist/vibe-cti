package websocket

import (
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512

	// WebSocket message types
	TextMessage  = websocket.TextMessage
	CloseMessage = websocket.CloseMessage
)

// WebSocket接続ラッパー
type WSConn struct {
	*websocket.Conn
}

func NewWSConn(conn *websocket.Conn) *WSConn {
	return &WSConn{Conn: conn}
}

func (c *WSConn) ReadMessage() (messageType int, p []byte, err error) {
	c.SetReadDeadline(time.Now().Add(pongWait))
	c.SetPongHandler(func(string) error {
		c.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	return c.Conn.ReadMessage()
}

func (c *WSConn) WriteMessage(messageType int, data []byte) error {
	c.SetWriteDeadline(time.Now().Add(writeWait))
	return c.Conn.WriteMessage(messageType, data)
}