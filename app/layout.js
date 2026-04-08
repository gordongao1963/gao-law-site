import "../styles/globals.css";

export const metadata = {
  title: "Elite Cross-Border IP Litigation",
  description: "Strategic IP litigation across jurisdictions"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}