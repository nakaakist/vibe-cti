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
	if err := c.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		return 0, nil, err
	}
	c.SetPongHandler(func(string) error {
		return c.SetReadDeadline(time.Now().Add(pongWait))
	})
	return c.Conn.ReadMessage()
}

func (c *WSConn) WriteMessage(messageType int, data []byte) error {
	if err := c.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
		return err
	}
	return c.Conn.WriteMessage(messageType, data)
}
