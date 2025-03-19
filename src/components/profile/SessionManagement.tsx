import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Monitor, Smartphone, Clock, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  created_at: string;
  user_agent: string;
  ip_address: string;
  location: string;
  current: boolean;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { sessions }, error } = await supabase.auth.getSession();
      if (error) throw error;

      // Format sessions data
      const formattedSessions = sessions.map((session) => ({
        id: session.id,
        created_at: new Date(session.created_at).toLocaleString(),
        user_agent: session.user_agent || 'Unknown Device',
        ip_address: session.ip_address || 'Unknown IP',
        location: session.location || 'Unknown Location',
        current: session.current,
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.auth.admin.signOut(sessionId);
      if (error) throw error;

      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Erro ao encerrar sessão');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Sessões Ativas</h2>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {session.user_agent.toLowerCase().includes('mobile') ? (
                  <Smartphone className="h-6 w-6 text-gray-400" />
                ) : (
                  <Monitor className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user_agent}
                    {session.current && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Sessão Atual
                      </span>
                    )}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{session.created_at}</span>
                    <MapPin className="h-4 w-4 ml-4 mr-1" />
                    <span>
                      {session.location} ({session.ip_address})
                    </span>
                  </div>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleTerminateSession(session.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Encerrar sessão"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}

          {sessions.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Nenhuma sessão ativa encontrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}