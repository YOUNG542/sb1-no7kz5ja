// checkDAU.ts
import { db } from '../firebase/config'; // ✅ 기존 config.ts에서 불러오기
import { collection, getCountFromServer } from 'firebase/firestore';

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
