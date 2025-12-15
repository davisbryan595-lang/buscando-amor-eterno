'use client'

import React, { useState } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Mail, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('📧 Message sent! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-3 md:mb-4">
              Get in Touch
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              Questions? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
            <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-100 rounded-xl p-4 md:p-6 soft-glow">
              <Mail className="text-primary mb-4" size={28} />
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-sm md:text-base text-slate-600">
                <a href="mailto:support@buscandoamoreterno.com" className="hover:text-primary break-all">
                  support@buscandoamoreterno.com
                </a>
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-100 rounded-xl p-4 md:p-6 soft-glow">
              <MessageSquare className="text-primary mb-4" size={28} />
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">Live Chat</h3>
              <p className="text-sm md:text-base text-slate-600">
                Chat with our team using the widget on any page
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            <textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 py-3 text-sm md:text-base border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={6}
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-full text-sm md:text-base font-semibold hover:bg-rose-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}
