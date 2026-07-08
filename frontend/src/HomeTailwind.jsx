import { Link } from "react-router-dom";
import Layout from "./Layout";

const workflow = [
  {
    title: "Case intake",
    description: "Submit facts, allegations, and the issue under review in plain language.",
  },
  {
    title: "Section retrieval",
    description: "The system identifies the most relevant BNS provisions and their IPC equivalents.",
  },
  {
    title: "Reasoned conclusion",
    description: "Each result is structured with legal reasoning, ingredients, and sanctions.",
  },
];

const tools = [
  "BNS section mapping",
  "IPC equivalent review",
  "Structured conclusions",
  "Mobile-friendly research",
];

export default function HomeTailwind() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Layout>
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(184,134,11,0.12),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#fefcf7_100%)]">
        <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
                Legal research workflow • BNS / IPC analysis
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Precise BNS research for lawyers, scholars, and legal teams.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  LEX AI converts case facts into a structured legal analysis with relevant Bharatiya Nyaya Sanhita sections, essential ingredients, and IPC equivalents.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to={isLoggedIn ? "/chatbot" : "/auth"} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {isLoggedIn ? "Analyze a case" : "Sign in to analyze"}
                </Link>
                <a href="#workflow" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
                  Review the workflow
                </a>
              </div>

              <div className="flex flex-wrap gap-3">
                {tools.map((tool) => (
                  <span key={tool} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-600 shadow-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.35)]">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Research summary</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">What the tool provides</h2>
                </div>
                <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">For review</div>
              </div>

              <div className="space-y-4">
                {[
                  ["Relevant BNS provisions", "Section-specific analysis with legal reasoning and prescribed punishment."],
                  ["Case facts mapping", "A structured view of how facts align with statutory elements."],
                  ["IPC transitions", "Equivalent provisions and identified legislative changes."],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">Workflow</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">A structured path from facts to conclusion.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">The experience is designed to feel like a professional legal research desk rather than a generic chatbot interface.</p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {workflow.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">0{index + 1}</div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
