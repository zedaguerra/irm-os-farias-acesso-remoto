import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Shield, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountTypeSelectorProps {
  onSelect: (type: 'personal' | 'business') => void;
}

export function AccountTypeSelector({ onSelect }: AccountTypeSelectorProps) {
  const { data: accountTypes, isLoading } = useQuery({
    queryKey: ['account-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_types')
        .select('*')
        .order('created_at');

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        onClick={() => onSelect('personal')}
        className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <User className="h-8 w-8 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800 ml-3">Personal Account</h3>
        </div>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Monitor individual devices
          </li>
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Remote access control
          </li>
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Basic security features
          </li>
        </ul>
      </div>

      <div
        onClick={() => onSelect('business')}
        className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center mb-4">
          <Building2 className="h-8 w-8 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800 ml-3">Business Account</h3>
        </div>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Monitor multiple devices
          </li>
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Team management
          </li>
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Advanced security features
          </li>
          <li className="flex items-center">
            <Shield className="h-4 w-4 text-green-500 mr-2" />
            Detailed analytics
          </li>
        </ul>
      </div>
    </div>
  );
}