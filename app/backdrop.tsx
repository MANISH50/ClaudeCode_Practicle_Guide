// Decorative, slowly drifting gradient blobs behind marketing and auth pages.
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 size-96 animate-float rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute top-1/3 -right-24 size-112 animate-float rounded-full bg-violet-500/20 blur-3xl" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-40 left-1/3 size-80 animate-float rounded-full bg-fuchsia-500/15 blur-3xl" style={{ animationDelay: "-8s" }} />
    </div>
  );
}
