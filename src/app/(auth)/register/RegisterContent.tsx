"use client";

import { useState } from "react";
import { Box, Button, Typography, Link, Fade, Card, Grid, Alert, CircularProgress } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import authService from "@/app/services/authService";
import FormWizard from "@/app/components/forms/FormWizard";
import VendedorSignupForm from "@/app/components/forms/VendedorSignupForm";
import ProfessorSignupForm from "@/app/components/forms/ProfessorSignupForm";
import ColaboradorSignupForm from "@/app/components/forms/ColaboradorSignupForm";
import ContadorSignupForm from "@/app/components/forms/ContadorSignupForm";
import {
  SignupVendedorRequest,
  SignupProfessorRequest,
  SignupColaboradorRequest,
  SignupContadorRequest,
} from "@/app/types/api";

type UserType = "vendedor" | "professor" | "colaborador" | "contador" | null;

interface RegisterCardProps {
  icon: string;
  title: string;
  description: string;
  type: UserType;
  onClick: (type: UserType) => void;
}

function RegisterCard({ icon, title, description, type, onClick }: RegisterCardProps) {
  return (
    <Card
      onClick={() => onClick(type)}
      sx={{
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid #e0e0e0",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(130, 112, 255, 0.15)",
          borderColor: "#8270FF",
        },
      }}
    >
      <Box sx={{ fontSize: "3rem", mb: 2 }}>{icon}</Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {description}
      </Typography>
    </Card>
  );
}

export default function RegisterContent() {
  const [userType, setUserType] = useState<UserType>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  // Vendedor
  const [vendedorData, setVendedorData] = useState<Partial<SignupVendedorRequest>>({});

  // Professor
  const [professorData, setProfessorData] = useState<Partial<SignupProfessorRequest>>({});

  // Colaborador
  const [colaboradorData, setColaboradorData] = useState<Partial<SignupColaboradorRequest>>({});

  // Contador
  const [contadorData, setContadorData] = useState<Partial<SignupContadorRequest>>({});

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setError("");
    setWizardStep(0);
  };

  const handleVendedorComplete = async () => {
    setIsLoading(true);
    setError("");
    try {
      const fullData = vendedorData as SignupVendedorRequest;
      if (!fullData.termos_aceite) {
        throw new Error("Você deve aceitar os termos e condições");
      }
      await authService.registerVendedor(fullData);
      // Redirect to login or success page
      window.location.href = "/login?success=true";
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar vendedor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfessorComplete = async () => {
    setIsLoading(true);
    setError("");
    try {
      const fullData = professorData as SignupProfessorRequest;
      if (!fullData.termos_aceite) {
        throw new Error("Você deve aceitar os termos e condições");
      }
      await authService.registerProfessor(fullData);
      window.location.href = "/login?success=true";
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar professor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleColaboradorComplete = async () => {
    setIsLoading(true);
    setError("");
    try {
      const fullData = colaboradorData as SignupColaboradorRequest;
      await authService.registerColaborador(fullData);
      window.location.href = "/login?success=true";
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar colaborador");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContadorComplete = async () => {
    setIsLoading(true);
    setError("");
    try {
      const fullData = contadorData as SignupContadorRequest;
      await authService.registerContador(fullData);
      window.location.href = "/login?success=true";
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar contador");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8270FF 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(130, 112, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      {/* Voltar */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          zIndex: 10,
        }}
      >
        <Button
          onClick={() => (userType ? handleSelectType(null) : (window.location.href = "/"))}
          startIcon={<ArrowBack />}
          sx={{
            color: "white",
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.875rem", sm: "1rem" },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          {userType ? "Voltar" : "Voltar ao site"}
        </Button>
      </Box>

      {/* Container centralizado */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 8, sm: 4 },
        }}
      >
        <Fade in timeout={600}>
          <Box
            sx={{
              width: "100%",
              maxWidth: userType ? { xs: "100%", sm: 600 } : { xs: "100%", sm: 800 },
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              p: { xs: 3, sm: 5 },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: { xs: 3, sm: 4 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 140, sm: 180 },
                  height: { xs: 50, sm: 65 },
                  position: "relative",
                }}
              >
                <Image
                  src="/logo-login.svg"
                  alt="Ponte Tech"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>
            </Box>

            {!userType ? (
              <>
                {/* Seleção de Tipo */}
                <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.75rem", sm: "2rem" },
                      color: "#202031",
                      mb: 1,
                    }}
                  >
                    Criar sua conta
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Escolha o tipo de cadastro
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <RegisterCard
                      icon="💼"
                      title="Vendedor"
                      description="Venda cursos e gestione suas matrículas"
                      type="vendedor"
                      onClick={handleSelectType}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RegisterCard
                      icon="👨‍🏫"
                      title="Professor"
                      description="Crie e ensine seus cursos"
                      type="professor"
                      onClick={handleSelectType}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RegisterCard
                      icon="👷"
                      title="Colaborador"
                      description="Gestão de contratos e timesheet"
                      type="colaborador"
                      onClick={handleSelectType}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RegisterCard
                      icon="📊"
                      title="Contador"
                      description="Gestão fiscal e financeira"
                      type="contador"
                      onClick={handleSelectType}
                    />
                  </Grid>
                </Grid>

                {/* Link para login */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Já tem uma conta?{" "}
                    <Link
                      href="/login"
                      sx={{
                        color: "#8270FF",
                        fontWeight: 600,
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Faça login
                    </Link>
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                {/* Formulário com Wizard */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                {isLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userType === "vendedor" ? (
                  <FormWizard
                    steps={[
                      {
                        label: "Dados Pessoais",
                        content: (
                          <VendedorSignupForm
                            formData={vendedorData}
                            onDataChange={setVendedorData}
                          />
                        ),
                      },
                      {
                        label: "Termos",
                        description: "Leia e aceite os termos de uso",
                        content: (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 3 }}>
                              Ao se registrar, você concorda com nossos termos de serviço e política de privacidade.
                            </Typography>
                          </Box>
                        ),
                      },
                    ]}
                    onComplete={handleVendedorComplete}
                    isLoading={isLoading}
                    error={error}
                  />
                ) : userType === "professor" ? (
                  <FormWizard
                    steps={[
                      {
                        label: "Dados Pessoais",
                        content: (
                          <ProfessorSignupForm
                            formData={professorData}
                            onDataChange={setProfessorData}
                          />
                        ),
                      },
                      {
                        label: "Termos",
                        description: "Leia e aceite os termos de uso",
                        content: (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 3 }}>
                              Ao se registrar, você concorda com nossos termos de serviço e política de privacidade.
                            </Typography>
                          </Box>
                        ),
                      },
                    ]}
                    onComplete={handleProfessorComplete}
                    isLoading={isLoading}
                    error={error}
                  />
                ) : userType === "colaborador" ? (
                  <FormWizard
                    steps={[
                      {
                        label: "Dados Pessoais",
                        content: (
                          <ColaboradorSignupForm
                            step={0}
                            formData={colaboradorData}
                            onDataChange={setColaboradorData}
                          />
                        ),
                      },
                      {
                        label: "Endereço",
                        content: (
                          <ColaboradorSignupForm
                            step={1}
                            formData={colaboradorData}
                            onDataChange={setColaboradorData}
                          />
                        ),
                      },
                      {
                        label: "Dados Contratuais",
                        content: (
                          <ColaboradorSignupForm
                            step={2}
                            formData={colaboradorData}
                            onDataChange={setColaboradorData}
                          />
                        ),
                      },
                      {
                        label: "Dados Financeiros",
                        content: (
                          <ColaboradorSignupForm
                            step={3}
                            formData={colaboradorData}
                            onDataChange={setColaboradorData}
                          />
                        ),
                      },
                    ]}
                    onComplete={handleColaboradorComplete}
                    isLoading={isLoading}
                    error={error}
                  />
                ) : userType === "contador" ? (
                  <FormWizard
                    steps={[
                      {
                        label: "Dados",
                        content: (
                          <ContadorSignupForm
                            formData={contadorData}
                            onDataChange={setContadorData}
                          />
                        ),
                      },
                    ]}
                    onComplete={handleContadorComplete}
                    isLoading={isLoading}
                    error={error}
                  />
                ) : null}
              </>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
