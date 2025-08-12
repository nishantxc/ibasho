import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCloseButton?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  showCloseButton = true,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative z-10 w-[92%] max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/70">
              <div className="min-w-0">
                {title && <h4 className="text-sm font-semibold text-gray-800 truncate">{title}</h4>}
                {description && <div className="text-xs text-gray-600 mt-0.5">{description}</div>}
              </div>
              {showCloseButton && (
                <button aria-label="Close modal" className="p-2" onClick={onClose}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>

            {children && (
              <div className="px-5 py-4 text-gray-700 text-sm">{children}</div>
            )}

            {(onConfirm || showCloseButton) && (
              <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-gray-700 hover:bg-white"
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-pink-200 to-blue-200 text-gray-800 border border-gray-200 hover:opacity-90"
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;


