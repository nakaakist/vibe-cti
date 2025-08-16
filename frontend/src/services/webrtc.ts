// WebRTC接続管理サービス

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null

  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]

  async initializeMedia(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      return this.localStream
    } catch (error) {
      console.error('メディアデバイスアクセスエラー:', error)
      throw error
    }
  }

  createPeerConnection(onIceCandidate: (candidate: RTCIceCandidate) => void): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    })

    // ICE候補の処理
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate)
      }
    }

    // リモートストリームの処理
    this.peerConnection.ontrack = (event) => {
      console.log('リモートトラック受信:', event)
      if (event.streams[0]) {
        this.remoteStream = event.streams[0]
      }
    }

    // 接続状態の監視
    this.peerConnection.onconnectionstatechange = () => {
      console.log('接続状態:', this.peerConnection?.connectionState)
    }

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE接続状態:', this.peerConnection?.iceConnectionState)
    }

    // ローカルストリームの追加
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })
    }

    return this.peerConnection
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初期化')
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    })

    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初期化')
    }

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初期化')
    }
    await this.peerConnection.setRemoteDescription(answer)
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) {
      throw new Error('PeerConnection未初期化')
    }
    await this.peerConnection.addIceCandidate(candidate)
  }

  hangup() {
    // ストリームの停止
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.remoteStream = null
    }

    // PeerConnectionのクローズ
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  muteAudio(mute: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !mute
      })
    }
  }
}

// シングルトンインスタンス
export const webrtcService = new WebRTCService()
