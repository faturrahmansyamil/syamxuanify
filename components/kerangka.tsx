export function KerangkaHalaman() {
  return (
    <div data-kerangka="1" className="min-h-dvh space-y-[72px]">
      <p className="sr-only">Memuat…</p>
      <div aria-hidden="true" className="space-y-[72px]">
        <div className="mx-auto flex h-[320px] max-w-[600px] flex-col items-center justify-center gap-[16px] md:h-[640px]">
          <div className="h-[40px] w-[220px] rounded-full bg-[#ebebeb] md:h-[64px] md:w-[320px]" />
          <div className="h-[56px] w-full rounded-full bg-[#ebebeb]" />
          <div className="flex gap-[12px]">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[36px] w-[88px] rounded-full bg-[#ebebeb]" />
            ))}
          </div>
        </div>
        <div className="flex gap-[12px] overflow-hidden">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex w-[300px] shrink-0 items-center gap-[12px] md:w-[420px]">
              <div className="h-[64px] w-[48px] rounded-[12px] bg-[#ebebeb] md:h-[96px] md:w-[72px]" />
              <div className="h-[280px] min-w-0 flex-1 rounded-[28px] bg-[#ebebeb]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[300px] rounded-[28px] bg-[#ebebeb]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[180px] rounded-[28px] bg-[#ebebeb]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function KerangkaKatalog() {
  return (
    <div data-kerangka="1" className="min-h-dvh space-y-[16px]">
      <p className="sr-only">Memuat katalog…</p>
      <div aria-hidden="true" className="space-y-[16px]">
        <div className="h-[20px] w-[160px] rounded-full bg-[#ebebeb]" />
        <div className="flex gap-[12px] overflow-hidden">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[36px] w-[108px] shrink-0 rounded-full bg-[#ebebeb]" />
          ))}
        </div>
        <div className="flex gap-[12px] overflow-hidden">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[36px] w-[120px] shrink-0 rounded-full bg-[#ebebeb]" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div key={item} className="h-[300px] rounded-[28px] bg-[#ebebeb]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function KerangkaDetail() {
  return (
    <div data-kerangka="1" className="min-h-[70dvh]">
      <p className="sr-only">Memuat…</p>
      <div aria-hidden="true" className="grid items-start gap-[24px] md:grid-cols-2">
        <div className="aspect-square rounded-[28px] bg-[#ebebeb]" />
        <div className="space-y-[12px] pt-[8px]">
          <div className="h-[20px] w-[75%] rounded-full bg-[#ebebeb]" />
          <div className="h-[16px] w-[40%] rounded-full bg-[#ebebeb]" />
          <div className="h-[14px] w-full rounded-full bg-[#ebebeb]" />
          <div className="h-[14px] w-[88%] rounded-full bg-[#ebebeb]" />
          <div className="mt-[16px] h-[48px] w-[180px] rounded-full bg-[#ebebeb]" />
          <div className="h-[120px] w-full rounded-[28px] bg-[#ebebeb]" />
        </div>
      </div>
    </div>
  );
}

export function KerangkaToko() {
  return (
    <div data-kerangka="1" className="min-h-dvh space-y-[24px]">
      <p className="sr-only">Memuat toko…</p>
      <div aria-hidden="true" className="space-y-[24px]">
        <div className="flex items-center gap-[12px]">
          <div className="h-[64px] w-[64px] rounded-full bg-[#ebebeb]" />
          <div className="space-y-[8px]">
            <div className="h-[24px] w-[180px] rounded-full bg-[#ebebeb]" />
            <div className="h-[14px] w-[120px] rounded-full bg-[#ebebeb]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div key={item} className="h-[300px] rounded-[28px] bg-[#ebebeb]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function KerangkaAuth() {
  return (
    <div data-kerangka="1" className="w-full">
      <p className="sr-only">Memuat…</p>
      <div aria-hidden="true">
        <p className="flex items-center justify-center gap-[8px] text-[20px] font-semibold tracking-[-0.05em]" translate="no">
          Syamxuanify<span className="text-shop-violet">.</span>
          <span className="titik-denyut" />
        </p>
        <div className="mx-auto mt-[16px] h-[72px] w-[72px] rounded-full bg-[#ebebeb]" />
        <div className="mx-auto mt-[16px] h-[24px] w-[200px] rounded-full bg-[#ebebeb]" />
        <div className="mx-auto mt-[8px] h-[14px] w-[160px] rounded-full bg-[#ebebeb]" />
        <div className="mt-[24px] h-[48px] rounded-full bg-[#ebebeb]" />
        <div className="mt-[12px] h-[48px] rounded-full bg-[#ebebeb]" />
        <div className="mt-[16px] h-[48px] rounded-full bg-[#ebebeb]" />
      </div>
    </div>
  );
}
