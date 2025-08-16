import { useAtom } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { janusManager } from '@/services/janusManager'
import { webrtcService } from '@/services/webrtc'
import { wsService } from '@/services/websocket'
import {
  callerIdAtom,
  callStateAtom,
  isInCallAtom,
  isRegisteredAtom,
  localStreamAtom,
  peerConnectionAtom,
  phoneNumberAtom,
  remoteStreamAtom,
  wsConnectionAtom,
} from '@/stores/phoneStore'

export const Softphone: React.FC = () => {
  const [isRegistered, setIsRegistered] = useAtom(isRegisteredAtom)
  const [isInCall, setIsInCall] = useAtom(isInCallAtom)
  const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom)
  const [callerId, setCallerId] = useAtom(callerIdAtom)
  const [_localStream, setLocalStream] = useAtom(localStreamAtom)
  const [_remoteStream, setRemoteStream] = useAtom(remoteStreamAtom)
  const [_wsConnection, setWsConnection] = useAtom(wsConnectionAtom)
  const [_peerConnection, setPeerConnection] = useAtom(peerConnectionAtom)
  const [callState, setCallState] = useAtom(callStateAtom)
  const [isConnecting, setIsConnecting] = useState(false)

  const localAudioRef = useRef<HTMLAudioElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  // 切断（useCallbackで定義を先に移動）
  const handleHangup = useCallback(async () => {
    await janusManager.hangup()
    setPeerConnection(null)
    setRemoteStream(null)
    setIsInCall(false)
    setPhoneNumber('')
    setCallerId('')
    setCallState('idle')
  }, [setPeerConnection, setRemoteStream, setIsInCall, setPhoneNumber, setCallerId, setCallState])

  // WebRTC offer処理（着信時）（useCallbackで定義を先に移動）
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const answer = await webrtcService.createAnswer(offer)

      wsService.send({
        type: 'answer',
        sdp: answer,
      })
    } catch (error) {
      console.error('Offer処理エラー:', error)
    }
  }, [])

  // WebSocketメッセージハンドラ設定
  useEffect(() => {
    const unsubscribe = wsService.onMessage(async (data) => {
      console.log('WebSocketメッセージ受信:', data)

      switch (data.type) {
        case 'call_incoming': {
          setCallerId(data.caller_id || '')
          // 着信処理 - 自動でPeerConnectionを作成
          const pc = webrtcService.createPeerConnection((candidate) => {
            wsService.send({
              type: 'ice_candidate',
              candidate: candidate,
            })
          })
          setPeerConnection(pc)
          break
        }
        case 'call_connected':
          setIsInCall(true)
          break
        case 'call_ended':
          handleHangup()
          break
        case 'offer':
          // WebRTC offer処理
          if (data.sdp) {
            await handleOffer(data.sdp)
          }
          break
        case 'answer':
          // WebRTC answer処理
          if (data.sdp) {
            await webrtcService.handleAnswer(data.sdp)
          }
          break
        case 'ice_candidate':
          // ICE候補処理
          if (data.candidate) {
            await webrtcService.addIceCandidate(data.candidate)
          }
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [handleHangup, handleOffer, setCallerId, setIsInCall, setPeerConnection])

  // SIP登録
  const handleRegister = async () => {
    try {
      setIsConnecting(true)

      // マイクアクセス取得
      const stream = await webrtcService.initializeMedia()
      setLocalStream(stream)

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream
      }

      // Janus接続
      await janusManager.connect()

      // WebSocket接続（バックエンドAPIとの通信用）
      await wsService.connect()
      setWsConnection(wsService)

      // SIP登録メッセージ送信
      wsService.send({
        type: 'register',
        extension: '1001', // TODO: 設定可能にする
      })

      setIsRegistered(true)
      setIsConnecting(false)
    } catch (error) {
      console.error('登録エラー:', error)
      alert(`登録に失敗しました: ${error}`)
      setIsConnecting(false)
    }
  }

  // 登録解除
  const handleUnregister = useCallback(() => {
    wsService.send({
      type: 'unregister',
    })

    wsService.disconnect()
    janusManager.disconnect()
    webrtcService.hangup()

    setWsConnection(null)
    setLocalStream(null)
    setIsRegistered(false)
    setCallState('idle')
  }, [setWsConnection, setLocalStream, setIsRegistered, setCallState])

  // 発信
  const handleCall = async () => {
    if (!phoneNumber) {
      alert('電話番号を入力してください')
      return
    }

    try {
      setCallState('calling')

      // Janus経由で発信
      await janusManager.makeCall(phoneNumber)

      // リモートストリーム監視
      const checkRemoteStream = setInterval(() => {
        const remoteStream = webrtcService.getRemoteStream()
        if (remoteStream && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream
          setRemoteStream(remoteStream)
          clearInterval(checkRemoteStream)
        }
      }, 100)

      // 30秒後にタイムアウト
      setTimeout(() => clearInterval(checkRemoteStream), 30000)

      setIsInCall(true)
    } catch (error) {
      console.error('発信エラー:', error)
      alert(`発信に失敗しました: ${error}`)
      setCallState('idle')
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      handleUnregister()
    }
  }, [handleUnregister])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ViBE CTI ソフトフォン</CardTitle>
        <CardDescription>
          {isConnecting && '接続中...'}
          {!isConnecting && (isRegistered ? '登録済み' : '未登録')}
          {callState !== 'idle' &&
            ` - ${callState === 'calling' ? '発信中...' : callState === 'ringing' ? '呼出中...' : callState === 'connected' ? '通話中' : callState}`}
          {callerId && ` - 着信: ${callerId}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 登録ボタン */}
        <div className="flex gap-2">
          <Button
            onClick={handleRegister}
            disabled={isRegistered || isConnecting}
            variant={isRegistered ? 'secondary' : 'default'}
            className="flex-1"
          >
            {isConnecting ? '接続中...' : '登録'}
          </Button>
          <Button
            onClick={handleUnregister}
            disabled={!isRegistered}
            variant="destructive"
            className="flex-1"
          >
            登録解除
          </Button>
        </div>

        {/* 電話番号入力 */}
        <Input
          type="tel"
          placeholder="電話番号を入力"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={!isRegistered || isInCall}
        />

        {/* 発信/切断ボタン */}
        {isInCall ? (
          <Button onClick={handleHangup} variant="destructive" className="w-full">
            切断
          </Button>
        ) : (
          <Button onClick={handleCall} disabled={!isRegistered || !phoneNumber} className="w-full">
            発信
          </Button>
        )}

        {/* オーディオ要素 */}
        {/* biome-ignore lint/a11y/useMediaCaption: 電話アプリのため字幕は不要 */}
        <audio ref={localAudioRef} autoPlay muted />
        {/* biome-ignore lint/a11y/useMediaCaption: 電話アプリのため字幕は不要 */}
        <audio ref={remoteAudioRef} autoPlay />
      </CardContent>
    </Card>
  )
}
