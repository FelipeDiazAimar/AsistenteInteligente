import { Skeleton } from '@/components/ui/skeleton';

// Skeletons livianos (server components, sin JS de cliente) para los
// boundaries `loading.tsx` de cada ruta. Solo divs + animate-pulse:
// no fetching, no hooks, coherentes con los tokens Shadcn (bg-card,
// border, muted) y con el layout real de cada vista.

function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite" aria-label={label} className="w-full min-w-0 overflow-x-clip">
      {children}
    </div>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <Shell label="Cargando inicio">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 p-4 sm:gap-10 sm:p-6">
        <section className="mx-auto w-full min-w-0 max-w-3xl text-center">
          <Skeleton className="mx-auto h-6 w-64 max-w-full rounded-full" />
          <Skeleton className="mx-auto mt-4 h-10 w-3/4 max-w-full" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-2xl" />
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <Skeleton className="h-11 w-full max-w-full sm:w-40" />
            <Skeleton className="h-11 w-full max-w-full sm:w-48" />
          </div>
        </section>
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-md sm:p-6">
              <Skeleton className="h-11 w-11 rounded-full" />
              <Skeleton className="mt-4 h-5 w-2/3 max-w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-5/6 max-w-full" />
            </div>
          ))}
        </div>
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-lg">
            <div className="border-b p-4 sm:p-6">
              <Skeleton className="h-6 w-48 max-w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
            <div className="space-y-3 p-4 sm:p-6">
              <Skeleton className="h-14 w-3/4 max-w-full rounded-lg" />
              <Skeleton className="ml-auto h-12 w-2/3 max-w-full rounded-lg" />
              <Skeleton className="h-14 w-4/5 max-w-full rounded-lg" />
            </div>
            <div className="border-t p-3 sm:p-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
            <div className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-lg sm:p-6">
              <Skeleton className="h-6 w-40 max-w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
            <div className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-lg sm:p-6">
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
      <div className="container mx-auto w-full min-w-0 px-4 py-8">
        <div className="mx-auto w-full min-w-0 max-w-2xl text-center">
          <Skeleton className="mx-auto h-9 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="mx-auto mt-6 h-11 w-full max-w-xl" />
        <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-md">
              <div className="p-4 sm:p-6">
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="mt-4 h-5 w-3/4 max-w-full" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-2/3 max-w-full" />
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
      <div className="container mx-auto w-full min-w-0 px-4 py-8">
        <Skeleton className="h-9 w-44 max-w-full" />
        <div className="mt-4 w-full min-w-0 text-center">
          <Skeleton className="mx-auto h-9 w-72 max-w-full" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="mx-auto mt-6 h-11 w-full max-w-xl" />
        <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-md sm:p-6">
              <Skeleton className="h-5 w-1/3 max-w-full" />
              <Skeleton className="mt-3 h-5 w-4/5 max-w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3 max-w-full" />
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
      <div className="container mx-auto w-full min-w-0 max-w-3xl px-4 py-8">
        <div className="w-full min-w-0 text-center">
          <Skeleton className="mx-auto h-9 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="mt-6 h-2.5 w-full rounded-full" />
        <div className="mt-6 min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-md sm:p-6">
          <Skeleton className="h-6 w-16 max-w-full" />
          <Skeleton className="mt-3 h-6 w-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-4 flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Skeleton className="h-10 w-full max-w-full sm:w-28" />
          <Skeleton className="h-10 w-full max-w-full sm:w-36" />
        </div>
      </div>
    </Shell>
  );
}

export function AdminLoadingSkeleton() {
  return (
    <Shell label="Cargando administración">
      <div className="container mx-auto flex w-full min-w-0 max-w-2xl justify-center px-4 py-12">
        <div className="w-full min-w-0 overflow-hidden rounded-xl border bg-card p-4 shadow-lg sm:p-8">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-7 w-56 max-w-full" />
          <Skeleton className="mx-auto mt-2 h-4 w-full max-w-sm" />
          <div className="mt-6 space-y-4">
            <div className="min-w-0">
              <Skeleton className="h-4 w-24 max-w-full" />
              <Skeleton className="mt-2 h-10 w-full" />
            </div>
            <div className="min-w-0">
              <Skeleton className="h-4 w-24 max-w-full" />
              <Skeleton className="mt-2 h-10 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </Shell>
  );
}
