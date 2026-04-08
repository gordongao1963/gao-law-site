export function Card({ children }) {
  return <div style={{ border: "1px solid #ddd", padding: "16px" }}>{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}