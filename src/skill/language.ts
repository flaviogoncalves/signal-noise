/** The output languages offered, as the panel labels them and as the model is told them. */
export const LANGUAGES = [
  { value: "pt-BR", label: "Português (Brasil)", name: "Brazilian Portuguese" },
  { value: "en", label: "English", name: "English" },
  { value: "es", label: "Español", name: "Spanish" },
  { value: "fr", label: "Français", name: "French" },
  { value: "de", label: "Deutsch", name: "German" },
  { value: "it", label: "Italiano", name: "Italian" },
  { value: "ja", label: "日本語", name: "Japanese" },
] as const;

/** Follow the browser. The default, so the extension works with no setting touched. */
export const AUTO = "auto";
/** Write in whatever language the video is in. Never the default — see the skill's language rule. */
export const SOURCE = "source";

/**
 * The language to ask the model for, in words. Pure.
 *
 * The skill ranks an explicit language request above everything else, so the
 * panel always makes one — even "auto" is resolved to a named language here
 * rather than left for the model to guess from a transcript.
 */
export function outputLanguage(choice: string | undefined, browserLocale: string): string {
  if (choice === SOURCE) return "the language the transcript itself is in";

  const listed = LANGUAGES.find((language) => language.value === choice);
  if (listed) return listed.name;

  return new Intl.DisplayNames(["en"], { type: "language" }).of(browserLocale) ?? browserLocale;
}
