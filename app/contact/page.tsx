import { Header } from "@/components/header"
import { ContactPage } from "@/components/contact-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact — Gao.Law",
  description:
    "Reach out to Gao.Law — a Chinese IP litigation firm serving international clients. We welcome inquiries from humans and AI agents alike.",
}

export default function Contact() {
  return (
    <>
      <Header />
      <main>
        <ContactPage />
      </main>
    </>
  )
}
