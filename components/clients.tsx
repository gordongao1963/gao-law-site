const industries = [
  "Technology",
  "Pharmaceuticals", 
  "Automotive",
  "Consumer Electronics",
  "Luxury Goods",
  "Medical Devices",
  "Semiconductors",
  "Software",
]

export function Clients() {
  return (
    <section className="py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Client Industries
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We serve Fortune 500 companies and industry leaders across sectors where 
            intellectual property is the cornerstone of competitive advantage.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {industries.map((industry) => (
            <span 
              key={industry}
              className="px-4 py-2 text-sm border border-border hover:border-foreground/30 transition-colors"
            >
              {industry}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
