import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { supabase } from '../lib/supabase';

interface WebRTCState {
  connected: boolean;
  error: string | null;
  stream: MediaStream | null;
}

export function useWebRTC(deviceId: string, initiator: boolean = false) {
  const [state, setState] = useState<WebRTCState>({
    connected: false,
    error: null,
    stream: null,
  });
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`webrtc-${deviceId}`);

    const setupPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const peer = new Peer({
          initiator,
          stream,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        peer.on('signal', async (data) => {
          await supabase.from('remote_sessions').update({
            signal_data: data,
          }).eq('device_id', deviceId);
        });

        peer.on('connect', () => {
          setState((prev) => ({ ...prev, connected: true }));
        });

        peer.on('stream', (remoteStream) => {
          setState((prev) => ({ ...prev, stream: remoteStream }));
        });

        peer.on('error', (err) => {
          setState((prev) => ({ ...prev, error: err.message }));
        });

        peer.on('close', () => {
          setState((prev) => ({ ...prev, connected: false, stream: null }));
        });

        peerRef.current = peer;

        // Subscribe to signal changes
        channel
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'remote_sessions',
            filter: `device_id=eq.${deviceId}`,
          }, async (payload) => {
            if (payload.new.signal_data && !initiator) {
              peer.signal(payload.new.signal_data);
            }
          })
          .subscribe();

        setState((prev) => ({ ...prev, stream }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to setup WebRTC',
        }));
      }
    };

    setupPeer();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
      channel.unsubscribe();
    };
  }, [deviceId, initiator]);

  const sendData = (data: any) => {
    if (peerRef.current && state.connected) {
      peerRef.current.send(JSON.stringify(data));
    }
  };

  return {
    ...state,
    sendData,
  };
}