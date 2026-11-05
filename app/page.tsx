import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { PracticeAreas } from "@/components/practice-areas"
import { LandmarkCases } from "@/components/landmark-cases"
import { About } from "@/components/about"
import { Clients } from "@/components/clients"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Stats />
        <PracticeAreas />
        <LandmarkCases />
        <About />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
