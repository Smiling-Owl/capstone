# Proposed System Features Draft (For Thesis Inclusion)

This document outlines potential groundbreaking, highly impactful features that can be integrated into the specific modules of the Online Disaster Situation Reports Generation and Record Management System. These features are designed to be fully implementable within a 5-month Agile sprint or capstone timeframe.

---

## 1. Offline-First SMS Fallback Mechanism
**Module:** Disaster Reporting Module
* **Description:** During severe typhoons or disasters, internet and data infrastructure often collapse. This feature allows purok leaders to fill out digital reporting forms offline. Upon hitting "Submit", the system detects the lack of internet connectivity and automatically encrypts/compresses the JSON payload into an SMS format. It then sends the data via standard cellular signal to an SMS Gateway at the City Hall/ZCDRRMO server, which automatically decodes and inputs it directly into the database.
* **Why it is doable (5 months):** Implementing local storage (IndexedDB or SQLite) and an Intent to trigger SMS dispatch is standard mobile development logic. Setting up a basic GSM modem as a receiving gateway server is highly achievable.
* **Why it is groundbreaking:** Standard web-only disaster applications become useless during telecom blackouts. A hybrid API/SMS architecture ensures 100% reporting uptime regardless of Wi-Fi/4G availability.
* **Academic Proof of Feasibility:** This exact architecture was successfully built and tested in academic capstones within 3-6 month timeframes, such as the *Sagip Manileño* app (WJARR, 2026) and the *Bandilyo App* (IEEE, 2025), both achieving "Excellent" ISO 25010 efficiency ratings.

---

## 2. Geo-Tagged Incident Heatmap Dashboard
**Module:** Dashboard Module
* **Description:** Instead of presenting static charts and numbers, the dashboard features a live, interactive map utilizing an open-source mapping SDK (e.g., Leaflet.js or Mapbox). When purok leaders submit a report via their mobile devices, the app automatically captures their GPS coordinates. The centralized dashboard then plots these incidents as "heat bubbles" (e.g., red for severe flooding/casualties, orange for minor infrastructure damage).
* **Why it is doable (5 months):** The HTML5 Geolocation API is universally supported on modern browsers and mobile devices. Integrating Javascript mapping libraries requires minimal setup and integrates seamlessly with backend databases.
* **Why it is groundbreaking:** It transforms raw text data into spatial intelligence, allowing the City DRRMO to visually identify which puroks are cut off or most devastated, enabling the precise, geographical dispatch of rescue assets.
* **Academic Proof of Feasibility:** The *RescueLink* SOS alert system (IJCSMC, 2024) successfully integrated real-time GPS coordinate capture and interactive GIS mapping within a standard undergraduate capstone cycle.

---

## 3. Automated NDRRMC-Compliant SitRep Template Mapping
**Module:** SitRep Generation Module
* **Description:** Instead of generating generic, customized PDF reports, the system strictly outputs the Situation Report using the exact, official formatting template required by the National Disaster Risk Reduction and Management Council (NDRRMC). As barangays submit casualty, evacuation, and infrastructure damage metrics, the system mathematically aggregates the data and auto-populates the official NDRRMC pro-forma PDF structure for instant submission.
* **Why it is doable (5 months):** Because the system is already aggregating grassroots data, mapping it to a strict PDF template using a library like `pdfmake` or `jsPDF` only requires specific layout structuring, which is highly viable within a few weeks of development.
* **Why it is groundbreaking:** Currently, municipal LDRRMOs spend hours manually translating fragmented texts into the strict NDRRMC format. Automating this eliminates the biggest administrative bottleneck during a disaster and accelerates the release of national Quick Response Funds (QRF).

---

## 4. Automated Alert Escalation & Role-Based Push Notifications
**Module:** Disaster Report Verification Module
* **Description:** If a report submitted by a barangay crosses a critical severity threshold (e.g., casualties reported, complete destruction of a bridge, or request for forced evacuation), the system automatically bypasses the standard queue. It instantly triggers an SMS or Push Notification directly to the ZCDRRMO verification personnel and the Mayor, alerting them to prioritize and verify that specific report immediately.
* **Why it is doable (5 months):** Integrating free or low-cost messaging APIs (like Twilio, Semaphore, or Firebase Cloud Messaging) requires only a few lines of code and can easily be linked to logic triggers in the database.
* **Why it is groundbreaking:** It introduces a triage mechanism into disaster management, ensuring that life-and-death reports are not buried under hundreds of minor damage reports, streamlining the verification process.
