import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getCountFromServer } from 'firebase/firestore';

// 🔧 Firebase 설정 (네 프로젝트에 맞게 바꿔야 함)
const firebaseConfig = {
  apiKey: 'AIzaSyDYsfLDmWTbt68PAIzpAeZ6ij7rwP_RWHk',
  authDomain: 'honggaeting1.firebaseapp.com',
  projectId: 'honggaeting1',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ 날짜별 DAU를 가져오는 함수
export const getDAUForDates = async (dates: string[]) => {
  const results: { date: string; count: number }[] = [];

  for (const date of dates) {
    const colRef = collection(db, `dailyActiveUsers/${date}/users`);
    const snapshot = await getCountFromServer(colRef);
    const count = snapshot.data().count;
    results.push({ date, count });
  }

  return results;
};

// ✅ 날짜 리스트를 수동으로 넣거나 자동 생성도 가능
const dates = ['2025-06-23', '2025-06-24', '2025-06-25'];

// ✅ 실행
getDAUForDates(dates).then((results) => {
  console.log('📊 날짜별 DAU 통계');
  results.forEach(({ date, count }) => {
    console.log(`${date}: ${count}명`);
  });
});
