export const themeStore = $state({ value: "light" });

export function initTheme(): void {
  if (typeof window === "undefined") return;
  themeStore.value = localStorage.getItem("vitals-theme") ?? "light";
}

export function toggleTheme(): void {
  themeStore.value = themeStore.value === "light" ? "dark" : "light";
  if (typeof window !== "undefined") {
    localStorage.setItem("vitals-theme", themeStore.value);
  }
}
