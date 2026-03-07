"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import RegisterColaboradorForm from "./components/RegisterColaboradorForm";
import RegisterContadorForm from "./components/RegisterContadorForm";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Verificar se é admin
  if (user?.userType !== "admin") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          ⛔ Acesso Restrito. Apenas administradores podem acessar esta página.
        </Alert>
      </Container>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSuccessMessage("");
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <PeopleIcon sx={{ fontSize: 32, color: "#8270FF" }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestão de Usuários
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Registre novos colaboradores e contadores no sistema
        </Typography>
      </Box>

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="registro de usuários"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#8270FF",
                backgroundColor: "rgba(130, 112, 255, 0.05)",
              },
            },
            "& .Mui-selected": {
              color: "#8270FF",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8270FF",
              height: 3,
            },
          }}
        >
          <Tab label="👷 Colaborador" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
          <Tab label="📊 Contador" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
        </Tabs>
      </Box>

      {/* Colaborador Form */}
      <TabPanel value={tabValue} index={0}>
        <RegisterColaboradorForm onSuccess={handleSuccess} />
      </TabPanel>

      {/* Contador Form */}
      <TabPanel value={tabValue} index={1}>
        <RegisterContadorForm onSuccess={handleSuccess} />
      </TabPanel>
    </Container>
  );
}
