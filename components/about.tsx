export function About() {
  return (
    <section id="about" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
              About the Practice
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-8">
              Bridging Two Legal Systems
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Founded in Beijing with deep roots in American legal practice, our firm 
                occupies a unique position at the intersection of two of the world&apos;s 
                most important legal systems.
              </p>
              <p>
                Our founding partner trained at top U.S. law schools and practiced at 
                leading American firms before establishing this practice to serve the 
                growing need for sophisticated IP enforcement in China.
              </p>
              <p>
                We understand both the letter of Chinese law and the practical realities 
                of enforcement. More importantly, we understand what American companies 
                need: clear communication, predictable timelines, and results that 
                translate into business value.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] bg-muted border border-border">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2670&auto=format&fit=crop')",
                }}
              />
            </div>
            <div className="absolute -bottom-8 -left-8 p-6 bg-background border border-border max-w-xs">
              <p className="font-serif text-lg mb-2">
                &ldquo;Excellence is not a single act, but a habit built over decades of practice.&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">
                — Founding Partner
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
