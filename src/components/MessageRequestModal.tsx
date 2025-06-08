import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { User } from '../types';

interface MessageRequestModalProps {
  targetUser: User;
  onSend: (message: string) => void;
  onClose: () => void;
}

export const MessageRequestModal: React.FC<MessageRequestModalProps> = ({
  targetUser,
  onSend,
  onClose
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSend(message);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">메시지 보내기</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{targetUser.nickname}</h3>
            <p className="text-gray-700 text-sm">{targetUser.intro}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              첫 메시지를 보내보세요
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="안녕하세요! 프로필을 보고 연락드렸어요."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={4}
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {message.length}/200
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              취소
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-3 rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  보내기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};