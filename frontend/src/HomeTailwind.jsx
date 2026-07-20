import { Link } from "react-router-dom";
import Layout from "./Layout";

const benefits = [
  {
    title: "Plain-language answers",
    detail: "Get a clear explanation of which law applies — not just a section number to look up yourself.",
  },
  {
    title: "Old law and new law, together",
    detail: "See how a case would have been handled under the old code and how it's handled now.",
  },
  {
    title: "No legal jargon required",
    detail: "Describe what happened in your own words. LEX AI does the translating.",
  },
];

export default function HomeTailwind() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Layout>
      <div className="bg-[#F7F8FA] text-[#0B1220]">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 sm:px-8 lg:pt-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-[#B08D3D]">LEX AI</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-tight text-[#0B1220] sm:text-5xl">
              Know which law applies, in plain English.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#5B6472]">
              Describe what happened. LEX AI tells you which law covers it today, what it used
              to say, and what it means for you — no legal background needed.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={isLoggedIn ? "/chatbot" : "/auth"}
                className="inline-flex items-center justify-center rounded-md bg-[#0B1220] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1B2C42]"
              >
                {isLoggedIn ? "Ask about your case" : "Sign in to get started"}
              </Link>
              <a
                href="#example"
                className="inline-flex items-center justify-center rounded-md border border-[#D7DBE0] px-7 py-3 text-sm font-semibold text-[#0B1220] transition hover:border-[#0B1220]"
              >
                See an example
              </a>
            </div>
          </div>
        </section>

        {/* Product preview — a real-looking, plain-language result */}
        <section id="example" className="mx-auto max-w-4xl px-6 pb-20 sm:px-8">
          <div className="overflow-hidden rounded-xl border border-[#E3E6EA] bg-white shadow-[0_20px_60px_-30px_rgba(11,18,32,0.25)]">
            <div className="border-b border-[#E3E6EA] bg-[#FAFBFC] px-6 py-4">
              <p className="text-sm font-semibold text-[#0B1220]">What you'd get back</p>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA2AC]">
                  You describe
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#0B1220]">
                  "Someone convinced me to hand over money by promising to pay it back, then
                  never did — and never intended to."
                </p>
              </div>

              <div className="border-t border-[#E3E6EA] pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9AA2AC]">
                  LEX AI answers
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[#0B1220]">
                  This is covered under <span className="font-semibold">Section 318 (Cheating)</span> of
                  the current law (BNS). Under the earlier law, the same conduct fell under IPC
                  Section 420.
                </p>
                <p className="mt-2 text-sm leading-6 text-[#5B6472]">
                  To count as cheating, there needs to be a false promise, property handed over
                  because of it, and an intent to deceive from the start.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why LEX AI — plain-language benefits, not internal process */}
        <section className="border-t border-[#E3E6EA] bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
            <div className="grid gap-10 sm:grid-cols-3">
              {benefits.map((item) => (
                <div key={item.title}>
                  <h3 className="text-base font-semibold text-[#0B1220]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6472]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-[#E3E6EA]">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#0B1220] sm:text-3xl">
              Have a situation you need to understand?
            </h2>
            <Link
              to={isLoggedIn ? "/chatbot" : "/auth"}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-[#0B1220] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1B2C42]"
            >
              {isLoggedIn ? "Ask about your case" : "Sign in to get started"}
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}