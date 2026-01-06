import { Message, User } from '../types';

const USER_KEY = 'flipbazzar_user';
const HISTORY_KEY = 'flipbazzar_history';

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getHistory: (): Message[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    
    // Revive Date objects
    return JSON.parse(data, (key, value) => {
      if (key === 'timestamp') return new Date(value);
      return value;
    });
  },

  saveHistory: (messages: Message[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  },

  clearSession: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(HISTORY_KEY);
  }
};