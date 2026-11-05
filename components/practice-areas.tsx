import { Shield, FileText, Lock, Scale, Copyright } from "lucide-react"

const practices = [
  {
    icon: Shield,
    title: "Patent Litigation",
    description: "Aggressive enforcement and defense of patent rights across all technology sectors, from semiconductors to pharmaceuticals.",
  },
  {
    icon: FileText,
    title: "Trademark Protection",
    description: "Comprehensive trademark enforcement including counterfeit seizures, domain disputes, and brand protection strategies.",
  },
  {
    icon: Lock,
    title: "Trade Secret Litigation",
    description: "Protecting proprietary information through litigation, injunctions, and cross-border coordination with law enforcement.",
  },
  {
    icon: Scale,
    title: "IP Licensing",
    description: "Strategic licensing arrangements between the world's largest telecommunications licensees and licensors, ensuring profitable technology transfer.",
  },
  {
    icon: Copyright,
    title: "Copyright Litigation",
    description: "Protecting original works and digital content through enforcement actions, anti-infringement strategies, and international coordination.",
  },
]

export function PracticeAreas() {
  return (
    <section id="practice" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Our Practice
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-6">
            Comprehensive IP Protection
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We bring decades of experience to every matter, combining deep knowledge 
            of Chinese law with an understanding of American business priorities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {practices.map((practice) => (
            <div 
              key={practice.title}
              className="group p-6 border border-border hover:border-foreground/20 transition-colors"
            >
              <practice.icon className="h-8 w-8 mb-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              <h3 className="font-medium text-lg mb-3">{practice.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {practice.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
