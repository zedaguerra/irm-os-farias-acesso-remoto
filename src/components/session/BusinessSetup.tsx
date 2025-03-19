import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Building2, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessSetupProps {
  onComplete: () => void;
}

export function BusinessSetup({ onComplete }: BusinessSetupProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    businessName: '',
    teamSize: 1,
    requireApproval: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: accountType } = await supabase
        .from('account_types')
        .select('id')
        .eq('type', 'business')
        .single();

      if (!accountType) throw new Error('Business account type not found');

      const { error: accountError } = await supabase
        .from('user_accounts')
        .insert({
          account_type_id: accountType.id,
          business_name: formData.businessName,
          is_admin: true
        });

      if (accountError) throw accountError;

      queryClient.invalidateQueries(['user-account']);
      toast.success('Business account setup completed');
      onComplete();
    } catch (error) {
      console.error('Error setting up business account:', error);
      toast.error('Failed to setup business account');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Building2 className="h-8 w-8 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-800 ml-3">Business Account Setup</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Size
          </label>
          <input
            type="number"
            min="1"
            value={formData.teamSize}
            onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireApproval"
            checked={formData.requireApproval}
            onChange={(e) => setFormData(prev => ({ ...prev, requireApproval: e.target.checked }))}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-700">
            Require approval for remote sessions
          </label>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-purple-800">Business Features</h4>
              <ul className="mt-2 text-sm text-purple-700 space-y-1">
                <li>• Monitor and manage multiple devices</li>
                <li>• Team access control</li>
                <li>• Advanced security settings</li>
                <li>• Detailed activity logs</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Users className="h-5 w-5 mr-2" />
          Complete Business Setup
        </button>
      </form>
    </div>
  );
}