import React, { useState } from 'react';

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
  currentUserId, // ✅ props로 받아옴
  comments,
  onComment,
  onDeleteComment, // ✅ props로 받아옴
  onEditComment,   // ✅ props로 받아옴
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
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-4 mb-6 max-w-md w-[90%] mx-auto space-y-3 animate-fade-in">
      <div
        className="text-blue-600 font-semibold text-sm cursor-pointer"
        onClick={() => onNicknameClick(user.nickname, user.userId)}
      >
        {user.nickname}
      </div>
  
      <p className="text-gray-800 text-sm">{content}</p>
  
      {imageUrls.length > 0 && (
  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
    {imageUrls.map((url, idx) => (
      <img
        key={idx}
        src={url}
        alt={`post-img-${idx}`}
        className="rounded-xl h-36 object-cover flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onImageClick(url)} // ✅ 이미지 클릭 시 확대
      />
    ))}
  </div>
)}

  
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <button
          className={`transition-colors duration-200 ${
            userReaction === 'like' ? 'text-blue-500' : 'hover:text-blue-400'
          }`}
          onClick={() => onLike(postId)}
        >
          👍 {likes}
        </button>
        <button
          className={`transition-colors duration-200 ${
            userReaction === 'dislike' ? 'text-red-500' : 'hover:text-red-400'
          }`}
          onClick={() => onDislike(postId)}
        >
          👎 {dislikes}
        </button>
      </div>
  
      <div className="pt-2 border-t border-gray-100">
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
        <button
          onClick={handleCommentSubmit}
          className="text-blue-600 hover:underline text-xs mt-1"
        >
          댓글 달기
        </button>
  
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {comments.map((c, idx) => (
            <div key={idx} className="border-t pt-2">
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className="text-blue-600 font-medium cursor-pointer"
                    onClick={() => onNicknameClick(c.user, c.userId)}
                  >
                    {c.user}
                  </span>
                  <span className="ml-2">{editingIdx === idx ? null : c.text}</span>
                </div>
  
                {c.userId === currentUserId && editingIdx !== idx && (
                  <div className="text-xs space-x-2">
                    <button
                      className="text-blue-500"
                      onClick={() => handleEdit(idx, c.text)}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500"
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
                    className="w-full px-3 py-1 border rounded-md text-sm"
                  />
                  <div className="text-xs space-x-2 text-right">
                    <button className="text-blue-600" onClick={handleEditSubmit}>
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
