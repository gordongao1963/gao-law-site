const stats = [
  { value: "30+", label: "Years of Experience" },
  { value: "200+", label: "Cases Won" },
  { value: "$10B+", label: "In Client Recoveries" },
  { value: "20+", label: "Fortune 500 Clients" },
]

export function Stats() {
  return (
    <section className="py-20 border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl lg:text-5xl tracking-tight mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
