import "@/app/globals.css";
export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <html>
      <body>{children}</body>
    </html>
    </>
  )
}