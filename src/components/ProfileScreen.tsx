import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import { ComplaintForm } from './ComplaintForm';

interface PostData {
  id: string;
  content: string;
  imageUrls?: string[];
}

export const ProfileScreen: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [genderSet, setGenderSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showComplaint, setShowComplaint] = useState(false);
  const [myPosts, setMyPosts] = useState<PostData[]>([]);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNickname(data.nickname || '');
          setIntro(data.intro || '');
          setGender(data.gender || '');
          setGenderSet(!!data.gender);
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'posts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const post = doc.data() as PostData;
        const { id: _, ...rest } = post; // 기존 id 제거
        return { id: doc.id, ...rest };
      });
      setMyPosts(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nickname,
        intro,
        ...(genderSet ? {} : { gender }),
      });
      setGenderSet(true);
      setMessage('프로필이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error(error);
      setMessage('❌ 저장 실패. 다시 시도해주세요.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmDelete = window.confirm('정말로 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      alert('사용자 정보가 삭제되었습니다. 앱을 종료합니다.');
      window.close();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('❌ 삭제 중 문제가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;
  if (showComplaint) return <ComplaintForm onBack={() => setShowComplaint(false)} />;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">프로필 수정</h2>

      <label className="block text-sm font-medium mb-1">닉네임</label>
      <input
        className="w-full border rounded-lg p-2 mb-4"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={20}
        placeholder="닉네임을 입력하세요"
      />

      <label className="block text-sm font-medium mb-1">한 줄 소개</label>
      <input
        className="w-full border rounded-lg p-2 mb-4"
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        maxLength={50}
        placeholder="한 줄 소개를 입력하세요"
      />

      <label className="block text-sm font-medium mb-1">성별</label>
      <div className="flex gap-3 mb-4">
        {(['male', 'female'] as const).map((g) => (
          <button
            key={g}
            type="button"
            disabled={genderSet}
            onClick={() => setGender(g)}
            className={`w-full py-2 rounded-lg font-semibold border transition ${
              gender === g
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-700 border-gray-300'
            } ${genderSet ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {g === 'male' ? '남자' : '여자'}
          </button>
        ))}
      </div>
      {!genderSet && (
        <p className="text-xs text-red-500 mb-4">⚠️ 성별은 한 번 설정하면 변경할 수 없습니다.</p>
      )}

      <button
        className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
        onClick={handleSave}
      >
        저장하기
      </button>

      <button
        className="w-full mt-3 bg-gray-300 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
        onClick={handleDelete}
      >
        정보 삭제
      </button>

      <button
        onClick={() => setShowComplaint(true)}
        className="w-full mt-3 bg-yellow-300 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
      >
        불만사항 제출하기
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}

     <h2 className="text-lg font-bold mt-8 mb-2">내가 쓴 글</h2>
{myPosts.length === 0 && (
  <p className="text-sm text-gray-500">아직 작성한 글이 없습니다.</p>
)}
{myPosts.map((post) => (
  <div key={post.id} className="border p-3 rounded-lg mb-3 bg-white shadow-sm">
    {/* 수정 중이면 textarea, 아니면 텍스트 */}
    {editPostId === post.id ? (
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full border rounded p-2 text-sm mb-2"
      />
    ) : (
      <p className="text-sm text-gray-800 mb-1">{post.content}</p>
    )}

    {/* 이미지 미리보기 */}
    {post.imageUrls && post.imageUrls.length > 0 && (
      <div className="flex gap-2 overflow-x-auto mb-2">
        {post.imageUrls.map((url, idx) => (
          <img key={idx} src={url} className="h-24 rounded" />
        ))}
      </div>
    )}

    {/* 버튼: 수정 / 저장 / 취소 / 삭제 */}
    <div className="flex gap-4 text-xs">
      {editPostId === post.id ? (
        <>
          <button
            className="text-blue-500 underline"
            onClick={async () => {
              await updateDoc(doc(db, 'posts', post.id), { content: editContent });
              setEditPostId(null);
              setEditContent('');
            }}
          >
            저장
          </button>
          <button
            className="text-gray-500 underline"
            onClick={() => {
              setEditPostId(null);
              setEditContent('');
            }}
          >
            취소
          </button>
        </>
      ) : (
        <button
          className="text-blue-500 underline"
          onClick={() => {
            setEditPostId(post.id);
            setEditContent(post.content);
          }}
        >
          수정
        </button>
      )}

      <button
        className="text-red-500 underline"
        onClick={async () => {
          const ok = window.confirm('정말 삭제할까요?');
          if (!ok) return;
          try {
            await deleteDoc(doc(db, 'posts', post.id));
            alert('삭제되었습니다.');
          } catch (err) {
            alert('삭제 실패');
          }
        }}
      >
        삭제하기
      </button>
    </div>
  </div>
))}

    </div>
  );
};
