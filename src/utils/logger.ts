export const Logger = {
    info: (message: string, data?: any) => {
    },
    error: (message: string, data?: any) => {
      console.error(`[ERROR] ${message}`, data || '');
    },
  };
  