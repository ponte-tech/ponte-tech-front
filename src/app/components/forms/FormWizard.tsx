"use client";

import React, { ReactNode } from "react";
import { Box, Stepper, Step, StepLabel, Button, Typography, Alert } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface WizardStep {
  label: string;
  description?: string;
  content: ReactNode;
}

interface FormWizardProps {
  steps: WizardStep[];
  onComplete: () => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
  onStepChange?: (step: number) => void;
}

export default function FormWizard({
  steps,
  onComplete,
  isLoading = false,
  error,
  onStepChange,
}: FormWizardProps) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    const newStep = activeStep + 1;
    setActiveStep(newStep);
    onStepChange?.(newStep);
  };

  const handleBack = () => {
    const newStep = activeStep - 1;
    setActiveStep(newStep);
    onStepChange?.(newStep);
  };

  const handleComplete = async () => {
    try {
      await onComplete();
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Step Description */}
      {steps[activeStep].description && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {steps[activeStep].description}
        </Typography>
      )}

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>{steps[activeStep].content}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
        <Button
          disabled={activeStep === 0 || isLoading}
          onClick={handleBack}
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Anterior
        </Button>

        <Box sx={{ flex: 1 }} />

        {isLastStep ? (
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={isLoading}
            endIcon={isLoading ? undefined : <ArrowForward />}
          >
            {isLoading ? "Finalizando..." : "Finalizar Cadastro"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
          >
            Próximo
          </Button>
        )}
      </Box>
    </Box>
  );
}
