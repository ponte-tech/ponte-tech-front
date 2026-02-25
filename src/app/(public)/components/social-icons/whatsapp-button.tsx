import { WhatsApp } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionLink = motion.a;

export default function WhatsAppButton() {
    return (
        <MotionLink
            href="https://wa.me/5511915788441"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ y: 0 }}
            animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            style={{
                height: 65,
                width: 65,
                borderRadius: "50%",
                position: "fixed",
                zIndex: 1000,
                bottom: 20,
                right: 20,
                textDecoration: "none",
            }}
        >
            <WhatsApp
                sx={{
                    borderRadius: "50%",
                    p: 1.2,
                    bgcolor: "#8270FF",
                    width: "100%",
                    height: "100%",
                    color: "#FFFFFF",
                    transition: "background 0.3s ease",
                    "&:hover": {
                        backgroundColor: "#6F60E0",
                        cursor: "pointer",
                    },
                }}
            />
        </MotionLink>
    );
}
