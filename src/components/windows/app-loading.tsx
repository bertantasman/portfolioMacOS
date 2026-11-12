/**
 * What a window shows while its application code downloads. It fills the window so nothing shifts when
 * the application arrives, and the spinner only appears if loading takes noticeable time.
 */
export function AppLoading() {
  return (
    <div role="status" aria-label="Loading application" className="grid size-full place-items-center bg-surface">
      <span aria-hidden className="app-loading-spinner size-5 rounded-full border-2 border-black/15 border-t-black/45" />
    </div>
  );
}
