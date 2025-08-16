import React, { useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  isRegisteredAtom,
  isInCallAtom,
  phoneNumberAtom,
  callerIdAtom,
  localStreamAtom,
  remoteStreamAtom,
  wsConnectionAtom,
  peerConnectionAtom,
} from '@/stores/phoneStore'
import { wsService } from '@/services/websocket'
import { webrtcService } from '@/services/webrtc'

export const Softphone: React.FC = () => {
  const [isRegistered, setIsRegistered] = useAtom(isRegisteredAtom)
  const [isInCall, setIsInCall] = useAtom(isInCallAtom)
  const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom)
  const [callerId, setCallerId] = useAtom(callerIdAtom)
  const [localStream, setLocalStream] = useAtom(localStreamAtom)
  const [remoteStream, setRemoteStream] = useAtom(remoteStreamAtom)
  const [wsConnection, setWsConnection] = useAtom(wsConnectionAtom)
  const [peerConnection, setPeerConnection] = useAtom(peerConnectionAtom)

  const localAudioRef = useRef<HTMLAudioElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  // WebSocketメッセージハンドラ設定
  useEffect(() => {
    const unsubscribe = wsService.onMessage(async (data) => {
      console.log('WebSocketメッセージ受信:', data)

      switch (data.type) {
        case 'call_incoming':
          setCallerId(data.caller_id)
          // 着信処理 - 自動でPeerConnectionを作成
          const pc = webrtcService.createPeerConnection((candidate) => {
            wsService.send({
              type: 'ice_candidate',
              candidate: candidate
            })
          })
          setPeerConnection(pc)
          break
        case 'call_connected':
          setIsInCall(true)
          break
        case 'call_ended':
          handleHangup()
          break
        case 'offer':
          // WebRTC offer処理
          await handleOffer(data.sdp)
          break
        case 'answer':
          // WebRTC answer処理
          await webrtcService.handleAnswer(data.sdp)
          break
        case 'ice_candidate':
          // ICE候補処理
          await webrtcService.addIceCandidate(data.candidate)
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // SIP登録
  const handleRegister = async () => {
    try {
      // マイクアクセス取得
      const stream = await webrtcService.initializeMedia()
      setLocalStream(stream)
      
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream
      }

      // WebSocket接続
      await wsService.connect()
      setWsConnection(wsService)
      
      // SIP登録メッセージ送信
      wsService.send({
        type: 'register',
        extension: '1001' // TODO: 設定可能にする
      })
      
      setIsRegistered(true)
    } catch (error) {
      console.error('登録エラー:', error)
      alert('登録に失敗しました: ' + error)
    }
  }

  // 登録解除
  const handleUnregister = () => {
    wsService.send({
      type: 'unregister'
    })
    
    wsService.disconnect()
    webrtcService.hangup()
    
    setWsConnection(null)
    setLocalStream(null)
    setIsRegistered(false)
  }

  // 発信
  const handleCall = async () => {
    if (!phoneNumber) {
      alert('電話番号を入力してください')
      return
    }

    try {
      // WebRTC接続セットアップ
      const pc = webrtcService.createPeerConnection((candidate) => {
        wsService.send({
          type: 'ice_candidate',
          candidate: candidate
        })
      })

      setPeerConnection(pc)

      // リモートストリーム設定
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0]
        }
      }

      // SDP作成と送信
      const offer = await webrtcService.createOffer()

      wsService.send({
        type: 'call',
        number: phoneNumber,
        sdp: offer
      })

      setIsInCall(true)
    } catch (error) {
      console.error('発信エラー:', error)
      alert('発信に失敗しました: ' + error)
    }
  }

  // 切断
  const handleHangup = () => {
    webrtcService.hangup()
    setPeerConnection(null)
    setRemoteStream(null)

    wsService.send({
      type: 'hangup'
    })

    setIsInCall(false)
    setPhoneNumber('')
    setCallerId('')
  }

  // WebRTC offer処理（着信時）
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      const answer = await webrtcService.createAnswer(offer)
      
      wsService.send({
        type: 'answer',
        sdp: answer
      })
    } catch (error) {
      console.error('Offer処理エラー:', error)
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      handleUnregister()
    }
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ViBE CTI ソフトフォン</CardTitle>
        <CardDescription>
          {isRegistered ? '登録済み' : '未登録'}
          {callerId && ` - 着信: ${callerId}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 登録ボタン */}
        <div className="flex gap-2">
          <Button
            onClick={handleRegister}
            disabled={isRegistered}
            variant={isRegistered ? 'secondary' : 'default'}
            className="flex-1"
          >
            登録
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
          <Button
            onClick={handleHangup}
            variant="destructive"
            className="w-full"
          >
            切断
          </Button>
        ) : (
          <Button
            onClick={handleCall}
            disabled={!isRegistered || !phoneNumber}
            className="w-full"
          >
            発信
          </Button>
        )}

        {/* オーディオ要素 */}
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />
      </CardContent>
    </Card>
  )
}