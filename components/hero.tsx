import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-foreground/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-background">
        <p className="text-sm uppercase tracking-[0.2em] mb-6 text-background/70">
          Intellectual Property Litigation
        </p>
        
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-balance mb-8">
          Protecting Your Innovation in China
        </h1>
        
        <p className="text-lg sm:text-xl text-background/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          A track record of landmark victories for Fortune 500 companies. 
          We navigate the complexities of cross-border IP enforcement with precision and excellence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="group" asChild>
            <Link href="#cases">
              View Landmark Cases
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background" asChild>
            <Link href="#contact">
              Schedule Consultation
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/60">
        <div className="w-px h-16 bg-background/30 mx-auto mb-2" />
        <span className="text-xs uppercase tracking-wider">Scroll</span>
      </div>
    </section>
  )
}
