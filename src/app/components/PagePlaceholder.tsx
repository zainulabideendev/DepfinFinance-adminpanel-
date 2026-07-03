export default function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen">
      <section className="flex items-center justify-between bg-slate-800 px-8 py-6">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-white">
          {title}
        </h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-white">
          <span>DF</span>
        </div>
      </section>

      <section className="px-8 py-10">
        <div className="rounded-md border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
          {title} content goes here.
        </div>
      </section>
    </div>
  );
}
