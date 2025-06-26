import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Post } from './Post';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MessageRequestModal } from './MessageRequestModal';
import { User } from '../types';
import { query, orderBy } from 'firebase/firestore';

interface PostFeedProps {
  onGoToUpload: () => void;
}

interface PostData {
  id: string;
  user: { nickname: string; userId: string };
  content: string;
  imageUrls?: string[];
  likes?: number;
  dislikes?: number;
  reactions?: { userId: string; type: 'like' | 'dislike' }[];
  comments?: { user: string; userId: string; text: string }[];
}

export const PostFeed: React.FC<PostFeedProps> = ({ onGoToUpload }) => {

  const [posts, setPosts] = useState<PostData[]>([]);
  const [userReactionMap, setUserReactionMap] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [userNickname, setUserNickname] = useState('익명');
  const [messageTargetUser, setMessageTargetUser] = useState<User | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const auth = getAuth();
  const userId = auth.currentUser?.uid || 'anonymous';

  useEffect(() => {
    const fetchNickname = async () => {
      if (userId === 'anonymous') return;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const nickname = userSnap.data().nickname;
        setUserNickname(nickname);
      }
    };
    fetchNickname();
  }, [userId]);

  useEffect(() => {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc') // 최신순 정렬!
    );
  
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const data: PostData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as PostData));
  
      const reactionState: Record<string, 'like' | 'dislike' | null> = {};
      data.forEach((post) => {
        const reaction = post.reactions?.find((r) => r.userId === userId);
        reactionState[post.id] = reaction?.type ?? null;
      });
  
      setPosts(data);
      setUserReactionMap(reactionState);
    });
  
    return () => unsubscribe();
  }, [userId]);

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const ref = doc(db, 'posts', postId);
    const currentReaction = userReactionMap[postId];

    if (currentReaction === 'like') return;

    const updates: any = {
      reactions: arrayUnion({ userId, type: 'like' }),
    };

    if (currentReaction === 'dislike') {
      updates.likes = increment(1);
      updates.dislikes = increment(-1);
    } else {
      updates.likes = increment(1);
    }

    const newReactions = post.reactions?.filter(r => !(r.userId === userId)) || [];
    await updateDoc(ref, {
      ...updates,
      reactions: [...newReactions, { userId, type: 'like' }]
    });
  };

  const handleDislike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const ref = doc(db, 'posts', postId);
    const currentReaction = userReactionMap[postId];

    if (currentReaction === 'dislike') return;

    const updates: any = {
      reactions: arrayUnion({ userId, type: 'dislike' }),
    };

    if (currentReaction === 'like') {
      updates.likes = increment(-1);
      updates.dislikes = increment(1);
    } else {
      updates.dislikes = increment(1);
    }

    const newReactions = post.reactions?.filter(r => !(r.userId === userId)) || [];
    await updateDoc(ref, {
      ...updates,
      reactions: [...newReactions, { userId, type: 'dislike' }]
    });
  };

  const handleMessageRequest = async (targetUserId: string, message: string) => {
    if (userId === 'anonymous') {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const timestamp = Date.now();
      const customId = `req_${timestamp}`;

      await setDoc(doc(db, 'messageRequests', customId), {
        id: customId,
        fromUserId: userId,
        toUserId: targetUserId,
        message,
        timestamp,
        status: 'pending',
      });

      alert('메시지 요청을 보냈습니다!');
    } catch (error) {
      console.error('메시지 요청 실패:', error);
      alert('요청에 실패했습니다.');
    }
  };

  const handleComment = async (postId: string, text: string) => {
    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
      comments: arrayUnion({ user: userNickname, userId, text }),
    });
  };

  const handleDeleteComment = async (postId: string, idx: number) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) return;

    const targetComment = post.comments[idx];
    if (!targetComment || targetComment.userId !== userId) return;

    const updatedComments = post.comments.filter((_, i) => i !== idx);
    await updateDoc(postRef, { comments: updatedComments });
  };

  const handleEditComment = async (postId: string, idx: number, newText: string) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) return;

    const targetComment = post.comments[idx];
    if (!targetComment || targetComment.userId !== userId) return;

    const updatedComments = [...post.comments];
    updatedComments[idx].text = newText;
    await updateDoc(postRef, { comments: updatedComments });
  };

  const handleNicknameClick = async (_nickname: string, targetUserId: string) => {
    const userRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setMessageTargetUser({ ...(userSnap.data() as User), id: targetUserId });
    }
  };

  
  return (
    <div className="px-4 pt-8 pb-20 w-full flex flex-col items-center bg-pink-50 min-h-screen">
      {/* ✅ 상단 제목 + 펜 버튼 */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-600 tracking-tight">포스트 피드</h2>
        <button
          onClick={onGoToUpload}
          className="text-pink-500 hover:text-pink-700 transition"
          title="글쓰기"
        >
          <Pencil size={22} />
        </button>
      </div>
  
      {/* ✅ 포스트 리스트 */}
      <div className="w-full max-w-md space-y-6">
        {posts.map((post) => (
          <Post
            key={post.id}
            postId={post.id}
            user={{ nickname: post.user.nickname, userId: post.user.userId }}
            content={post.content}
            imageUrls={post.imageUrls || []}
            likes={post.likes || 0}
            dislikes={post.dislikes || 0}
            userReaction={userReactionMap[post.id] || null}
            comments={post.comments?.map((c) => ({
              user: c.user,
              text: c.text,
              userId: c.userId || 'anonymous',
            })) || []}
            onLike={handleLike}
            onDislike={handleDislike}
            onComment={handleComment}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
            currentUserId={userId}
            onNicknameClick={handleNicknameClick}
            onImageClick={setEnlargedImage}
          />
        ))}
      </div>
  
      {/* 쪽지 모달 */}
      {messageTargetUser && (
        <MessageRequestModal
          targetUser={messageTargetUser}
          onSend={(message) =>
            handleMessageRequest(messageTargetUser.id, message)
          }
          onClose={() => setMessageTargetUser(null)}
        />
      )}
  
      {/* ✅ 확대 이미지 모달 */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setEnlargedImage(null)}
        >
          <img
            src={enlargedImage}
            alt="확대 이미지"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
  
};