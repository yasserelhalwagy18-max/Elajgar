/**
 * The skeleton shown while the dashboard is loading.
 *
 * There is deliberately **no `app/loading.tsx` at the root**. A loading file
 * in a segment puts a Suspense boundary around that segment, and for a
 * route whose content is not already in the HTML - a page that is rendered
 * on demand, or a static page whose content is streamed to the client - the
 * boundary never resolves: the page keeps showing this fallback for ever
 * and never hydrates.
 *
 * That is not a theory, it is what happened: with a root `loading.tsx` the
 * landing page, the login screen and the whole admin panel sat on a
 * permanent spinner in a production build, while the dashboard - the one
 * segment with its own loading file - worked. The files were removed and
 * the pages came back.
 *
 * So: a loading file is fine in a segment whose pages are prerendered with
 * their content inlined, and not fine anywhere else. The dashboard is the
 * only place that qualifies. The other routes use Next's own behaviour,
 * which keeps the page the user is on until the next one is ready - a
 * spinner that covers the whole screen would be worse anyway.
 */
export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="در حال بارگذاری" className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-outline-variant/30 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-outline-variant/20 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-36 p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 w-20 bg-outline-variant/30 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-outline-variant/20 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-outline-variant/40 rounded-lg animate-pulse"></div>
              <div className="h-3 w-32 bg-outline-variant/20 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
