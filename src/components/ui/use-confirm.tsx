"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmContextType = {
  confirm: (msg: string, titleStr?: string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Xác nhận thao tác');

  const confirm = (msg: string, titleStr = 'Xác nhận thao tác') => {
    setMessage(msg);
    setTitle(titleStr);
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    promise?.resolve(false);
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    setPromise(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {promise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {title}
              </h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Hủy bỏ
              </button>
              <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
