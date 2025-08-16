package janus

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Janusリクエスト/レスポンス構造体
type Request struct {
	Janus       string      `json:"janus"`
	Transaction string      `json:"transaction"`
	Plugin      string      `json:"plugin,omitempty"`
	SessionID   uint64      `json:"session_id,omitempty"`
	HandleID    uint64      `json:"handle_id,omitempty"`
	Body        interface{} `json:"body,omitempty"`
	Jsep        *JSEP       `json:"jsep,omitempty"`
	Candidate   *Candidate  `json:"candidate,omitempty"`
}

type Response struct {
	Janus       string      `json:"janus"`
	Transaction string      `json:"transaction"`
	SessionID   uint64      `json:"session_id,omitempty"`
	Data        *Data       `json:"data,omitempty"`
	ID          uint64      `json:"id,omitempty"`
	Error       *Error      `json:"error,omitempty"`
	Plugindata  *PluginData `json:"plugindata,omitempty"`
	Jsep        *JSEP       `json:"jsep,omitempty"`
}

type Data struct {
	ID uint64 `json:"id"`
}

type Error struct {
	Code   int    `json:"code"`
	Reason string `json:"reason"`
}

type PluginData struct {
	Plugin string      `json:"plugin"`
	Data   interface{} `json:"data"`
}

type JSEP struct {
	Type string `json:"type"`
	SDP  string `json:"sdp"`
}

type Candidate struct {
	Candidate     string `json:"candidate"`
	SDPMid        string `json:"sdpMid"`
	SDPMLineIndex int    `json:"sdpMLineIndex"`
}

// セッション作成
func (c *Client) CreateSession() (*Response, error) {
	req := &Request{
		Janus:       "create",
		Transaction: generateTransactionID(),
	}
	return c.sendRequest(req)
}

// プラグインアタッチ
func (c *Client) AttachPlugin(sessionID uint64, plugin string) (*Response, error) {
	req := &Request{
		Janus:       "attach",
		Transaction: generateTransactionID(),
		SessionID:   sessionID,
		Plugin:      plugin,
	}
	return c.sendRequest(req)
}

// SIP登録
func (c *Client) RegisterSIP(sessionID, handleID uint64, username, secret, proxy string) (*Response, error) {
	req := &Request{
		Janus:       "message",
		Transaction: generateTransactionID(),
		SessionID:   sessionID,
		HandleID:    handleID,
		Body: map[string]interface{}{
			"request":  "register",
			"username": username,
			"secret":   secret,
			"proxy":    proxy,
		},
	}
	return c.sendRequest(req)
}

// 通話発信
func (c *Client) MakeCall(sessionID, handleID uint64, uri string, jsep *JSEP) (*Response, error) {
	req := &Request{
		Janus:       "message",
		Transaction: generateTransactionID(),
		SessionID:   sessionID,
		HandleID:    handleID,
		Body: map[string]interface{}{
			"request": "call",
			"uri":     uri,
		},
		Jsep: jsep,
	}
	return c.sendRequest(req)
}

// 通話応答
func (c *Client) AnswerCall(sessionID, handleID uint64, jsep *JSEP) (*Response, error) {
	req := &Request{
		Janus:       "message",
		Transaction: generateTransactionID(),
		SessionID:   sessionID,
		HandleID:    handleID,
		Body: map[string]interface{}{
			"request": "accept",
		},
		Jsep: jsep,
	}
	return c.sendRequest(req)
}

// 通話切断
func (c *Client) HangupCall(sessionID, handleID uint64) (*Response, error) {
	req := &Request{
		Janus:       "message",
		Transaction: generateTransactionID(),
		SessionID:   sessionID,
		HandleID:    handleID,
		Body: map[string]interface{}{
			"request": "hangup",
		},
	}
	return c.sendRequest(req)
}

// ICE候補送信
func (c *Client) SendCandidate(sessionID, handleID uint64, candidate *Candidate) (*Response, error) {
	req := &Request{
		Janus:       "trickle",
		Transaction: generateTransactionID(),
		SessionID:   sessionID,
		HandleID:    handleID,
		Candidate:   candidate,
	}
	return c.sendRequest(req)
}

// HTTPリクエスト送信
func (c *Client) sendRequest(req *Request) (*Response, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	url := c.baseURL
	if req.SessionID != 0 {
		url = fmt.Sprintf("%s/%d", c.baseURL, req.SessionID)
		if req.HandleID != 0 {
			url = fmt.Sprintf("%s/%d", url, req.HandleID)
		}
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var janusResp Response
	if err := json.Unmarshal(body, &janusResp); err != nil {
		return nil, err
	}

	if janusResp.Error != nil {
		return nil, fmt.Errorf("janus error: %s (code: %d)", janusResp.Error.Reason, janusResp.Error.Code)
	}

	return &janusResp, nil
}

func generateTransactionID() string {
	return fmt.Sprintf("vibe-%d", time.Now().UnixNano())
}