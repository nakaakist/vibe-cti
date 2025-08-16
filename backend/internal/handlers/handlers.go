package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/vibe-cti/backend/internal/janus"
	ws "github.com/vibe-cti/backend/internal/websocket"
)

type Handler struct {
	janusClient *janus.Client
	wsHub       *ws.Hub
	upgrader    websocket.Upgrader
}

func NewHandler(janusClient *janus.Client, wsHub *ws.Hub) *Handler {
	return &Handler{
		janusClient: janusClient,
		wsHub:       wsHub,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // 開発環境では全て許可
			},
		},
	}
}

// ヘルスチェック
func (h *Handler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "healthy",
	})
}

// WebSocketハンドラー
func (h *Handler) WebSocketHandler(c echo.Context) error {
	conn, err := h.upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}

	clientID := c.QueryParam("clientId")
	if clientID == "" {
		clientID = fmt.Sprintf("client-%d", conn.RemoteAddr())
	}

	wsConn := ws.NewWSConn(conn)
	client := &ws.Client{
		ID:   clientID,
		Conn: wsConn,
		Send: make(chan []byte, 256),
		Hub:  h.wsHub,
	}

	h.wsHub.Register <- client

	go client.WritePump()
	go client.ReadPump()

	return nil
}

// Janusセッション作成
func (h *Handler) CreateSession(c echo.Context) error {
	resp, err := h.janusClient.CreateSession()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"session_id": resp.Data.ID,
	})
}

// プラグインアタッチ
func (h *Handler) AttachPlugin(c echo.Context) error {
	sessionID := c.Param("sessionId")
	var req struct {
		Plugin string `json:"plugin"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	var sessionIDUint uint64
	if _, err := fmt.Sscanf(sessionID, "%d", &sessionIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid session ID",
		})
	}

	resp, err := h.janusClient.AttachPlugin(sessionIDUint, req.Plugin)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"handle_id": resp.Data.ID,
	})
}

// SIP登録
func (h *Handler) RegisterSIP(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var req struct {
		Username string `json:"username"`
		Secret   string `json:"secret"`
		Proxy    string `json:"proxy"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	var sessionIDUint, handleIDUint uint64
	if _, err := fmt.Sscanf(sessionID, "%d", &sessionIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid session ID",
		})
	}
	if _, err := fmt.Sscanf(handleID, "%d", &handleIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid handle ID",
		})
	}

	resp, err := h.janusClient.RegisterSIP(sessionIDUint, handleIDUint, req.Username, req.Secret, req.Proxy)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, resp)
}

// 発信
func (h *Handler) MakeCall(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var req struct {
		URI  string      `json:"uri"`
		Jsep *janus.JSEP `json:"jsep"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	var sessionIDUint, handleIDUint uint64
	if _, err := fmt.Sscanf(sessionID, "%d", &sessionIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid session ID",
		})
	}
	if _, err := fmt.Sscanf(handleID, "%d", &handleIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid handle ID",
		})
	}

	resp, err := h.janusClient.MakeCall(sessionIDUint, handleIDUint, req.URI, req.Jsep)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	// WebSocket通知
	if err := h.wsHub.Broadcast(&ws.Message{
		Type: ws.TypeCallConnected,
		Data: json.RawMessage(fmt.Sprintf(`{"session_id": %q, "handle_id": %q}`, sessionID, handleID)),
	}); err != nil {
		log.Printf("Failed to broadcast call connected: %v", err)
	}

	return c.JSON(http.StatusOK, resp)
}

// 応答
func (h *Handler) AnswerCall(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var req struct {
		Jsep *janus.JSEP `json:"jsep"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	var sessionIDUint, handleIDUint uint64
	if _, err := fmt.Sscanf(sessionID, "%d", &sessionIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid session ID",
		})
	}
	if _, err := fmt.Sscanf(handleID, "%d", &handleIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid handle ID",
		})
	}

	resp, err := h.janusClient.AnswerCall(sessionIDUint, handleIDUint, req.Jsep)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, resp)
}

// 切断
func (h *Handler) HangupCall(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var sessionIDUint, handleIDUint uint64
	if _, err := fmt.Sscanf(sessionID, "%d", &sessionIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid session ID",
		})
	}
	if _, err := fmt.Sscanf(handleID, "%d", &handleIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid handle ID",
		})
	}

	resp, err := h.janusClient.HangupCall(sessionIDUint, handleIDUint)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	// WebSocket通知
	if err := h.wsHub.Broadcast(&ws.Message{
		Type: ws.TypeCallEnded,
		Data: json.RawMessage(fmt.Sprintf(`{"session_id": %q, "handle_id": %q}`, sessionID, handleID)),
	}); err != nil {
		log.Printf("Failed to broadcast call ended: %v", err)
	}

	return c.JSON(http.StatusOK, resp)
}

// SDPオファー送信
func (h *Handler) SendOffer(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var req struct {
		Jsep *janus.JSEP `json:"jsep"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// WebSocket通知
	if err := h.wsHub.Broadcast(&ws.Message{
		Type: ws.TypeOffer,
		Data: json.RawMessage(fmt.Sprintf(`{"session_id": %q, "handle_id": %q, "jsep": %s}`,
			sessionID, handleID, mustMarshal(req.Jsep))),
	}); err != nil {
		log.Printf("Failed to broadcast offer: %v", err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "offer sent",
	})
}

// SDPアンサー送信
func (h *Handler) SendAnswer(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var req struct {
		Jsep *janus.JSEP `json:"jsep"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// WebSocket通知
	if err := h.wsHub.Broadcast(&ws.Message{
		Type: ws.TypeAnswer,
		Data: json.RawMessage(fmt.Sprintf(`{"session_id": %q, "handle_id": %q, "jsep": %s}`,
			sessionID, handleID, mustMarshal(req.Jsep))),
	}); err != nil {
		log.Printf("Failed to broadcast answer: %v", err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "answer sent",
	})
}

// ICE候補送信
func (h *Handler) SendCandidate(c echo.Context) error {
	sessionID := c.Param("sessionId")
	handleID := c.Param("handleId")

	var req struct {
		Candidate *janus.Candidate `json:"candidate"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	var sessionIDUint, handleIDUint uint64
	if _, err := fmt.Sscanf(sessionID, "%d", &sessionIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid session ID",
		})
	}
	if _, err := fmt.Sscanf(handleID, "%d", &handleIDUint); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid handle ID",
		})
	}

	resp, err := h.janusClient.SendCandidate(sessionIDUint, handleIDUint, req.Candidate)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	// WebSocket通知
	if err := h.wsHub.Broadcast(&ws.Message{
		Type: ws.TypeICECandidate,
		Data: json.RawMessage(fmt.Sprintf(`{"session_id": %q, "handle_id": %q, "candidate": %s}`,
			sessionID, handleID, mustMarshal(req.Candidate))),
	}); err != nil {
		log.Printf("Failed to broadcast ICE candidate: %v", err)
	}

	return c.JSON(http.StatusOK, resp)
}

func mustMarshal(v interface{}) string {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("Failed to marshal JSON: %v", err)
		return "{}"
	}
	return string(data)
}
