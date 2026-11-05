import Link from "next/link"
import { Settings } from "lucide-react"

const links = [
  { name: "Practice Areas", href: "#practice" },
  { name: "Landmark Cases", href: "#cases" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <Link href="/" className="font-serif text-lg tracking-tight">
              Gao.Law <span className="text-sm font-light">高点法律</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Intellectual Property Litigation | Beijing, China
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Gao.Law. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Attorney Advertising
            </Link>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
