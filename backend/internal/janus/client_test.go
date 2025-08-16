package janus

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_CreateSession(t *testing.T) {
	// モックサーバー作成
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// リクエスト検証
		if r.Method != "POST" {
			t.Errorf("Expected POST request, got %s", r.Method)
		}

		var req Request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Errorf("Failed to decode request: %v", err)
		}

		if req.Janus != "create" {
			t.Errorf("Expected janus='create', got %s", req.Janus)
		}

		// レスポンス返却
		resp := Response{
			Janus:       "success",
			Transaction: req.Transaction,
			Data: &Data{
				ID: 12345,
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	// テスト実行
	client := NewClient(server.URL)
	resp, err := client.CreateSession()

	// 検証
	if err != nil {
		t.Fatalf("CreateSession failed: %v", err)
	}

	if resp.Janus != "success" {
		t.Errorf("Expected janus='success', got %s", resp.Janus)
	}

	if resp.Data == nil || resp.Data.ID != 12345 {
		t.Errorf("Expected session ID 12345, got %v", resp.Data)
	}
}

func TestClient_AttachPlugin(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		json.NewDecoder(r.Body).Decode(&req)

		if req.Janus != "attach" {
			t.Errorf("Expected janus='attach', got %s", req.Janus)
		}

		if req.Plugin != "janus.plugin.sip" {
			t.Errorf("Expected plugin='janus.plugin.sip', got %s", req.Plugin)
		}

		resp := Response{
			Janus:       "success",
			Transaction: req.Transaction,
			SessionID:   req.SessionID,
			Data: &Data{
				ID: 67890,
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := NewClient(server.URL)
	resp, err := client.AttachPlugin(12345, "janus.plugin.sip")

	if err != nil {
		t.Fatalf("AttachPlugin failed: %v", err)
	}

	if resp.Data == nil || resp.Data.ID != 67890 {
		t.Errorf("Expected handle ID 67890, got %v", resp.Data)
	}
}

func TestClient_RegisterSIP(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		json.NewDecoder(r.Body).Decode(&req)

		// リクエストボディ検証
		body, ok := req.Body.(map[string]interface{})
		if !ok {
			t.Errorf("Body is not a map")
			return
		}

		if body["request"] != "register" {
			t.Errorf("Expected request='register', got %v", body["request"])
		}

		if body["username"] != "1000" {
			t.Errorf("Expected username='1000', got %v", body["username"])
		}

		resp := Response{
			Janus:       "success",
			Transaction: req.Transaction,
			Plugindata: &PluginData{
				Plugin: "janus.plugin.sip",
				Data: map[string]interface{}{
					"result": "registered",
				},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := NewClient(server.URL)
	resp, err := client.RegisterSIP(12345, 67890, "1000", "1234", "sip:freeswitch:5060")

	if err != nil {
		t.Fatalf("RegisterSIP failed: %v", err)
	}

	if resp.Plugindata == nil {
		t.Errorf("Expected plugin data, got nil")
	}
}

func TestClient_MakeCall(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req Request
		json.NewDecoder(r.Body).Decode(&req)

		body, _ := req.Body.(map[string]interface{})
		if body["request"] != "call" {
			t.Errorf("Expected request='call', got %v", body["request"])
		}

		if req.Jsep == nil {
			t.Errorf("Expected JSEP, got nil")
		}

		resp := Response{
			Janus:       "success",
			Transaction: req.Transaction,
			Jsep: &JSEP{
				Type: "answer",
				SDP:  "v=0\r\n...",
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := NewClient(server.URL)
	jsep := &JSEP{
		Type: "offer",
		SDP:  "v=0\r\n...",
	}
	resp, err := client.MakeCall(12345, 67890, "sip:1001@freeswitch", jsep)

	if err != nil {
		t.Fatalf("MakeCall failed: %v", err)
	}

	if resp.Jsep == nil || resp.Jsep.Type != "answer" {
		t.Errorf("Expected answer JSEP, got %v", resp.Jsep)
	}
}

func TestClient_ErrorHandling(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := Response{
			Janus: "error",
			Error: &Error{
				Code:   456,
				Reason: "No such session",
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := NewClient(server.URL)
	_, err := client.CreateSession()

	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	expectedError := "janus error: No such session (code: 456)"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}