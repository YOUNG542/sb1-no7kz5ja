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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 프로필 사진 */}
        <div className="flex justify-center mb-4">
          {userData.photoURL ? (
            <img
              src={userData.photoURL}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              이미지 없음
            </div>
          )}
        </div>

        {/* 닉네임 + 소개 */}
        <h2 className="text-2xl font-bold text-center text-gray-900">{userData.nickname}</h2>
        <p className="text-sm text-center text-gray-600 mt-2">{userData.intro}</p>

        {/* 관심사 */}
        {userData.interests && userData.interests.length > 0 && (
          <>
            <p className="text-sm font-semibold mt-5 mb-2 text-gray-800 text-center">관심사</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {userData.interests.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-pink-50 text-pink-600 px-3 py-1 text-xs rounded-full border border-pink-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
