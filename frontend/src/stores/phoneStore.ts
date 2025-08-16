import { atom } from 'jotai'
import type { WebSocketService } from '@/services/websocket'

// 通話状態
export const isRegisteredAtom = atom(false)
export const isInCallAtom = atom(false)
export const phoneNumberAtom = atom('')
export const callerIdAtom = atom('')

// WebRTC関連
export const localStreamAtom = atom<MediaStream | null>(null)
export const remoteStreamAtom = atom<MediaStream | null>(null)
export const peerConnectionAtom = atom<RTCPeerConnection | null>(null)

// WebSocket
export const wsConnectionAtom = atom<WebSocketService | null>(null)
