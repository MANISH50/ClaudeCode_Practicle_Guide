// Shared class lists for controls repeated across pages.

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Gradient slides on hover; inset highlight gives a glossy top edge.
const primaryBase = `inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 bg-size-[200%_100%] bg-left font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_20px_-6px_rgb(124_58_237/0.55)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-right hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_10px_28px_-6px_rgb(124_58_237/0.6)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${focusRing}`;

export const buttonPrimary = `${primaryBase} px-5 py-2.5 text-[0.95rem]`;
export const buttonPrimaryLarge = `${primaryBase} px-7 py-3.5 text-lg`;

const secondaryBase = `inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 font-medium shadow-sm backdrop-blur transition duration-200 hover:border-violet-400/60 hover:bg-violet-500/5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${focusRing}`;

export const buttonSecondary = `${secondaryBase} px-4 py-2 text-[0.95rem]`;
export const buttonSecondaryLarge = `${secondaryBase} px-7 py-3.5 text-lg`;

// Without a text size, for fields that set their own (e.g. the note title).
export const fieldBase =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted/80 shadow-[inset_0_1px_2px_rgb(0_0_0/0.04)] transition duration-200 outline-none hover:border-violet-400/60 focus-visible:border-violet-500 focus-visible:ring-4 focus-visible:ring-violet-500/20 aria-invalid:border-red-500";

export const fieldClass = `${fieldBase} text-base`;

export const card =
  "rounded-3xl border border-border bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(76_29_149/0.18)]";

// Page and section headings in the Fraunces display serif.
export const heading = "font-display font-semibold";

export const errorText = "text-[0.95rem] text-red-700 dark:text-red-400";
