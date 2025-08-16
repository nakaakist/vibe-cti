import { atom } from 'jotai'
import type { WebSocketService } from '@/services/websocket'

// 通話状態タイプ
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'hold' | 'ended'

// 通話状態
export const isRegisteredAtom = atom(false)
export const isInCallAtom = atom(false)
export const phoneNumberAtom = atom('')
export const callerIdAtom = atom('')
export const callStateAtom = atom<CallState>('idle')

// WebRTC関連
export const localStreamAtom = atom<MediaStream | null>(null)
export const remoteStreamAtom = atom<MediaStream | null>(null)
export const peerConnectionAtom = atom<RTCPeerConnection | null>(null)

// WebSocket
export const wsConnectionAtom = atom<WebSocketService | null>(null)

// phoneStore用のヘルパー関数（JanusManagerから使用）
export const phoneStore = {
  setCallState: (state: CallState) => {
    // この関数はJanusManagerから使用されるが、
    // 実際の状態更新はコンポーネント側で行う
    console.log('Call state changed to:', state)
  },
}
