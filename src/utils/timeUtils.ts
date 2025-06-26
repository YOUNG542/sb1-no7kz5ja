export const isMaintenanceTime = (): boolean => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
  
    const currentMinutes = hour * 60 + minute;
    const start = 9 * 60 + 50;  // 9:50
    const end = 17 * 60;        // 17:00
  
    return currentMinutes >= start && currentMinutes < end;
  };