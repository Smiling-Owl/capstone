# Scope and Limitations (Revised Based on Deep Research)

Based on rigorous triangulation of industry standards (NDRRMC/DILG/OCD guidelines) and academic precedents (CS/IT capstone methodology, Sagip Manileño, Bandilyo App), the project scope and limitations are strictly defined below. 

## Scope of the System

1. **Information Consolidation & Standardized Document Generation**
   The system is scoped to aggregate grassroots disaster data up to the City DRRMO level. Rather than attempting an unfeasible direct API integration with a non-existent public national database, the system is explicitly designed to automatically populate and generate the standardized **Operation L!STO Situation Report (SitRep)** templates (in PDF/DOCX format) mandated by the Regional Office of Civil Defense (OCD).
   *(Backed by: OCD Reporting Standards, DOST GeoRiskPH guidelines, DSWD DROMIC)*

2. **Offline-First SMS Fallback Architecture**
   The project includes a hybrid data transmission protocol. During internet blackouts, the system will utilize an SMS fallback mechanism. This is scoped strictly to software-based solutions utilizing standard Android intents, consumer smartphones, and basic GSM modems or SMS Gateway APIs at the local server, explicitly excluding the development of specialized custom IoT hardware.
   *(Backed by: Sagip Manileño [WJARR, 2026], Bandilyo App [EVSU, 2025], General CS Capstone Precedents)*

## Limitations of the System

1. **Mandatory Human-in-the-Loop Verification**
   The system does NOT feature fully autonomous verification of disaster reports. In strict compliance with DILG Operation L!STO protocols, the automated validation of data cannot supersede the legal requirement for official **Modes of Verification (MOVs)**. Therefore, human verification by authorized City DRRMO officers remains a mandatory step in the system workflow before any grassroots report can be escalated into an official SitRep.
   *(Backed by: DILG L!STO Disaster Preparedness Manuals, LGA.gov.ph, COA Audit Compliance Standards)*

2. **Exclusion of Predictive AI Forecasting**
   The system is entirely reactive and designed for efficient incident reporting, consolidation, and spatial visualization (mapping historical/current incidents). Due to the constraints of a 5-month development lifecycle and the lack of massive historical environmental datasets, the system is strictly limited to rule-based logic (e.g., threshold alerts based on user reports) and explicitly excludes any advanced AI-driven meteorological or environmental impact forecasting models.
   *(Backed by: General CS/IT Capstone Methodology Guidelines, Sagip Manileño Architecture, Bandilyo App Constraints)*
