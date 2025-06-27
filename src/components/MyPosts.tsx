// MyPosts.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db } from '../firebase/config';

interface PostData {
  id: string;
  content: string;
  imageUrls?: string[];
  likes?: number;
  comments?: { user: string; userId: string; text: string }[];
}

export const MyPosts: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<PostData[]>([]);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<PostData, 'id'>;
        return {
          id: doc.id,
          ...data,
        };
      });
      setMyPosts(posts);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">내가 쓴 글</h2>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-blue-500 underline"
      >
        ← 돌아가기
      </button>

      {myPosts.length === 0 ? (
        <p className="text-sm text-gray-500">아직 작성한 글이 없습니다.</p>
      ) : (
        myPosts.map((post) => (
          <div
            key={post.id}
            className="relative bg-white border border-pink-100 rounded-xl shadow-lg p-4 mb-6 max-w-md w-full mx-auto space-y-4 transition hover:shadow-xl"
          >
            {editPostId === post.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full border rounded p-2 text-sm mb-2"
                />
                <div className="flex gap-2 mb-2 overflow-x-auto">
                  {editImages.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} className="h-24 rounded" />
                      <button
                        onClick={() => {
                          setEditImages(editImages.filter((_, i) => i !== idx));
                          setRemovedImageUrls([...removedImageUrls, url]);
                        }}
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) setNewImageFiles(Array.from(e.target.files));
                  }}
                  className="mb-2"
                />
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={async () => {
                      const storage = getStorage();
                      const updatedUrls = [...editImages];

                      for (const url of removedImageUrls) {
                        try {
                          const decodedPath = decodeURIComponent(new URL(url).pathname.split('/o/')[1]);
                          await deleteObject(ref(storage, decodedPath));
                        } catch (e) {
                          console.warn('이미지 삭제 실패:', url);
                        }
                      }

                      for (const file of newImageFiles) {
                        const imageRef = ref(storage, `postImages/${post.id}/${file.name}`);
                        await uploadBytes(imageRef, file);
                        const url = await getDownloadURL(imageRef);
                        updatedUrls.push(url);
                      }

                      await updateDoc(doc(db, 'posts', post.id), {
                        content: editContent,
                        imageUrls: updatedUrls,
                      });

                      setEditPostId(null);
                      setEditContent('');
                      setEditImages([]);
                      setRemovedImageUrls([]);
                      setNewImageFiles([]);
                    }}
                    className="text-blue-500 underline"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditPostId(null);
                      setEditContent('');
                      setEditImages([]);
                      setRemovedImageUrls([]);
                      setNewImageFiles([]);
                    }}
                    className="text-gray-500 underline"
                  >
                    취소
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => navigate(`/posts/${post.id}`)}
                className="cursor-pointer"
              >
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="w-full rounded-xl overflow-hidden aspect-[4/3]">
                    <img
                      src={post.imageUrls[0]}
                      alt="post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-gray-800 text-[15px] leading-relaxed break-words whitespace-pre-line mt-2">
                  {post.content}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <div className="flex gap-3">
                    <span>♥ {post.likes || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPostId(post.id);
                        setEditContent(post.content);
                        setEditImages(post.imageUrls || []);
                        setRemovedImageUrls([]);
                        setNewImageFiles([]);
                      }}
                      className="text-blue-500 underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = window.confirm('정말 삭제할까요?');
                        if (!ok) return;
                        await deleteDoc(doc(db, 'posts', post.id));
                        alert('삭제되었습니다.');
                      }}
                      className="text-red-500 underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
