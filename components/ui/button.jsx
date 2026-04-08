export function Button({ children, ...props }) {
  return (
    <button {...props} style={{ padding: "10px 16px", cursor: "pointer" }}>
      {children}
    </button>
  );
}