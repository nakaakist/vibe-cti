package main

import (
	"log"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/vibe-cti/backend/internal/handlers"
	"github.com/vibe-cti/backend/internal/janus"
	"github.com/vibe-cti/backend/internal/websocket"
)

func main() {
	e := echo.New()

	// ミドルウェア設定
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Janusクライアント初期化
	janusURL := os.Getenv("JANUS_URL")
	if janusURL == "" {
		janusURL = "http://janus:8088/janus"
	}
	janusClient := janus.NewClient(janusURL)

	// WebSocketハブ初期化
	wsHub := websocket.NewHub()
	go wsHub.Run()

	// ハンドラー初期化
	h := handlers.NewHandler(janusClient, wsHub)

	// ルート設定
	e.GET("/health", h.HealthCheck)
	e.GET("/ws", h.WebSocketHandler)

	// Janus制御API
	api := e.Group("/api/v1")
	api.POST("/sessions", h.CreateSession)
	api.POST("/sessions/:sessionId/attach", h.AttachPlugin)
	api.POST("/sessions/:sessionId/handles/:handleId/register", h.RegisterSIP)
	api.POST("/sessions/:sessionId/handles/:handleId/call", h.MakeCall)
	api.POST("/sessions/:sessionId/handles/:handleId/answer", h.AnswerCall)
	api.POST("/sessions/:sessionId/handles/:handleId/hangup", h.HangupCall)
	api.POST("/sessions/:sessionId/handles/:handleId/offer", h.SendOffer)
	api.POST("/sessions/:sessionId/handles/:handleId/answer-sdp", h.SendAnswer)
	api.POST("/sessions/:sessionId/handles/:handleId/candidate", h.SendCandidate)

	// サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(e.Start(":" + port))
}
