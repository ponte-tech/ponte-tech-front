import { Box, Typography } from "@mui/material";

interface SmallInfoCardProps {
  image: string;
  title: string;
  description: string;
  imageBg?: string;
  imagePadding?: number;
  invertImageOrder?: boolean;
}

export default function SmallInfoCard({
  image,
  title,
  description,
  imageBg = "rgba(130, 112, 255, 0.1)",
  imagePadding = 9,
  invertImageOrder = false,
}: Readonly<SmallInfoCardProps>) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(233, 233, 233, 1)",
        borderRadius: 3,
        p: "16px",
        background: "transparent",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: invertImageOrder ? "column" : "row",
          alignItems: invertImageOrder ? "left" : "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: imageBg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={image}
            alt={title}
            style={{
              objectFit: "contain",
              background: "transparent",
              padding: imagePadding,
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: { xs: "18px", md: "20px" },
            fontWeight: 400,
            fontFamily: "Sora, sans-serif",
            color: "black",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          mt: 2,
        }}
      >
        <Typography
          sx={{
            color: "rgba(107, 107, 107, 1)",
            fontSize: { xs: "16px", md: "14px" },
            fontWeight: 400,
            fontFamily: "Sora, sans-serif",
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
