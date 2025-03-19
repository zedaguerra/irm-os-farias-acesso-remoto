import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { X, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AutomationRuleFormProps {
  deviceId: string;
  onClose: () => void;
  existingRule?: {
    id: string;
    name: string;
    condition: {
      metric: string;
      operator: string;
      value: number;
    };
    action: {
      type: string;
      params: Record<string, any>;
    };
  };
}

export function AutomationRuleForm({ deviceId, onClose, existingRule }: AutomationRuleFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: existingRule?.name || '',
    condition: {
      metric: existingRule?.condition.metric || 'cpu',
      operator: existingRule?.condition.operator || '>',
      value: existingRule?.condition.value || 80
    },
    action: {
      type: existingRule?.action.type || 'notify',
      params: existingRule?.action.params || {}
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const ruleData = {
        device_id: deviceId,
        name: formData.name,
        condition: formData.condition,
        action: formData.action,
        enabled: true
      };

      const { error } = existingRule
        ? await supabase
            .from('automation_rules')
            .update(ruleData)
            .eq('id', existingRule.id)
        : await supabase
            .from('automation_rules')
            .insert([ruleData]);

      if (error) throw error;

      toast.success(
        existingRule ? 'Rule updated successfully' : 'Rule created successfully'
      );
      queryClient.invalidateQueries(['automation-rules', deviceId]);
      onClose();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {existingRule ? 'Edit Rule' : 'Create New Rule'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rule Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter rule name"
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Condition</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Metric</label>
              <select
                value={formData.condition.metric}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condition: { ...prev.condition, metric: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cpu">CPU Usage</option>
                <option value="memory">Memory Usage</option>
                <option value="disk">Disk Usage</option>
                <option value="network">Network Usage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Operator</label>
              <select
                value={formData.condition.operator}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condition: { ...prev.condition, operator: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=">">Greater than</option>
                <option value="<">Less than</option>
                <option value="==">Equals</option>
                <option value=">=">Greater or equal</option>
                <option value="<=">Less or equal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Value</label>
              <input
                type="number"
                value={formData.condition.value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  condition: { ...prev.condition, value: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Action</h3>
          <div>
            <select
              value={formData.action.type}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                action: { type: e.target.value, params: {} }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="notify">Send Notification</option>
              <option value="restart_service">Restart Service</option>
              <option value="scale_resources">Scale Resources</option>
            </select>
          </div>

          {formData.action.type === 'restart_service' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={formData.action.params.service || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  action: {
                    ...prev.action,
                    params: { ...prev.action.params, service: e.target.value }
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter service name"
                required
              />
            </div>
          )}

          {formData.action.type === 'scale_resources' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  CPU Limit (%)
                </label>
                <input
                  type="number"
                  value={formData.action.params.cpu || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    action: {
                      ...prev.action,
                      params: { ...prev.action.params, cpu: Number(e.target.value) }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Memory Limit (MB)
                </label>
                <input
                  type="number"
                  value={formData.action.params.memory || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    action: {
                      ...prev.action,
                      params: { ...prev.action.params, memory: Number(e.target.value) }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
            <p className="text-sm text-yellow-700">
              Automation rules will be executed automatically when conditions are met.
              Please review carefully before saving.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Rule
          </button>
        </div>
      </form>
    </div>
  );
}