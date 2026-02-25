"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import { AuthProvider } from "./contexts/AuthContext";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}
