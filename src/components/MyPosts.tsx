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
          <div key={post.id} className="border p-3 rounded-lg mb-3 bg-white shadow-sm">
            {editPostId === post.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full border rounded p-2 text-sm mb-2"
                />
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={async () => {
                      await updateDoc(doc(db, 'posts', post.id), { content: editContent });
                      setEditPostId(null);
                      setEditContent('');
                    }}
                    className="text-blue-500 underline"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditPostId(null);
                      setEditContent('');
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
                className="cursor-pointer hover:shadow-md transition"
              >
                <p className="text-sm text-gray-800 mb-1">{post.content}</p>
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-2">
                    {post.imageUrls.map((url, idx) => (
                      <img key={idx} src={url} className="h-24 rounded" />
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
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
