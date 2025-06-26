import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/config';
import { storage } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore'; // 추가
export const PostUploadForm: React.FC = () => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!images) return [];

    const uploadPromises = Array.from(images).map(async (file) => {
      const fileRef = ref(storage, `postImages/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
  
    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImages();
  
      // 🔽 Firestore에서 nickname 가져오기
      let nickname = '익명';
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        nickname = userSnap.data().nickname || '익명';
      }
  
      // 🔽 Firestore에 포스트 저장
      await addDoc(collection(db, 'posts'), {
        user: {
          nickname,
          userId: user.uid,
        },
        userId: user.uid,
        content,
        imageUrls,
        likes: 0,
        dislikes: 0,
        reactions: [],
        comments: [],
        createdAt: Timestamp.now(),
      });
  
      setContent('');
      setImages(null);
      alert('게시 완료!');
    } catch (error) {
      console.error('❌ 포스트 업로드 실패:', error);
      alert('오류가 발생했습니다.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">오늘의 이야기 작성하기</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 있었던 일을 공유해보세요..."
        className="w-full border rounded-xl p-3 text-sm resize-none h-32"
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="text-sm"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-2 rounded-xl bg-pink-600 text-white text-sm hover:bg-pink-700 transition"
      >
        {isSubmitting ? '업로드 중...' : '게시하기'}
      </button>
    </div>
  );
};
