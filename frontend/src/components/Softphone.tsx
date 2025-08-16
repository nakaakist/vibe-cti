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

  // WebSocket接続
  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8080/ws')
    
    ws.onopen = () => {
      console.log('WebSocket接続確立')
      setWsConnection(ws)
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      console.log('WebSocketメッセージ受信:', data)

      switch (data.type) {
        case 'call_incoming':
          setCallerId(data.caller_id)
          // 着信処理
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
          await handleAnswer(data.sdp)
          break
        case 'ice_candidate':
          // ICE候補処理
          await handleIceCandidate(data.candidate)
          break
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocketエラー:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket接続終了')
      setWsConnection(null)
      setIsRegistered(false)
    }
  }

  // SIP登録
  const handleRegister = async () => {
    try {
      // マイクアクセス取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setLocalStream(stream)
      
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream
      }

      // WebSocket接続
      connectWebSocket()
      
      // TODO: 実際のSIP登録処理
      setIsRegistered(true)
    } catch (error) {
      console.error('登録エラー:', error)
    }
  }

  // 登録解除
  const handleUnregister = () => {
    if (wsConnection) {
      wsConnection.close()
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    setIsRegistered(false)
  }

  // 発信
  const handleCall = async () => {
    if (!phoneNumber) {
      alert('電話番号を入力してください')
      return
    }

    // WebRTC接続セットアップ
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })

    pc.onicecandidate = (event) => {
      if (event.candidate && wsConnection) {
        wsConnection.send(JSON.stringify({
          type: 'ice_candidate',
          candidate: event.candidate
        }))
      }
    }

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0])
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0]
      }
    }

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
      })
    }

    setPeerConnection(pc)

    // SDP作成と送信
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'call',
        number: phoneNumber,
        sdp: offer
      }))
    }

    setIsInCall(true)
  }

  // 切断
  const handleHangup = () => {
    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop())
      setRemoteStream(null)
    }

    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'hangup'
      }))
    }

    setIsInCall(false)
    setPhoneNumber('')
    setCallerId('')
  }

  // WebRTC offer処理
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection) return

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'answer',
        sdp: answer
      }))
    }
  }

  // WebRTC answer処理
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection) return
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  }

  // ICE候補処理
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection) return
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
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