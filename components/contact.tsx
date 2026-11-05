"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send message")
      }

      setSuccess(true)
      setFormData({ name: "", email: "", company: "", message: "" })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 lg:py-32 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-background/60 mb-4">
              Contact
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-8">
              Let&apos;s discuss your matter
            </h2>
            <p className="text-background/70 leading-relaxed mb-12">
              Whether you&apos;re facing an active infringement issue or planning 
              proactive IP protection in China, we&apos;re ready to help. Schedule 
              a confidential consultation.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-wider text-background/60 mb-2">Beijing Office</p>
                <p className="text-background/80">
                  World Financial Center<br />
                  No. 1 Dongsanhuan Zhonglu<br />
                  Chaoyang District<br />
                  Beijing 100020, China
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-background/60 mb-2">Contact</p>
                <p className="text-background/80">
                  E: info@gao.law<br />
                  M: +1 650 360 8815
                </p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">Message sent successfully! We&apos;ll be in touch soon.</p>
                </div>
              )}

              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-background/60 mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-transparent border-background/20 text-background placeholder:text-background/40 focus:border-background/40"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-background/60 mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-transparent border-background/20 text-background placeholder:text-background/40 focus:border-background/40"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm text-background/60 mb-2">
                  Company
                </label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-transparent border-background/20 text-background placeholder:text-background/40 focus:border-background/40"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-background/60 mb-2">
                  How can we help?
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-transparent border-background/20 text-background placeholder:text-background/40 focus:border-background/40 resize-none"
                  placeholder="Briefly describe your matter..."
                />
              </div>

              <Button 
                type="submit" 
                variant="secondary" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>

              <p className="text-xs text-background/50 text-center">
                All communications are confidential. By submitting this form, 
                you agree to our privacy policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
