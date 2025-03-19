import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Wand2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AutomationRuleForm } from './AutomationRuleForm';
import toast from 'react-hot-toast';

interface AutomationRulesProps {
  deviceId: string;
}

export function AutomationRules({ deviceId }: AutomationRulesProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const { data: rules, refetch } = useQuery({
    queryKey: ['automation-rules', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast.success('Rule deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ enabled: !enabled })
        .eq('id', ruleId);

      if (error) throw error;
      toast.success(`Rule ${enabled ? 'disabled' : 'enabled'} successfully`);
      refetch();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to toggle rule');
    }
  };

  const handleEditRule = (rule: any) => {
    setSelectedRule(rule);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Wand2 className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Automation Rules</h2>
        </div>
        <button
          onClick={() => {
            setSelectedRule(null);
            setShowForm(true);
          }}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      <div className="space-y-4">
        {rules?.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-start justify-between p-4 rounded-lg ${
              rule.enabled ? 'bg-gray-50' : 'bg-gray-100'
            }`}
          >
            <div>
              <h3 className="font-medium text-gray-900">{rule.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                When {rule.condition.metric} {rule.condition.operator}{' '}
                {rule.condition.value}
              </p>
              <p className="text-sm text-gray-600">
                Action: {rule.action.type}
                {rule.action.params.service && ` (${rule.action.params.service})`}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleToggleRule(rule.id, rule.enabled)}
                className={`p-1 ${
                  rule.enabled ? 'text-green-600' : 'text-gray-400'
                } hover:text-gray-600`}
                title={rule.enabled ? 'Disable rule' : 'Enable rule'}
              >
                {rule.enabled ? (
                  <ToggleRight className="h-5 w-5" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => handleEditRule(rule)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Edit rule"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="p-1 text-red-400 hover:text-red-600"
                title="Delete rule"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {!rules?.length && (
          <div className="text-center py-8 text-gray-500">
            No automation rules configured
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <AutomationRuleForm
            deviceId={deviceId}
            existingRule={selectedRule}
            onClose={() => {
              setShowForm(false);
              setSelectedRule(null);
            }}
          />
        </div>
      )}
    </div>
  );
}