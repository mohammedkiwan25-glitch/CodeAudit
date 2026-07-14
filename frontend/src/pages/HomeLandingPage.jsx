import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Link } from "react-router";
import { ArrowRightIcon, BarChart3Icon, BookOpenCheckIcon, CheckCircle2Icon, ClipboardCheckIcon, Code2Icon, MessagesSquareIcon, ShieldCheckIcon, SparklesIcon, UsersIcon, VideoIcon } from "lucide-react";

const FEATURES = [
  { icon: <VideoIcon className="size-5" />, title: "Live interview room", text: "Video, chat, participant controls, and a shared coding workspace in one place.", style: "bg-primary/10 text-primary border-primary/30" },
  { icon: <Code2Icon className="size-5" />, title: "Shared code execution", text: "Collaborate in JavaScript, Python, or Java and review the final code and output.", style: "bg-secondary/10 text-secondary border-secondary/30" },
  { icon: <BookOpenCheckIcon className="size-5" />, title: "Flexible problem library", text: "Use built-in questions, reusable problems, or a one-time interview prompt.", style: "bg-accent/10 text-accent border-accent/30" },
  { icon: <ClipboardCheckIcon className="size-5" />, title: "Structured evaluation", text: "Score candidates with a consistent rubric and keep decisions attached to the interview.", style: "bg-success/10 text-success border-success/30" },
];

const STEPS = [
  { number: "01", title: "Prepare", text: "Select a problem, set the difficulty, and create a private invitation." },
  { number: "02", title: "Interview", text: "Talk, code, run solutions, and collaborate live without switching tools." },
  { number: "03", title: "Evaluate", text: "Review the workspace, complete the rubric, and track outcomes in analytics." },
];

function Brand() {
  return <Link to="/" className="flex items-center gap-3"><span className="size-10 rounded-lg bg-primary text-primary-content flex items-center justify-center"><SparklesIcon className="size-5" /></span><span><span className="block font-black text-xl leading-none">CodeAudit</span><span className="text-xs text-base-content/50">Technical interview workspace</span></span></Link>;
}

function HomeLandingPage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <nav className="h-16 bg-base-100/95 backdrop-blur border-b border-base-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          <Brand />
          <div className="flex items-center gap-2"><SignInButton mode="modal"><button className="btn btn-ghost btn-sm sm:btn-md">Sign in</button></SignInButton><SignUpButton mode="modal"><button className="btn btn-primary btn-sm sm:btn-md">Create account</button></SignUpButton></div>
        </div>
      </nav>

      <main>
        <section className="bg-primary/5 border-b border-primary/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary bg-base-100 border border-primary/20 rounded-full px-3 py-1.5 mb-5"><span className="size-2 rounded-full bg-success" /> Built for real technical interviews</span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02]">CodeAudit</h1>
              <p className="text-2xl sm:text-3xl font-bold mt-4 max-w-xl">Run focused coding interviews from invitation to final decision.</p>
              <p className="text-base sm:text-lg text-base-content/65 leading-relaxed mt-5 max-w-xl">A complete workspace for private sessions, live collaboration, reusable problems, structured reports, and supervisor oversight.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8"><SignUpButton mode="modal"><button className="btn btn-primary btn-lg gap-2">Start an interview <ArrowRightIcon className="size-5" /></button></SignUpButton><a href="#workflow" className="btn btn-outline btn-lg">See how it works</a></div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-sm text-base-content/65"><span className="flex items-center gap-2"><CheckCircle2Icon className="size-4 text-success" /> Invite-only sessions</span><span className="flex items-center gap-2"><CheckCircle2Icon className="size-4 text-success" /> No installation</span><span className="flex items-center gap-2"><CheckCircle2Icon className="size-4 text-success" /> Multi-language editor</span></div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img src="/hero.png" alt="CodeAudit technical interview workspace" className="w-full max-w-[560px] aspect-square object-cover rounded-lg border-2 border-primary/20 shadow-xl" />
            </div>
          </div>
        </section>

        <section id="workflow" className="py-20 sm:py-24 bg-secondary/5 border-b border-secondary/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12"><p className="text-sm font-bold text-primary">One connected workflow</p><h2 className="text-3xl sm:text-4xl font-black mt-2">From problem selection to evidence-based feedback</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-secondary/20 border border-secondary/20 rounded-lg overflow-hidden">{STEPS.map((step, index) => <article key={step.number} className="bg-base-100 p-6 sm:p-8"><span className={`size-10 rounded-lg flex items-center justify-center text-sm font-black ${index === 0 ? "bg-primary/10 text-primary" : index === 1 ? "bg-secondary/10 text-secondary" : "bg-success/10 text-success"}`}>{step.number}</span><h3 className="text-xl font-black mt-5">{step.title}</h3><p className="text-base-content/60 leading-relaxed mt-2">{step.text}</p></article>)}</div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-base-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-12"><div className="max-w-2xl"><p className="text-sm font-bold text-primary">Interview workspace</p><h2 className="text-3xl sm:text-4xl font-black mt-2">Everything the conversation needs</h2></div><p className="text-base-content/55 max-w-md">Keep the interview, code, evidence, and evaluation connected instead of scattered across separate tools.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{FEATURES.map(({ icon, title, text, style }) => <article key={title} className={`border rounded-lg p-6 flex gap-4 ${style}`}><span className="size-11 rounded-lg bg-base-100/80 flex items-center justify-center shrink-0">{icon}</span><div className="text-base-content"><h3 className="font-black text-lg">{title}</h3><p className="text-base-content/60 mt-2 leading-relaxed">{text}</p></div></article>)}</div>
          </div>
        </section>

        <section className="py-20 sm:py-24 bg-neutral text-neutral-content">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <div><p className="text-sm font-bold text-primary">Built for every role</p><h2 className="text-3xl sm:text-4xl font-black mt-2">Clear responsibilities, shared interview evidence</h2><p className="text-neutral-content/65 mt-4 leading-relaxed">Candidates get a focused workspace. Interviewers get repeatable evaluation tools. Supervisors get visibility across the process.</p></div>
            <div className="grid gap-3"><div className="border border-neutral-content/15 rounded-lg p-5 flex gap-4"><MessagesSquareIcon className="size-5 text-primary shrink-0 mt-1" /><div><h3 className="font-bold">Candidates</h3><p className="text-sm text-neutral-content/60 mt-1">Join securely, communicate clearly, and solve in a synchronized editor.</p></div></div><div className="border border-neutral-content/15 rounded-lg p-5 flex gap-4"><UsersIcon className="size-5 text-primary shrink-0 mt-1" /><div><h3 className="font-bold">Interviewers</h3><p className="text-sm text-neutral-content/60 mt-1">Prepare problems, conduct sessions, and complete structured reports.</p></div></div><div className="border border-neutral-content/15 rounded-lg p-5 flex gap-4"><ShieldCheckIcon className="size-5 text-primary shrink-0 mt-1" /><div><h3 className="font-bold">Supervisors</h3><p className="text-sm text-neutral-content/60 mt-1">Monitor activity, report coverage, outcomes, and interviewer consistency.</p></div></div></div>
          </div>
        </section>

        <section className="py-20 sm:py-24 text-center bg-primary/5 border-y border-primary/15"><div className="max-w-3xl mx-auto px-4"><span className="size-14 rounded-lg bg-primary text-primary-content flex items-center justify-center mx-auto"><BarChart3Icon className="size-7" /></span><h2 className="text-3xl sm:text-4xl font-black mt-5">Make every interview easier to run and easier to review.</h2><p className="text-base-content/60 mt-4">Create your workspace and start with a reusable problem or a one-time prompt.</p><SignUpButton mode="modal"><button className="btn btn-primary btn-lg mt-7 gap-2">Create your account <ArrowRightIcon className="size-5" /></button></SignUpButton></div></section>
      </main>

      <footer className="bg-base-200 border-t border-base-300 py-7"><div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><Brand /><p className="text-sm text-base-content/45">Technical interviews, organized from start to finish.</p></div></footer>
    </div>
  );
}

export default HomeLandingPage;
