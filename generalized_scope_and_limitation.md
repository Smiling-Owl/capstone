# 1.4 Scope and Limitations

The study focuses on the design, development, and evaluation of a localized, role-based Online Disaster Situation Reports Generation and Record Management System tailored for Local Government Units (LGUs). To ensure the feasibility of the project within a 5-month development lifecycle and to comply with the technical and procedural realities of Philippine disaster management, the following boundaries are established.

### 1.4.1 Scope of the Study

**Information Consolidation and Standardized Document Generation**
The system is explicitly scoped to aggregate grassroots disaster data from the purok and barangay levels up to the City Disaster Risk Reduction and Management Office (CDRRMO). Rather than attempting direct API integration with a non-existent public national database, the system is designed to automatically map, calculate, and populate the aggregated data into the standardized **Operation L!STO Situation Report (SitRep)** templates (in PDF/DOCX format) as mandated by the Regional Office of Civil Defense (OCD). 

**Offline-First SMS Fallback Architecture**
To address the frequent collapse of internet infrastructure during severe typhoons, the project's scope includes a hybrid data transmission protocol. The system will feature an offline-first SMS fallback mechanism. This functionality is scoped strictly to software-based solutions utilizing standard Android intents on consumer smartphones and basic GSM modems (or SMS Gateway APIs) at the local server, explicitly excluding the development or procurement of specialized, custom IoT hardware.

### 1.4.2 Limitations of the Study

**Mandatory Human-in-the-Loop Verification**
The system does not feature fully autonomous verification of disaster incident reports. In strict compliance with DILG Operation L!STO protocols and Commission on Audit (COA) standards, automated data validation cannot supersede the legal requirement for official **Modes of Verification (MOVs)** (e.g., signed technical findings, physical documentation, photos). Therefore, human verification by authorized City DRRMO officers remains a mandatory, unavoidable limitation in the system workflow before any grassroots report can be escalated into an official SitRep.

**Exclusion of Predictive AI Forecasting**
The system is designed as a reactive reporting, consolidation, and spatial visualization tool (mapping historical and current incidents). Due to the constraints of the academic timeframe and the lack of massive historical environmental datasets, the system is strictly limited to rule-based logic (such as threshold alerts based on user-submitted reports). It explicitly excludes advanced AI-driven meteorological forecasting, long-term climate analysis, or predictive environmental impact modeling.
