package websocket

import (
	"encoding/json"
	"testing"
	"time"
)

func TestHub_NewHub(t *testing.T) {
	hub := NewHub()

	if hub == nil {
		t.Fatal("NewHub returned nil")
	}

	if hub.clients == nil {
		t.Error("clients map is nil")
	}

	if hub.broadcast == nil {
		t.Error("broadcast channel is nil")
	}

	if hub.Register == nil {
		t.Error("register channel is nil")
	}

	if hub.Unregister == nil {
		t.Error("unregister channel is nil")
	}
}

func TestHub_RegisterAndUnregister(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// クライアント作成
	client := &Client{
		ID:   "test-client-1",
		Send: make(chan []byte, 256),
		Hub:  hub,
	}

	// 登録
	hub.Register <- client
	time.Sleep(10 * time.Millisecond) // 処理待ち

	if _, ok := hub.clients[client.ID]; !ok {
		t.Error("Client was not registered")
	}

	// 登録解除
	hub.Unregister <- client
	time.Sleep(10 * time.Millisecond) // 処理待ち

	if _, ok := hub.clients[client.ID]; ok {
		t.Error("Client was not unregistered")
	}
}

func TestHub_SendToClient(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// クライアント作成と登録
	client := &Client{
		ID:   "test-client-1",
		Send: make(chan []byte, 256),
		Hub:  hub,
	}
	hub.Register <- client
	time.Sleep(10 * time.Millisecond)

	// メッセージ送信
	message := &Message{
		Type: TypeCallIncoming,
		Data: json.RawMessage(`{"from": "1000"}`),
	}

	err := hub.SendToClient(client.ID, message)
	if err != nil {
		t.Fatalf("SendToClient failed: %v", err)
	}

	// メッセージ受信確認
	select {
	case receivedData := <-client.Send:
		var receivedMsg Message
		if err := json.Unmarshal(receivedData, &receivedMsg); err != nil {
			t.Fatalf("Failed to unmarshal received message: %v", err)
		}

		if receivedMsg.Type != TypeCallIncoming {
			t.Errorf("Expected type %s, got %s", TypeCallIncoming, receivedMsg.Type)
		}
	case <-time.After(100 * time.Millisecond):
		t.Error("Message was not received")
	}
}

func TestHub_Broadcast(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// 複数クライアント作成と登録
	clients := []*Client{
		{
			ID:   "test-client-1",
			Send: make(chan []byte, 256),
			Hub:  hub,
		},
		{
			ID:   "test-client-2",
			Send: make(chan []byte, 256),
			Hub:  hub,
		},
		{
			ID:   "test-client-3",
			Send: make(chan []byte, 256),
			Hub:  hub,
		},
	}

	for _, client := range clients {
		hub.Register <- client
	}
	time.Sleep(10 * time.Millisecond)

	// ブロードキャスト送信
	message := &Message{
		Type: TypeCallConnected,
		Data: json.RawMessage(`{"session": "12345"}`),
	}

	err := hub.Broadcast(message)
	if err != nil {
		t.Fatalf("Broadcast failed: %v", err)
	}

	// 全クライアントでメッセージ受信確認
	for _, client := range clients {
		select {
		case receivedData := <-client.Send:
			var receivedMsg Message
			if err := json.Unmarshal(receivedData, &receivedMsg); err != nil {
				t.Fatalf("Failed to unmarshal received message for client %s: %v", client.ID, err)
			}

			if receivedMsg.Type != TypeCallConnected {
				t.Errorf("Client %s: Expected type %s, got %s", client.ID, TypeCallConnected, receivedMsg.Type)
			}
		case <-time.After(100 * time.Millisecond):
			t.Errorf("Client %s: Message was not received", client.ID)
		}
	}
}

func TestHub_SendToNonExistentClient(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	message := &Message{
		Type: TypeError,
		Data: json.RawMessage(`{"error": "test"}`),
	}

	// 存在しないクライアントへの送信
	err := hub.SendToClient("non-existent-client", message)
	if err != nil {
		t.Errorf("SendToClient should not return error for non-existent client, got: %v", err)
	}
}

func TestMessage_Marshal(t *testing.T) {
	message := &Message{
		Type:      TypeOffer,
		SessionID: "session-123",
		Data:      json.RawMessage(`{"sdp": "v=0\r\n..."}`),
	}

	data, err := json.Marshal(message)
	if err != nil {
		t.Fatalf("Failed to marshal message: %v", err)
	}

	var unmarshaled Message
	if err := json.Unmarshal(data, &unmarshaled); err != nil {
		t.Fatalf("Failed to unmarshal message: %v", err)
	}

	if unmarshaled.Type != message.Type {
		t.Errorf("Expected type %s, got %s", message.Type, unmarshaled.Type)
	}

	if unmarshaled.SessionID != message.SessionID {
		t.Errorf("Expected session ID %s, got %s", message.SessionID, unmarshaled.SessionID)
	}
}
