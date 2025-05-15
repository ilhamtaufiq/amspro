"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

// Re-export useTheme for convenience
export { useNextTheme as useTheme };

// ThemeProvider component
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
