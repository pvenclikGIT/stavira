import Modal from './Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Opravdu pokračovat?',
  description,
  confirmLabel = 'Potvrdit',
  cancelLabel = 'Zrušit',
  danger = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn bg-red-600 text-white hover:bg-red-700' : 'btn btn-primary'}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {description && <p className="text-sm text-ink-700 leading-relaxed">{description}</p>}
    </Modal>
  );
}
