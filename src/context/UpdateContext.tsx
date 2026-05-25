import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { verificarAtualizacao, UpdateInfo } from '../services/updateService';

interface UpdateContextData {
  updateInfo: UpdateInfo | null;
  checked: boolean;
  dismiss: () => void;
}

const UpdateContext = createContext<UpdateContextData>({
  updateInfo: null,
  checked: false,
  dismiss: () => {},
});

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const info = await verificarAtualizacao();
      setUpdateInfo(info);
      setChecked(true);
    })();
  }, []);

  const dismiss = useCallback(() => setUpdateInfo(null), []);

  return (
    <UpdateContext.Provider value={{ updateInfo, checked, dismiss }}>
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate() {
  return useContext(UpdateContext);
}
