import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export function TransactionModal({ isOpen, onClose, children, title }: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="relative w-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {children}
        </div>
      </div>
    </div>
  );
}