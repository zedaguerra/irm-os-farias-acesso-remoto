import React, { useState, useEffect, useRef } from 'react';
import { Device } from '../../types/database';
import {
  Laptop,
  Smartphone,
  Monitor,
  Maximize2,
  MessageCircle,
  Share2,
  Settings,
  Power,
  RotateCw,
  Clock,
  X,
  Video,
  Mic,
  Volume2,
  Keyboard,
  Mouse,
  ClipboardCopy,
  Download,
  Upload,
  Shield
} from 'lucide-react';

interface RemoteControlPanelProps {
  device: Device;
  onClose: () => void;
  onShowChat: () => void;
  onShowFileTransfer: () => void;
}

export function RemoteControlPanel({
  device,
  onClose,
  onShowChat,
  onShowFileTransfer
}: RemoteControlPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  const [mouseEnabled, setMouseEnabled] = useState(true);
  const [clipboardSync, setClipboardSync] = useState(true);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-4">
            {device.type === 'desktop' ? (
              <Laptop className="h-8 w-8 text-blue-600" />
            ) : (
              <Smartphone className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{device.name}</h2>
            <p className="text-sm text-gray-500">{device.os}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 px-4 py-2"
          >
            Voltar ao Monitoramento
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Encerrar Sessão
          </button>
        </div>
      </div>

      <div className="relative bg-gray-900 rounded-xl aspect-video mb-6">
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-2 rounded-lg ${
              videoEnabled ? 'bg-blue-600' : 'bg-gray-600'
            } text-white`}
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg ${
              audioEnabled ? 'bg-blue-600' : 'bg-gray-600'
            } text-white`}
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            className={`p-2 rounded-lg ${
              micEnabled ? 'bg-blue-600' : 'bg-gray-600'
            } text-white`}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setKeyboardEnabled(!keyboardEnabled)}
            className={`p-2 rounded-lg ${
              keyboardEnabled ? 'bg-blue-600' : 'bg-gray-600'
            } text-white`}
          >
            <Keyboard className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMouseEnabled(!mouseEnabled)}
            className={`p-2 rounded-lg ${
              mouseEnabled ? 'bg-blue-600' : 'bg-gray-600'
            } text-white`}
          >
            <Mouse className="h-5 w-5" />
          </button>
          <button
            onClick={() => setClipboardSync(!clipboardSync)}
            className={`p-2 rounded-lg ${
              clipboardSync ? 'bg-blue-600' : 'bg-gray-600'
            } text-white`}
          >
            <ClipboardCopy className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={toggleFullscreen}
          className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100"
        >
          <Maximize2 className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-800">Tela Cheia</span>
        </button>
        <button
          onClick={onShowChat}
          className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100"
        >
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-800">Chat</span>
        </button>
        <button
          onClick={onShowFileTransfer}
          className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100"
        >
          <Share2 className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-800">Arquivos</span>
        </button>
        <button className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-800">Configurar</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center justify-center space-x-2 bg-red-50 rounded-xl p-4 hover:bg-red-100">
          <Power className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-800">Desligar</span>
        </button>
        <button className="flex items-center justify-center space-x-2 bg-blue-50 rounded-xl p-4 hover:bg-blue-100">
          <RotateCw className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-blue-800">Reiniciar</span>
        </button>
        <button className="flex items-center justify-center space-x-2 bg-purple-50 rounded-xl p-4 hover:bg-purple-100">
          <Clock className="h-5 w-5 text-purple-600" />
          <span className="text-sm text-purple-800">Agendar</span>
        </button>
        <button className="flex items-center justify-center space-x-2 bg-green-50 rounded-xl p-4 hover:bg-green-100">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800">Segurança</span>
        </button>
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Qualidade da Conexão</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setQuality('low')}
            className={`px-3 py-1 rounded ${
              quality === 'low'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            Baixa
          </button>
          <button
            onClick={() => setQuality('medium')}
            className={`px-3 py-1 rounded ${
              quality === 'medium'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            Média
          </button>
          <button
            onClick={() => setQuality('high')}
            className={`px-3 py-1 rounded ${
              quality === 'high'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            Alta
          </button>
        </div>
      </div>
    </div>
  );
}