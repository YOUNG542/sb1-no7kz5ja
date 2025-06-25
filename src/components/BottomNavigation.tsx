import React from 'react';
import {
  Users,
  MessageSquare,
  Bell,
  User,
  Image // ✅ 포스트 탭용 아이콘 추가
} from 'lucide-react';
import { Screen } from '../types';

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  messageRequestCount: number;
  unreadMessageCount: number;
  loadChatData: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onScreenChange,
  messageRequestCount,
  unreadMessageCount,
  loadChatData
}) => {
  const navItems = [
    {
      id: 'feed' as Screen,
      icon: Users,
      label: '둘러보기'
    },
    {
      id: 'posts' as Screen, // ✅ 포스트 탭 추가
      icon: Image,
      label: '포스트'
    },
    {
      id: 'requests' as Screen,
      icon: Bell,
      label: '알림',
      badge: messageRequestCount
    },
    {
      id: 'chat' as Screen,
      icon: MessageSquare,
      label: '채팅',
      badge: unreadMessageCount
    },
    {
      id: 'profile' as Screen,
      icon: User,
      label: '프로필'
    }
  ];

  const handleScreenChange = (screen: Screen) => {
    onScreenChange(screen);

    if (screen === 'chat') {
      loadChatData();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-4 py-2 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleScreenChange(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
