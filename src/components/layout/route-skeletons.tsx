import { Skeleton } from '@/components/ui/skeleton';

// Skeletons livianos (server components, sin JS de cliente) para los
// boundaries `loading.tsx` de cada ruta. Solo divs + animate-pulse:
// no fetching, no hooks, coherentes con los tokens Shadcn (bg-card,
// border, muted) y con el layout real de cada vista.

function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite" aria-label={label}>
      {children}
    </div>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <Shell label="Cargando inicio">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:gap-10 sm:p-6">
        <section className="mx-auto w-full max-w-3xl text-center">
          <Skeleton className="mx-auto h-6 w-64 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-10 w-3/4" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-2xl" />
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Skeleton className="h-11 w-full sm:w-40" />
            <Skeleton className="h-11 w-full sm:w-48" />
          </div>
        </section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-md">
              <Skeleton className="h-11 w-11 rounded-full" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-5/6" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card shadow-lg">
            <div className="border-b p-4 sm:p-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
            <div className="space-y-3 p-4 sm:p-6">
              <Skeleton className="h-14 w-3/4 rounded-lg" />
              <Skeleton className="ml-auto h-12 w-2/3 rounded-lg" />
              <Skeleton className="h-14 w-4/5 rounded-lg" />
            </div>
            <div className="border-t p-3 sm:p-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="rounded-xl border bg-card p-6 shadow-lg">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-lg">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function ResourcesLoadingSkeleton() {
  return (
    <Shell label="Cargando recursos">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="mx-auto mt-6 h-11 w-full max-w-xl" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card shadow-md">
              <div className="p-6">
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-2/3" />
              </div>
              <div className="border-t p-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function ResourceListLoadingSkeleton() {
  return (
    <Shell label="Cargando listado">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-9 w-44" />
        <div className="mt-4 text-center">
          <Skeleton className="mx-auto h-9 w-72" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="mx-auto mt-6 h-11 w-full max-w-xl" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-md">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-3 h-5 w-4/5" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

export function QuizLoadingSkeleton() {
  return (
    <Shell label="Cargando autoevaluación">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="mt-6 h-2.5 w-full rounded-full" />
        <div className="mt-6 rounded-xl border bg-card p-6 shadow-md">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-3 h-6 w-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </Shell>
  );
}

export function AdminLoadingSkeleton() {
  return (
    <Shell label="Cargando administración">
      <div className="container mx-auto flex max-w-2xl justify-center px-4 py-12">
        <div className="w-full rounded-xl border bg-card p-6 shadow-lg sm:p-8">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-7 w-56" />
          <Skeleton className="mx-auto mt-2 h-4 w-full max-w-sm" />
          <div className="mt-6 space-y-4">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-10 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </Shell>
  );
}
