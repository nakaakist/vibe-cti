// Janus WebRTC Gateway統合管理

import { phoneStore } from '../stores/phoneStore'
import { webrtcService } from './webrtc'

interface JanusMessage {
  janus: string
  transaction?: string
  session_id?: number
  sender?: number
  plugindata?: {
    plugin: string
    data: Record<string, unknown>
  }
  jsep?: RTCSessionDescriptionInit
}

export class JanusManager {
  private ws: WebSocket | null = null
  private sessionId: number | null = null
  private handleId: number | null = null
  private transactions: Map<string, (msg: JanusMessage) => void> = new Map()
  private connected = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private keepAliveTimer: NodeJS.Timeout | null = null

  // Janus WebSocket URL
  private wsUrl = 'ws://localhost:8188'

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl)

        this.ws.onopen = async () => {
          console.log('Janus WebSocket接続成功')
          this.connected = true
          await this.createSession()
          this.startKeepAlive()
          resolve()
        }

        this.ws.onmessage = (event) => {
          const msg: JanusMessage = JSON.parse(event.data)
          this.handleMessage(msg)
        }

        this.ws.onerror = (error) => {
          console.error('Janus WebSocketエラー:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('Janus WebSocket切断')
          this.connected = false
          this.stopKeepAlive()
          this.scheduleReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private async createSession() {
    const transaction = this.generateTransactionId()
    const msg = {
      janus: 'create',
      transaction,
    }

    return new Promise<void>((resolve) => {
      this.transactions.set(transaction, (response) => {
        if (response.janus === 'success' && response.session_id) {
          this.sessionId = response.session_id
          console.log('Janusセッション作成:', this.sessionId)
          this.attachPlugin().then(resolve)
        }
      })

      this.send(msg)
    })
  }

  private async attachPlugin(): Promise<void> {
    if (!this.sessionId) {
      throw new Error('セッションIDが未設定')
    }

    const transaction = this.generateTransactionId()
    const msg = {
      janus: 'attach',
      session_id: this.sessionId,
      plugin: 'janus.plugin.sip',
      transaction,
    }

    return new Promise((resolve) => {
      this.transactions.set(transaction, (response) => {
        if (response.janus === 'success' && response.sender) {
          this.handleId = response.sender
          console.log('SIPプラグインアタッチ成功:', this.handleId)
          resolve()
        }
      })

      this.send(msg)
    })
  }

  async makeCall(phoneNumber: string): Promise<void> {
    if (!this.sessionId || !this.handleId) {
      throw new Error('Janus未接続')
    }

    // メディアの初期化
    await webrtcService.initializeMedia()

    // PeerConnection作成
    webrtcService.createPeerConnection((candidate) => {
      this.sendTrickleCandidate(candidate)
    })

    // SDP Offer作成
    const offer = await webrtcService.createOffer()

    const transaction = this.generateTransactionId()
    const msg = {
      janus: 'message',
      session_id: this.sessionId,
      handle_id: this.handleId,
      transaction,
      body: {
        request: 'call',
        uri: `sip:${phoneNumber}@localhost`,
      },
      jsep: offer,
    }

    return new Promise((resolve, reject) => {
      this.transactions.set(transaction, (response) => {
        if (response.jsep) {
          // Answerの処理
          webrtcService.handleAnswer(response.jsep).then(resolve).catch(reject)
        }
      })

      this.send(msg)
      phoneStore.setCallState('calling')
    })
  }

  async hangup(): Promise<void> {
    if (!this.sessionId || !this.handleId) {
      return
    }

    const transaction = this.generateTransactionId()
    const msg = {
      janus: 'message',
      session_id: this.sessionId,
      handle_id: this.handleId,
      transaction,
      body: {
        request: 'hangup',
      },
    }

    this.send(msg)
    webrtcService.hangup()
    phoneStore.setCallState('idle')
  }

  async answerCall(): Promise<void> {
    if (!this.sessionId || !this.handleId) {
      throw new Error('Janus未接続')
    }

    // 着信時の処理（今後実装）
    console.log('着信応答処理')
  }

  private sendTrickleCandidate(candidate: RTCIceCandidate) {
    if (!this.sessionId || !this.handleId) {
      return
    }

    const msg = {
      janus: 'trickle',
      session_id: this.sessionId,
      handle_id: this.handleId,
      transaction: this.generateTransactionId(),
      candidate: {
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
        candidate: candidate.candidate,
      },
    }

    this.send(msg)
  }

  private handleMessage(msg: JanusMessage) {
    console.log('Janusメッセージ受信:', msg)

    // トランザクション応答の処理
    if (msg.transaction) {
      const handler = this.transactions.get(msg.transaction)
      if (handler) {
        handler(msg)
        this.transactions.delete(msg.transaction)
      }
    }

    // イベント処理
    if (msg.janus === 'event' && msg.plugindata) {
      this.handlePluginEvent(msg.plugindata.data)
    }

    // WebRTC関連
    if (msg.jsep && !msg.transaction) {
      this.handleIncomingJsep(msg.jsep)
    }
  }

  private handlePluginEvent(data: Record<string, unknown>) {
    console.log('SIPプラグインイベント:', data)

    const sipData = data as { sip?: string; result?: { event?: string } }
    if (sipData.sip === 'event') {
      switch (sipData.result?.event) {
        case 'calling':
          phoneStore.setCallState('calling')
          break
        case 'ringing':
          phoneStore.setCallState('ringing')
          break
        case 'accepted':
          phoneStore.setCallState('connected')
          break
        case 'hangup':
          phoneStore.setCallState('idle')
          webrtcService.hangup()
          break
      }
    }
  }

  private async handleIncomingJsep(jsep: RTCSessionDescriptionInit) {
    if (jsep.type === 'offer') {
      // 着信時のOffer処理
      const answer = await webrtcService.createAnswer(jsep)
      this.sendAnswer(answer)
    } else if (jsep.type === 'answer') {
      // 発信時のAnswer処理
      await webrtcService.handleAnswer(jsep)
    }
  }

  private sendAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.sessionId || !this.handleId) {
      return
    }

    const msg = {
      janus: 'message',
      session_id: this.sessionId,
      handle_id: this.handleId,
      transaction: this.generateTransactionId(),
      body: {
        request: 'accept',
      },
      jsep: answer,
    }

    this.send(msg)
  }

  private send(msg: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private generateTransactionId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private startKeepAlive() {
    this.keepAliveTimer = setInterval(() => {
      if (this.sessionId) {
        this.send({
          janus: 'keepalive',
          session_id: this.sessionId,
          transaction: this.generateTransactionId(),
        })
      }
    }, 30000) // 30秒ごと
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('Janus再接続試行...')
      this.connect().catch((error) => {
        console.error('再接続失敗:', error)
        this.scheduleReconnect()
      })
    }, 5000) // 5秒後に再接続
  }

  disconnect() {
    this.stopKeepAlive()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.sessionId = null
    this.handleId = null
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }
}

// シングルトンインスタンス
export const janusManager = new JanusManager()
