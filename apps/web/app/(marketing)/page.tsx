import Link from "next/link";
import Image from "next/image";
import {
  ScanLine,
  BrainCircuit,
  MessageSquare,
  Wrench,
  Camera,
  Search,
  Bot,
  ArrowRight,
  Check,
  Star,
  Shield,
  Zap,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/marketing/navbar";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy-900 pt-32 pb-20 sm:pt-40 sm:pb-32">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[128px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm text-teal-300">
            <Zap className="h-4 w-4" />
            AI-Powered Home Management
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your Home,{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Brilliantly
            </span>{" "}
            Managed
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-400 sm:text-xl">
            Scan any appliance, instantly access manuals, chat with AI about maintenance,
            and connect with trusted service providers. HomeBase AI transforms how you care for your home.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="xl" className="bg-teal-500 hover:bg-teal-600 text-white shadow-xl shadow-teal-500/25 w-full sm:w-auto" asChild>
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 text-sm text-gray-500 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-teal-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-teal-500" />
              Free for 1 home
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-teal-500" />
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-800/50 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs text-gray-500">homebase-ai.com/dashboard</span>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-4 sm:p-6">
              {/* Sidebar mockup */}
              <div className="hidden space-y-3 sm:col-span-1 sm:block">
                {["Dashboard", "Scan", "Items", "Chat", "Maintenance"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-400">
                    <div className="h-4 w-4 rounded bg-teal-500/30" />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content mockup */}
              <div className="sm:col-span-3 space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { label: "Total Items", value: "47", color: "teal" },
                    { label: "Maintenance Due", value: "3", color: "amber" },
                    { label: "Active Warranties", value: "12", color: "blue" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Samsung Refrigerator", room: "Kitchen", status: "Excellent" },
                    { name: "Bosch Dishwasher", room: "Kitchen", status: "Good" },
                    { name: "Dyson V15 Detect", room: "Living Room", status: "Excellent" },
                    { name: "Nest Thermostat", room: "Hallway", status: "Good" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                        <Home className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.room} &middot; {item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect beneath */}
          <div className="absolute -bottom-8 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-teal-500/20 blur-[64px]" />
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: ScanLine,
    title: "Scan & Identify",
    description: "Point your camera at any appliance. Our AI instantly recognizes the make, model, and specifications — no manual entry needed.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description: "Get intelligent maintenance recommendations, predict potential issues, and receive proactive care suggestions for every item in your home.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: MessageSquare,
    title: "Chat With Your Home",
    description: "Ask anything about your appliances in natural language. Get answers from manuals, maintenance history, and expert knowledge — instantly.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Wrench,
    title: "Smart Maintenance",
    description: "Never miss a filter change or service date. Automated schedules, reminders, and a complete log of everything done to every item.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Shield,
    title: "Warranty Tracking",
    description: "All your warranties in one place. Get alerts before they expire and instant access to claim information when you need it.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Search,
    title: "Instant Manuals",
    description: "Every manual, guide, and spec sheet — searchable and always available. No more digging through drawers or searching the web.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="bg-navy-950 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Everything You Need to{" "}
            <span className="text-teal-400">Master Your Home</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            From scanning appliances to scheduling maintenance, HomeBase AI brings intelligence to every aspect of home management.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className={`inline-flex rounded-xl ${feature.bg} p-3`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {feature.description}
              </p>
              <div className="absolute -bottom-1 -right-1 h-24 w-24 rounded-full bg-gradient-to-br from-teal-500/5 to-transparent blur-2xl transition-all duration-300 group-hover:from-teal-500/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Scan Your Items",
    description: "Use your phone camera to scan any appliance, device, or home system. Our AI identifies it instantly and pulls in all relevant data.",
  },
  {
    step: "02",
    icon: Bot,
    title: "AI Organizes Everything",
    description: "Manuals, warranties, maintenance schedules, and specifications are automatically organized and linked to your home inventory.",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Chat, Maintain & Connect",
    description: "Ask questions in plain English, get maintenance reminders, and connect with vetted service providers when you need professional help.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-navy-900 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Simple as{" "}
            <span className="text-teal-400">1-2-3</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Get your home organized in minutes, not hours. Our AI does the heavy lifting.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-8 bg-gradient-to-r from-teal-500/50 to-transparent lg:block translate-x-full" />
              )}
              <div className="text-center">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 blur-lg" />
                  <div className="relative rounded-2xl border border-teal-500/20 bg-navy-800 p-5">
                    <s.icon className="h-8 w-8 text-teal-400" />
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider text-teal-500">
                  Step {s.step}
                </div>
                <h3 className="mt-3 font-heading text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Homeowner, Portland",
    quote: "HomeBase AI completely changed how I manage my home. I found three expired warranties I didn't know about and saved over $2,000 in repair costs.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Property Manager",
    quote: "Managing 12 rental properties used to be a nightmare. Now I have every appliance, every manual, and every maintenance record in one place.",
    rating: 5,
  },
  {
    name: "Emily & James Park",
    role: "New Homeowners",
    quote: "As first-time homeowners, we were overwhelmed. The AI chat feature alone has saved us dozens of calls to repair services.",
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="bg-navy-950 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Loved by{" "}
            <span className="text-teal-400">Homeowners</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Join thousands of homeowners who&apos;ve transformed their home management experience.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-8"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 font-heading text-sm font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with one home.",
    features: [
      "1 home",
      "Up to 25 items",
      "Manual entry only",
      "Basic AI chat",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Full power for the modern homeowner.",
    features: [
      "Up to 3 homes",
      "Unlimited items",
      "AI scan & identify",
      "Full AI chat with manuals",
      "Maintenance scheduling",
      "Warranty tracking & alerts",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Family",
    price: "$19",
    period: "/month",
    description: "For families and property managers.",
    features: [
      "Unlimited homes",
      "Unlimited items",
      "Everything in Pro",
      "Multi-user access",
      "Provider network access",
      "Home passport export",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="bg-navy-900 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Simple, Transparent{" "}
            <span className="text-teal-400">Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Start free and upgrade as your needs grow. No surprises, ever.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-teal-500/50 bg-gradient-to-b from-teal-500/10 to-transparent shadow-xl shadow-teal-500/10"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-teal-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-heading text-lg font-semibold text-white">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="h-4 w-4 shrink-0 text-teal-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/25"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  asChild
                >
                  <Link href="/sign-up">{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-navy-950 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-600 px-8 py-16 text-center shadow-2xl sm:px-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          <div className="relative">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Home Management?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Join the waitlist and be among the first to experience AI-powered home management. Free during early access.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="xl" className="bg-white text-teal-700 hover:bg-gray-100 shadow-xl w-full sm:w-auto" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="HomeBase AI" width={36} height={36} className="rounded-lg" />
              <span className="font-heading text-lg font-bold text-white">
                HomeBase <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Your intelligent home management platform. Scan, identify, chat, and maintain — all in one place.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Product</h3>
            <ul className="mt-4 space-y-2">
              {["Features", "Pricing", "Integrations", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-teal-400">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h3>
            <ul className="mt-4 space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-teal-400">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Legal</h3>
            <ul className="mt-4 space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-teal-400">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} HomeBase AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
