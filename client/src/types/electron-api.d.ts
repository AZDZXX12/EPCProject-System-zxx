declare global {
  interface Window {
    electronAPI?: {
      openDatabaseFolder: () => Promise<void>;
    };
  }
}

export {};
