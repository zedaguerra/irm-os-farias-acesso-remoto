import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { User, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface PersonalSetupProps {
  onComplete: () => void;
}

export function PersonalSetup({ onComplete }: PersonalSetupProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data: accountType } = await supabase
        .from('account_types')
        .select('id')
        .eq('type', 'personal')
        .single();

      if (!accountType) throw new Error('Personal account type not found');

      const { error: accountError } = await supabase
        .from('user_accounts')
        .insert({
          account_type_id: accountType.id
        });

      if (accountError) throw accountError;

      queryClient.invalidateQueries(['user-account']);
      toast.success('Personal account setup completed');
      onComplete();
    } catch (error) {
      console.error('Error setting up personal account:', error);
      toast.error('Failed to setup personal account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <User className="h-8 w-8 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800 ml-3">Personal Account Setup</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Personal Features</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Monitor individual devices</li>
                <li>• Remote access control</li>
                <li>• Basic security features</li>
                <li>• Activity tracking</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-sm text-gray-700">Single device monitoring</span>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-sm text-gray-700">Remote access</span>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-sm text-gray-700">Basic analytics</span>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-sm text-gray-700">Security alerts</span>
          </div>
        </div>

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Shield className="h-5 w-5 mr-2" />
              Complete Personal Setup
            </>
          )}
        </button>
      </div>
    </div>
  );
}