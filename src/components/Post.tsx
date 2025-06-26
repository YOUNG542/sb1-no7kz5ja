import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';

interface SimplifiedUser {
  nickname: string;
  userId: string;
}

interface PostProps {
  postId: string;
  user: SimplifiedUser;
  content: string;
  imageUrls: string[];
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  likes: number;
  dislikes: number;
  currentUserId: string;
  userReaction: 'like' | 'dislike' | null;
  comments: { user: string; userId: string; text: string }[];
  onComment: (postId: string, comment: string) => void;
  onDeleteComment: (postId: string, idx: number) => void;
  onEditComment: (postId: string, idx: number, newText: string) => void;
  onNicknameClick: (nickname: string, userId: string) => void;
  onImageClick: (url: string) => void;
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
  currentUserId,
  comments,
  onComment,
  onDeleteComment,
  onEditComment,
  onNicknameClick,
  onImageClick
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleCommentSubmit = () => {
    if (commentInput.trim()) {
      onComment(postId, commentInput);
      setCommentInput('');
    }
  };

  const handleEdit = (idx: number, text: string) => {
    setEditingIdx(idx);
    setEditText(text);
  };

  const handleEditSubmit = () => {
    if (editingIdx !== null && editText.trim()) {
      onEditComment(postId, editingIdx, editText);
      setEditingIdx(null);
      setEditText('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-200 via-pink-100 to-blue-200 border border-pink-100 rounded-2xl shadow-md p-5 mb-6 max-w-md w-[90%] mx-auto space-y-4 animate-fade-in">

<div
  className="text-pink-600 text-sm font-medium underline underline-offset-2 cursor-pointer hover:opacity-80 transition"
  onClick={() => onNicknameClick(user.nickname, user.userId)}
>
  {user.nickname}
</div>

      <p className="text-gray-800 text-sm leading-relaxed">{content}</p>

      {imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`post-img-${idx}`}
              className="rounded-xl h-36 object-cover flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
              onClick={() => onImageClick(url)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => onLike(postId)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-pink-600 hover:bg-pink-100 transition ${
            userReaction === 'like' ? 'bg-pink-200 font-semibold' : ''
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {likes}
        </button>
        <button
          onClick={() => onDislike(postId)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-pink-600 hover:bg-pink-100 transition ${
            userReaction === 'dislike' ? 'bg-pink-200 font-semibold' : ''
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          {dislikes}
        </button>
      </div>

      <div className="pt-3 border-t border-pink-100">
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글 달기..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-pink-300"
          />
          <button
            onClick={handleCommentSubmit}
            className="text-pink-500 hover:text-pink-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {comments.map((c, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
              <div className="flex justify-between items-start">
                <div>
                <span
  className="text-pink-600 font-medium underline underline-offset-2 cursor-pointer hover:opacity-80 transition"
  onClick={() => onNicknameClick(c.user, c.userId)}
>
  {c.user}
</span>
                  <span className="ml-2">{editingIdx === idx ? null : c.text}</span>
                </div>
                {c.userId === currentUserId && editingIdx !== idx && (
                  <div className="text-xs space-x-2">
                    <button
                      className="text-pink-500"
                      onClick={() => handleEdit(idx, c.text)}
                    >
                      수정
                    </button>
                    <button
                      className="text-gray-400"
                      onClick={() => onDeleteComment(postId, idx)}
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
                    <button className="text-gray-500" onClick={() => setEditingIdx(null)}>
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
  );
};
