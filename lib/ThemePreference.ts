export type Theme = "light" | "dark";

export class ThemePreference {
  static readonly STORAGE_KEY = "bloommod:theme";
  static readonly CHANGE_EVENT = "bloommod:themechange";

  private static readonly DARK_QUERY = "(prefers-color-scheme: dark)";

  static bootScript(): string {
    return `(function(){try{var t=localStorage.getItem(${JSON.stringify(
      ThemePreference.STORAGE_KEY,
    )});if(t!=="light"&&t!=="dark"){t=matchMedia(${JSON.stringify(
      ThemePreference.DARK_QUERY,
    )}).matches?"dark":"light"}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`;
  }

  current(): Theme | null {
    const theme = document.documentElement.dataset.theme;
    return theme === "light" || theme === "dark" ? theme : null;
  }

  toggle(): void {
    this.set(this.current() === "dark" ? "light" : "dark");
  }

  set(theme: Theme): void {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    this.persist(theme);
    window.dispatchEvent(new Event(ThemePreference.CHANGE_EVENT));
  }

  subscribe(onChange: () => void): () => void {
    window.addEventListener(ThemePreference.CHANGE_EVENT, onChange);
    return () =>
      window.removeEventListener(ThemePreference.CHANGE_EVENT, onChange);
  }

  private persist(theme: Theme): void {
    try {
      localStorage.setItem(ThemePreference.STORAGE_KEY, theme);
    } catch {
      return;
    }
  }
}
