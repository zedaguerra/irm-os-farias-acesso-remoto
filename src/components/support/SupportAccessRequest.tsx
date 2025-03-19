import React from 'react';
import { Shield, Clock, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { accessControl } from '../../lib/access-control';
import toast from 'react-hot-toast';

interface SupportAccessRequestProps {
  request: {
    id: string;
    supportUser: {
      username: string;
    };
    type: 'view' | 'control';
    createdAt: Date;
    expiresAt: Date;
  };
  onClose: () => void;
}

export function SupportAccessRequest({ request, onClose }: SupportAccessRequestProps) {
  const handleApprove = async () => {
    try {
      await accessControl.approveAccess(request.id);
      toast.success('Support access approved');
      onClose();
    } catch (error) {
      toast.error('Failed to approve access');
    }
  };

  const handleReject = async () => {
    try {
      await accessControl.rejectAccess(request.id);
      toast.success('Support access rejected');
      onClose();
    } catch (error) {
      toast.error('Failed to reject access');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Support Access Request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Support Agent</p>
            <p className="text-lg text-gray-900">{request.supportUser.username}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Access Type</p>
            <p className="text-lg text-gray-900 capitalize">{request.type}</p>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Expires {format(request.expiresAt, 'PPp')}</span>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              By approving this request, you grant the support agent temporary access to your device.
              All actions will be logged and monitored.
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}