import React, { useState } from 'react';

// ❗ User 전체 타입 import 제거
// import { User } from '../types';

// ✅ 필요한 필드만 가진 간단한 타입 정의
interface SimplifiedUser {
  nickname: string;
}

interface PostProps {
  postId: string;
  user: SimplifiedUser; // ✅ 여기만 바뀐 것!
  content: string;
  imageUrls: string[];
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
  comments: { user: string; text: string }[];
  onComment: (postId: string, comment: string) => void;
}

export const Post: React.FC<PostProps> = ({
  postId,
  user,
  content,
  imageUrls,
  onLike,
  onDislike,
  likes,
  dislikes,
  userReaction,
  comments,
  onComment,
}) => {
  const [commentInput, setCommentInput] = useState('');

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      onComment(postId, commentInput);
      setCommentInput('');
    }
  };

  return (
    <div className="border rounded-xl p-4 mb-4 bg-white shadow-md">
      <div className="text-sm text-gray-600 mb-2">{user.nickname}</div>
      <p className="mb-2 text-base">{content}</p>
      {imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-scroll mb-2">
          {imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`post-img-${idx}`}
              className="h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mb-2">
        <button
          className={`text-sm ${userReaction === 'like' ? 'text-blue-600' : 'text-gray-600'}`}
          onClick={() => onLike(postId)}
        >
          👍 {likes}
        </button>
        <button
          className={`text-sm ${userReaction === 'dislike' ? 'text-red-600' : 'text-gray-600'}`}
          onClick={() => onDislike(postId)}
        >
          👎 {dislikes}
        </button>
      </div>
      <div className="mt-2">
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="w-full border rounded px-3 py-1 text-sm mb-1"
        />
        <button
          onClick={handleCommentSubmit}
          className="text-xs text-blue-600 hover:underline"
        >
          댓글 달기
        </button>
        <div className="mt-2 text-sm text-gray-700">
          {comments.map((c, idx) => (
            <div key={idx} className="border-t pt-1 mt-1">
              <strong>{c.user}</strong>: {c.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
