const HomePage = () => {
  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Stories</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <div className="h-16 w-16 rounded-full bg-slate-200 ring-2 ring-pink-500 ring-offset-2" />
                <span className="text-xs text-slate-500">user{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div>
                  <h3 className="text-sm font-semibold">username{index + 1}</h3>
                  <p className="text-xs text-slate-500">Delhi, India</p>
                </div>
              </div>

              <div className="aspect-square bg-slate-100" />

              <div className="p-4">
                <p className="text-sm font-medium">❤️ 💬 📤 🔖</p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold">username{index + 1}</span>{" "}
                  This is a demo post layout.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Suggested for you</h2>

          <div className="mt-4 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div>
                    <p className="text-sm font-semibold">
                      suggested{index + 1}
                    </p>
                    <p className="text-xs text-slate-500">Suggested user</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm font-semibold text-blue-500"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
};

export default HomePage;
