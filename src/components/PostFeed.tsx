import React, { useState, useEffect } from 'react';
import { Post } from './Post';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { PostUploadForm } from './PostUploadForm';
import { getDoc } from 'firebase/firestore';
interface PostData {
    id: string;
    user: { nickname: string };
    content: string;
    imageUrls?: string[];
    likes?: number;
    dislikes?: number;
    reactions?: { userId: string; type: 'like' | 'dislike' }[];
    comments?: { user: string; userId: string; text: string }[];
  }

export const PostFeed: React.FC = () => {
    const [posts, setPosts] = useState<PostData[]>([]);
  const [userReactionMap, setUserReactionMap] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [userNickname, setUserNickname] = useState('익명'); // ✅ 닉네임 상태 추가

  const auth = getAuth();
  const userId = auth.currentUser?.uid || 'anonymous';

// ✅ 닉네임 불러오기 useEffect
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
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
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
  
    if (currentReaction === 'like') return; // ✅ 이미 좋아요 누름
  
    const updates: any = {
      reactions: arrayUnion({ userId, type: 'like' }),
    };
  
    if (currentReaction === 'dislike') {
      // 싫어요 취소하고 좋아요로 전환
      updates.likes = increment(1);
      updates.dislikes = increment(-1);
      updates.reactionsToRemove = { userId, type: 'dislike' };
    } else {
      // 순수 좋아요
      updates.likes = increment(1);
    }
  
    // 먼저 기존 reactions에서 제거 (Firestore에서는 수동으로)
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
  
    if (currentReaction === 'dislike') return; // ✅ 이미 싫어요 누름
  
    const updates: any = {
      reactions: arrayUnion({ userId, type: 'dislike' }),
    };
  
    if (currentReaction === 'like') {
      // 좋아요 취소하고 싫어요로 전환
      updates.likes = increment(-1);
      updates.dislikes = increment(1);
    } else {
      // 순수 싫어요
      updates.dislikes = increment(1);
    }
  
    // 기존 reactions 배열에서 userId 제거 후 새로 추가
    const newReactions = post.reactions?.filter(r => !(r.userId === userId)) || [];
    await updateDoc(ref, {
      ...updates,
      reactions: [...newReactions, { userId, type: 'dislike' }]
    });
  };
  
    // ✅ 댓글 작성 시 닉네임 사용
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
  
    const updatedComments = post.comments.filter((_, i) => i !== idx);
    await updateDoc(postRef, { comments: updatedComments });
  };
  
  const handleEditComment = async (postId: string, idx: number, newText: string) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.comments) return;
  
    const updatedComments = [...post.comments];
    updatedComments[idx].text = newText;
    await updateDoc(postRef, { comments: updatedComments });
  };

  return (
    <div className="p-4">
      <PostUploadForm /> {/* ✅ 포스트 탭 상단 고정 글쓰기 UI */}
      
      {posts.map((post) => (
        <Post
        key={post.id}
        postId={post.id}
        user={post.user}
        content={post.content}
        imageUrls={post.imageUrls || []}
        likes={post.likes || 0}
        dislikes={post.dislikes || 0}
        userReaction={userReactionMap[post.id] || null}
        comments={post.comments?.map(c => ({
          user: c.user,
          text: c.text,
          userId: c.userId || 'anonymous', // ✅ 예외 처리
        })) || []}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={handleComment}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleEditComment}
        currentUserId={userId} // ✅ 여기 추가!
      />
      ))}
    </div>
  );
  
};
