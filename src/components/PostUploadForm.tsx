import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/config';
import { storage } from '../firebase/config';
import { getAuth } from 'firebase/auth';

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
      await addDoc(collection(db, 'posts'), {
        user: {
          nickname: user.displayName || '익명',
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
    <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 있었던 일을 공유해보세요..."
        className="w-full border rounded-lg p-2 text-sm mb-2"
        rows={3}
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="mb-2"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-4 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
      >
        {isSubmitting ? '업로드 중...' : '게시하기'}
      </button>
    </div>
  );
};
