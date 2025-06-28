import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { MessageRequestModal } from './MessageRequestModal';
import { User } from '../types';
import { ReportModal } from './ReportModal'; // 경로는 실제 위치에 맞게 조정
interface PostData {
  id: string;
  user: { nickname: string; userId: string };
  content: string;
  imageUrls: string[];
  likes: number;
  dislikes: number;
  reactions?: { userId: string; type: 'like' | 'dislike' }[];
  comments?: { user: string; userId: string; text: string }[];
}

export const PostDetail: React.FC = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const userId = auth.currentUser?.uid || 'anonymous';

  const [post, setPost] = useState<PostData | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [userNickname, setUserNickname] = useState('익명');
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [messageTargetUser, setMessageTargetUser] = useState<User | null>(null);
  const [showReport, setShowReport] = useState(false);
  useEffect(() => {
    const fetch = async () => {
      const docRef = doc(db, 'posts', postId!);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as PostData;
        setPost({ ...data, id: postId! });

        const reaction = data.reactions?.find((r) => r.userId === userId)?.type || null;
        setUserReaction(reaction);
      }

      if (userId !== 'anonymous') {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserNickname(userSnap.data().nickname);
        }
      }
    };
    fetch();
  }, [postId, userId]);

  const handleSendMessageRequest = async (message: string) => {
    if (!messageTargetUser || userId === 'anonymous') return;
    const requestId = `req_${Date.now()}`;
    await setDoc(doc(db, 'messageRequests', requestId), {
      id: requestId,
      fromUserId: userId,
      toUserId: messageTargetUser.id,
      message,
      status: 'pending',
      timestamp: Date.now(),
    });
    alert('메시지 요청을 보냈습니다!');
    setMessageTargetUser(null);
  };

  const handleCommentSubmit = async () => {
    if (!post || !commentInput.trim()) return;
    const ref = doc(db, 'posts', postId!);
    await updateDoc(ref, {
      comments: arrayUnion({ user: userNickname, userId, text: commentInput }),
    });
    setPost({
      ...post,
      comments: [...(post.comments || []), { user: userNickname, userId, text: commentInput }],
    });
    setCommentInput('');
  };

  const handleDeleteComment = async (idx: number) => {
    if (!post) return;
    const updatedComments = [...(post.comments || [])];
    if (updatedComments[idx].userId !== userId) return;
    updatedComments.splice(idx, 1);
    await updateDoc(doc(db, 'posts', postId!), {
      comments: updatedComments,
    });
    setPost({ ...post, comments: updatedComments });
  };

  const handleEditSubmit = async () => {
    if (editingIdx === null || !editText.trim() || !post) return;
    const updatedComments = [...(post.comments || [])];
    if (updatedComments[editingIdx].userId !== userId) return;
    updatedComments[editingIdx].text = editText;
    await updateDoc(doc(db, 'posts', postId!), {
      comments: updatedComments,
    });
    setPost({ ...post, comments: updatedComments });
    setEditingIdx(null);
    setEditText('');
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!post) return;
    const ref = doc(db, 'posts', postId!);
    if (userReaction === type) return;

    const updates: any = {
      reactions: arrayUnion({ userId, type }),
    };

    if (type === 'like') {
      updates.likes = increment(1);
      if (userReaction === 'dislike') updates.dislikes = increment(-1);
    } else {
      updates.dislikes = increment(1);
      if (userReaction === 'like') updates.likes = increment(-1);
    }

    await updateDoc(ref, updates);
    setUserReaction(type);
    setPost({
      ...post,
      likes: (post.likes || 0) + (type === 'like' ? 1 : userReaction === 'like' ? -1 : 0),
      dislikes: (post.dislikes || 0) + (type === 'dislike' ? 1 : userReaction === 'dislike' ? -1 : 0),
    });
  };

  const handleNicknameClick = async (targetUserId: string) => {
    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setMessageTargetUser({ ...(userSnap.data() as User), id: targetUserId });
    }
  };

  const handleReportButtonClick = () => {
    setShowReport(true); // 신고 모달 열기
  };

  if (!post) return <div className="p-4">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-white to-blue-100 px-4 py-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-pink-600 underline">
        ← 뒤로가기
      </button>

      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 max-w-xl mx-auto">
        <div
          className="text-pink-600 font-bold text-lg cursor-pointer hover:underline"
          onClick={() => handleNicknameClick(post.user.userId)}
        >
          {post.user.nickname}
        </div>

    {/* 신고 버튼 추가 */}
    <button
          onClick={handleReportButtonClick}
          className="text-red-500 hover:text-red-600"
        >
          신고
        </button>

        <p className="text-gray-800 text-sm whitespace-pre-line">{post.content}</p>

        {post.imageUrls?.length > 0 && (
  <div className="flex gap-2 overflow-x-auto">
    {post.imageUrls.map((url, idx) => (
      <img
        key={idx}
        src={url}
        alt={`img-${idx}`}
        className="h-40 rounded-xl object-cover cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // ✅ 다른 이벤트로부터 분리
          setEnlargedImage(url); // ✅ 확대
        }}
      />
    ))}
  </div>
)}

        <div className="flex gap-4">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-1 text-pink-600 hover:text-pink-500 ${userReaction === 'like' ? 'font-bold' : ''}`}
          >
            <ThumbsUp className="w-4 h-4" /> {post.likes}
          </button>
          <button
            onClick={() => handleReaction('dislike')}
            className={`flex items-center gap-1 text-pink-600 hover:text-pink-500 ${userReaction === 'dislike' ? 'font-bold' : ''}`}
          >
            <ThumbsDown className="w-4 h-4" /> {post.dislikes}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex gap-2 items-center">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 px-3 py-2 text-sm border rounded-lg"
            />
            <button onClick={handleCommentSubmit} className="text-pink-600">
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {post.comments?.map((c, idx) => (
              <div key={idx} className="text-sm border-t pt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className="text-pink-600 font-semibold cursor-pointer hover:underline"
                      onClick={() => handleNicknameClick(c.userId)}
                    >
                      {c.user}
                    </span>
                    {editingIdx === idx ? null : <span className="ml-2">{c.text}</span>}
                  </div>
                  {c.userId === userId && editingIdx !== idx && (
                    <div className="text-xs space-x-2">
                      <button
                        className="text-pink-500"
                        onClick={() => {
                          setEditingIdx(idx);
                          setEditText(c.text);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="text-gray-400"
                        onClick={() => handleDeleteComment(idx)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {editingIdx === idx && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-1 border border-pink-300 rounded-md text-sm"
                    />
                    <div className="text-xs space-x-2 text-right">
                      <button className="text-pink-600" onClick={handleEditSubmit}>
                        저장
                      </button>
                      <button
                        className="text-gray-500"
                        onClick={() => setEditingIdx(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setEnlargedImage(null)}
        >
          <img src={enlargedImage} alt="확대 이미지" className="max-w-full max-h-full rounded-lg shadow-lg" />
        </div>
      )}

      {messageTargetUser && (
        <MessageRequestModal
          targetUser={messageTargetUser}
          onSend={() => alert('메시지 요청 기능은 메인에서 처리됩니다.')}
          onClose={() => setMessageTargetUser(null)}
        />
      )}

{messageTargetUser && (
  <MessageRequestModal
    targetUser={messageTargetUser}
    onSend={handleSendMessageRequest}
    onClose={() => setMessageTargetUser(null)}
  />
)}
    </div>
  );
};
