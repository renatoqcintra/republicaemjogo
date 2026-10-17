import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}

export function Modal({ title, children, onClose, closeLabel = 'Fechar' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal" tabIndex={-1} ref={ref}>
        <h3>{title}</h3>
        {children}
        {onClose && (
          <div className="btn-row">
            <button className="btn" onClick={onClose}>
              {closeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: ConfirmProps) {
  // O Modal é usado apenas como container acessível: os botões de confirmação
  // e cancelamento são específicos desta dialog (sem botão genérico duplicado).
  return (
    <Modal title={title}>
      <p className="muted">{message}</p>
      <div className="btn-row">
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
