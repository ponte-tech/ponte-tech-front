"use client";

import { Box, Grid } from "@mui/material";
import HomeSection from "./components/home/home-section";
import AboutSection from "./components/about/about-section";
import OutsourcingSection from "./components/outsourcing/outsourcing-section";
import MethodologySection from "./components/metodology/metodology-section";
import HuntingSection from "./components/hunting/hunting-section";
import VacanciesSection from "./components/vacancies/vacancies-section";
import ClientOpinionSection from "./components/client-opinion/client-opinion-section";
import ContactSession from "./components/contact/contact-session";

export default function Home() {
  return (
    <Box>
      <Box id="home">
        <HomeSection />
      </Box>
      <Box id="about">
        <AboutSection />
      </Box>
      <Box id="metodology">
        <MethodologySection />
      </Box>
      <Box id="services">
        <OutsourcingSection />
        <HuntingSection />
      </Box>
      <Box id="vacancies">
        <VacanciesSection />
      </Box>
      <Box id="client-opinion">
        <ClientOpinionSection />
      </Box>
      <Box id="contact">
        <ContactSession />
      </Box>
    </Box>
  );
}
