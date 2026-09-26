/** Bun supplies these at runtime; this declaration also types imported pipeline helpers. */
interface ImportMeta {
  readonly dir: string;
  readonly main: boolean;
}
