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
  const auth = getAuth();
  const userId = auth.currentUser?.uid || 'anonymous';

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
    if (userReactionMap[postId] === 'like') return; // 중복 방지

    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
      likes: increment(1),
      reactions: arrayUnion({ userId, type: 'like' }),
    });
  };

  const handleDislike = async (postId: string) => {
    if (userReactionMap[postId] === 'dislike') return; // 중복 방지

    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
      dislikes: increment(1),
      reactions: arrayUnion({ userId, type: 'dislike' }),
    });
  };

  const handleComment = async (postId: string, text: string) => {
    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
      comments: arrayUnion({ user: userId, userId, text }), 
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
