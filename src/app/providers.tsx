"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import { AuthProvider } from "./contexts/AuthContext";
import QueryProvider from "./providers/QueryProvider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <QueryProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}
