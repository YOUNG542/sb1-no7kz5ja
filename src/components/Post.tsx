import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ReportModal } from './ReportModal'; // 경로는 실제 위치에 따라 조정

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
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();
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
    <div
  className="relative bg-white border border-pink-200 rounded-2xl shadow-sm p-4 mb-6 max-w-md w-[90%] mx-auto space-y-4 transition hover:shadow-lg"
  onClick={() => navigate(`/posts/${postId}`)}
>
<div className="absolute top-2 left-4 flex items-center gap-1 z-10">
  <span
    className="text-pink-600 text-sm font-bold cursor-pointer hover:opacity-80"
    onClick={(e) => {
      e.stopPropagation();
      onNicknameClick(user.nickname, user.userId);
    }}
  >
    {user.nickname}
  </span>

  <button
    onClick={(e) => {
      e.stopPropagation();
      setShowReport(true);
    }}
    className="text-red-500 hover:text-red-600"
  >
    <AlertCircle size={16} />
  </button>
</div>

       {/* 이미지 */}
    {imageUrls.length > 0 && (
      <div className="w-full rounded-xl overflow-hidden aspect-[4/3] mt-6">
        {/* ← 닉네임과 간격 확보를 위해 mt-6 추가 */}
        <img
          src={imageUrls[0]}
          alt="post"
          className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick(imageUrls[0]);
          }}
        />
      </div>
    )}

      {/* 본문 내용 */}
    <div className="text-gray-800 text-[15px] leading-relaxed break-words whitespace-pre-line">
      {content}
    </div>


      {/* 좋아요 / 싫어요 버튼 */}
      <div className="flex items-center gap-3 text-sm">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike(postId);
        }}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-pink-600 hover:bg-pink-100 transition ${
          userReaction === 'like' ? 'bg-pink-200 font-semibold' : ''
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        {likes}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDislike(postId);
        }}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-pink-600 hover:bg-pink-100 transition ${
          userReaction === 'dislike' ? 'bg-pink-200 font-semibold' : ''
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikes}
      </button>
    </div>
      {/* 댓글 입력창 */}
<div className="pt-2 border-t border-pink-100">
  <div className="flex items-center gap-2 mt-3">
    <input
      type="text"
      value={commentInput}
      onChange={(e) => setCommentInput(e.target.value)}
      placeholder="댓글 달기..."
      className="flex-[0.9] px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-pink-300"
    />
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCommentSubmit();
      }}
      className="w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] text-pink-500 hover:text-pink-600 flex items-center justify-center rounded-full bg-white border border-gray-200"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
        {/* 댓글 목록 */}
        <div className="mt-4 space-y-2 text-sm">
          {comments.map((c, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className="text-pink-600 font-medium underline cursor-pointer hover:opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNicknameClick(c.user, c.userId);
                    }}
                  >
                    {c.user}
                  </span>
                  <span className="ml-2">{editingIdx === idx ? null : c.text}</span>
                </div>
                {c.userId === currentUserId && editingIdx !== idx && (
                  <div className="text-xs space-x-2">
                    <button
                      className="text-pink-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(idx, c.text);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="text-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteComment(postId, idx);
                      }}
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
                    <button
                      className="text-pink-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubmit();
                      }}
                    >
                      저장
                    </button>
                    <button
                      className="text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIdx(null);
                      }}
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
  );
};