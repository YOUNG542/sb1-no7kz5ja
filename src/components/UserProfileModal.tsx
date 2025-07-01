import React, { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X } from 'lucide-react';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };
    fetchUser();
  }, [userId]);

  if (!userData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        {/* 프로필 사진 */}
        <div className="flex justify-center mb-4">
          {userData.photoURL ? (
            <img
              src={userData.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              없음
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-center mb-1">{userData.nickname}</h2>
        <p className="text-sm text-center text-gray-600 mb-4">{userData.intro}</p>

        {/* 관심사 표시 */}
        {userData.interests && (
          <div className="flex flex-wrap gap-2 justify-center">
            {userData.interests.map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
