export default function ModalLayout({ title, children, onClose }) {
  return (
    <div>
      <div>
        <h2>{title}</h2>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>

      <hr />

      <div>{children}</div>
    </div>
  );
}