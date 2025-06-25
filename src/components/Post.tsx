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
    <div className="border rounded-xl p-4 mb-4 bg-white shadow-md">
      <span
          className="text-sm text-blue-600 font-semibold cursor-pointer mb-2 inline-block"
          onClick={() => onNicknameClick(user.nickname, user.userId)} // 🔄 userId도 전달해야 함
  >
       {user.nickname}
      </span>
      <p className="mb-2 text-base">{content}</p>
      {imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-scroll mb-2">
          {imageUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`post-img-${idx}`} className="h-40 object-cover rounded-lg" />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mb-2">
        <button className={`text-sm ${userReaction === 'like' ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => onLike(postId)}>
          👍 {likes}
        </button>
        <button className={`text-sm ${userReaction === 'dislike' ? 'text-red-600' : 'text-gray-600'}`} onClick={() => onDislike(postId)}>
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
        <button onClick={handleCommentSubmit} className="text-xs text-blue-600 hover:underline">댓글 달기</button>

        <div className="mt-2 text-sm text-gray-700">
          {comments.map((c, idx) => (
            <div key={idx} className="border-t pt-1 mt-1">
              <strong
  className="text-blue-600 cursor-pointer"
  onClick={() => onNicknameClick(c.user, c.userId)}
>
  {c.user}
</strong>:&nbsp;
              {editingIdx === idx ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border px-2 py-1 text-sm w-full"
                  />
                  <button className="text-blue-500 text-xs mr-2" onClick={handleEditSubmit}>저장</button>
                  <button className="text-gray-500 text-xs" onClick={() => setEditingIdx(null)}>취소</button>
                </>
              ) : (
                <>
                  {c.text}
                  {c.userId === currentUserId && (
                    <div className="text-xs mt-1 text-right">
                      <button className="text-blue-600 mr-2" onClick={() => handleEdit(idx, c.text)}>수정</button>
                      <button className="text-red-600" onClick={() => onDeleteComment(postId, idx)}>삭제</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
