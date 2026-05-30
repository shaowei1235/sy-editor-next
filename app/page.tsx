const fields = ['商品名', '価格', 'バーコード', '説明文']
const printItems = ['商品名', '価格', 'バーコード']

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="grid min-h-screen grid-cols-[260px_1fr_280px]">
        <aside className="border-r border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">左侧字段栏</h2>
          <div className="mt-5 space-y-3">
            {fields.map((field) => (
              <div
                key={field}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium"
              >
                {field}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex flex-col p-8">
          <div className="mb-5">
            <h1 className="text-2xl font-bold">标签编辑器</h1>
            <p className="mt-1 text-sm text-slate-500">
              基础页面骨架，后续逐步实现编辑能力。
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
            <div className="h-[360px] w-[520px] rounded-md border border-slate-300 bg-slate-50 shadow-sm">
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                中间画布区域
              </div>
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">右侧打印顺序列表</h2>
          <ol className="mt-5 space-y-3">
            {printItems.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  )
}
