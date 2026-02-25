import { Box, Typography, TextField } from "@mui/material";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { ContactForm, formSchema } from "./form-validation";
import { formatPhone, unmaskPhone } from "@/app/utils/format-utils";
import axios from "axios";
import { BackendPaths } from "@/app/utils/backend-paths";
import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import ContainedPurpleButton from "../buttons/contened-purple";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

export default function ContactSession() {
  const SITE_KEY = "6LdKKEsrAAAAAGVqxBMdzEi1IpjZcU1cnHKWVm3z";
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    setError,
    clearErrors,setValue
  } = useForm<ContactForm>({
    resolver: joiResolver(formSchema),
  });



  const onSubmit = async (data: ContactForm) => {
   

    try {
      const response = await axios.post(BackendPaths.sendMessage, data);
      if (response.status === 200) {
        setResponseMsg("Mensagem enviada com sucesso!");
        setOpen(true);
        reset();
        return;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setResponseMsg("Erro ao enviar mensagem. Tente novamente mais tarde.");
        setOpen(true);
        recaptchaRef.current?.reset();
        clearErrors("captcha");
        return;
      }
    }
  };

  useEffect(()=>{
    register("captcha", {
      required: "Captcha é obrigatório",})
  },[register]);

  return (
    <Box sx={{ backgroundColor: "#7F56D9" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          py: { xs: "40px", md: "80px" },
          mt: { xs: "40px", md: "80px" },
          maxWidth: "90vw",
          mx: "auto",
          gap: { xs: "40px", md: "60px" },
        }}
      >
        {/* Informações de Contato */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            color: "#FFFFFF",
            background: "transparent",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "24px", md: "28px" },
              fontWeight: 700,
              lineHeight: { xs: "32px", md: "40px" },
              fontFamily: "Sora, sans-serif",
              background: "transparent",
            }}
          >
            Pronto para transformar sua equipe de tecnologia?
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              fontWeight: 400,
              lineHeight: { xs: "24px", md: "32px" },
              fontFamily: "Sora, sans-serif",
              background: "transparent",
              width: { xs: "100%", md: "80%" },
            }}
          >
            Entre em contato conosco hoje mesmo e descubra como podemos ajudar
            sua empresa a crescer com as melhores soluções em tecnologia.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "transparent",
              mt: { xs: 0, md: 2 },
            }}
          >
            <Typography
              sx={{
                fontSize: "24px",
                background: "transparent",
                fontWeight: 600,
                fontFamily: "Sora, sans-serif",
              }}
            >
              Informações de contato
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
              }}
            >
              <Box
                sx={{
                  p: 0.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <EmailIcon
                  sx={{ background: "transparent", fontSize: "28px" }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  background: "transparent",
                  fontWeight: 400,
                  fontFamily: "Sora, sans-serif",
                }}
              >
                Email <br />
                <Box
                  component="a"
                  href="mailto:contato@ponte-tech.com.br"
                  sx={{
                    color: "inherit",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  contato@ponte-tech.com.br
                </Box>
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
              }}
            >
              <Box
                sx={{
                  p: 0.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <PhoneIcon
                  sx={{ background: "transparent", fontSize: "28px" }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  background: "transparent",
                  fontWeight: 400,
                  fontFamily: "Sora, sans-serif",
                }}
              >
                Telefone <br />
                <Box
                  component="a"
                  href="tel:+5511915788441"
                  sx={{
                    color: "inherit",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  (11) 91578-8441
                </Box>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Formulário de Contato */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            width: "100%",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "20px", md: "24px" },
              fontWeight: 700,
              lineHeight: { xs: "28px", md: "32px" },
              fontFamily: "Sora, sans-serif",
              mb: "16px",
            }}
          >
            Envie uma Mensagem
          </Typography>
          <Box
            onSubmit={handleSubmit(onSubmit)}
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <TextField
              label="Nome completo"
              variant="outlined"
              fullWidth
              size="small"
              {...register("nomeCompleto")}
              error={!!errors.nomeCompleto}
              helperText={errors.nomeCompleto?.message as string}
            />
            <Box
              sx={{
                display: "flex",
                gap: "18px",
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                label="E-mail"
                variant="outlined"
                fullWidth
                size="small"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
              <Controller
                name="telefone"
                control={control}
                defaultValue=""
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <TextField
                    label="Telefone"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={formatPhone(value)}
                    onChange={(e) => {
                      const rawValue = unmaskPhone(e.target.value);
                      onChange(rawValue);
                    }}
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Box>
            <TextField
              label="Empresa"
              variant="outlined"
              fullWidth
              size="small"
              {...register("empresa")}
              error={!!errors.empresa}
              helperText={errors.empresa?.message as string}
            />
            <TextField
              label="Mensagem"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              {...register("mensagem")}
              error={!!errors.mensagem}
              helperText={errors.mensagem?.message as string}
            />
            {/* ReCAPTCHA */}
            <Box sx={{ alignSelf: "center" }}>
              <ReCAPTCHA
                sitekey={SITE_KEY}
                ref={recaptchaRef}
                onChange={(token) => {
                 setValue("captcha", token || "");
                  clearErrors("captcha");
                }}
                onExpired={() => {
                  setValue("captcha","");
                  setError("captcha", {
                    message: "O reCAPTCHA expirou. Tente novamente.",
                  });
                }}
              />
              {errors.captcha && (
                <Typography color="error" fontSize="0.875rem" mt={1}>
                  {errors.captcha.message}
                </Typography>
              )}
            </Box>
            <ContainedPurpleButton
              width="100%"
              type="submit"
              disabled={isSubmitting}
            >
              Enviar mensagem{" "}
              <SendOutlinedIcon
                sx={{
                  color: "white",
                  background: "transparent",
                  fontSize: "18px",
                }}
              />
            </ContainedPurpleButton>
          </Box>
        </Box>
      </Box>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="spring-modal-title" variant="h6" component="h2">
            Envio de Mensagem
          </Typography>
          <Typography id="spring-modal-description" sx={{ mt: 2 }}>
            {responseMsg}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}
