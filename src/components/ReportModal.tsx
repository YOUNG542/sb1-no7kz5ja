import React, { useState } from 'react';
import { db } from '../firebase/config'; // 👉 Firebase Firestore 인스턴스
import { storage } from '../firebase/config'; // 👉 Firebase Storage 인스턴스

import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ReportModalProps {
    targetUserId: string;
    onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ targetUserId, onClose }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!text && !image) return;
        setLoading(true);

        const reportData: any = {
            reportedUserId: targetUserId,
            text,
            timestamp: Date.now(),
        };

        // ✅ 이미지 업로드 (선택적)
        if (image) {
            const storageRef = ref(storage, `reports/${targetUserId}_${Date.now()}`);
            await uploadBytes(storageRef, image);
            const downloadURL = await getDownloadURL(storageRef);
            reportData.imageUrl = downloadURL;
        }

        await addDoc(collection(db, 'reports'), reportData);
        setLoading(false);
        onClose();
    };

    // 모달 밖 클릭 시 모달 닫기 방지
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 부모 이벤트 전파 차단
    };

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={handleModalClick}>
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-3">신고하기</h2>
                <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows={4}
                    placeholder="신고 사유를 입력해주세요"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="text-gray-500 text-sm">취소</button>
                    <button onClick={handleSubmit} disabled={loading} className="text-red-500 font-semibold text-sm">
                        {loading ? '제출 중...' : '제출'}
                    </button>
                </div>
            </div>
        </div>
    );
};
