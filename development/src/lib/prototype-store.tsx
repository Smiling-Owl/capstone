"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  BarangayProfileRecord,
  PurokProfileRecord,
  PurokProfileSections,
  SEED_BARANGAY_PROFILES,
  SEED_PUROK_PROFILES,
} from "./profile-data";
import {
  BarangayIncidentReportRecord,
  HazardEvent,
  IncidentReportRecord,
  IncidentReportSections,
  SEED_BARANGAY_INCIDENT_REPORTS,
  SEED_HAZARD_EVENTS,
  SEED_INCIDENT_REPORTS,
} from "./hazard-data";
import { SEED_SITREPS, SitRepRecord, SitRepSections } from "./sitrep-data";

const STORAGE_KEY = "drrm-prototype-store-v3";

interface StoreShape {
  purokProfiles: PurokProfileRecord[];
  barangayProfiles: BarangayProfileRecord[];
  hazardEvents: HazardEvent[];
  incidentReports: IncidentReportRecord[];
  barangayIncidentReports: BarangayIncidentReportRecord[];
  sitreps: SitRepRecord[];
}

function seedState(): StoreShape {
  return {
    purokProfiles: SEED_PUROK_PROFILES,
    barangayProfiles: SEED_BARANGAY_PROFILES,
    hazardEvents: SEED_HAZARD_EVENTS,
    incidentReports: SEED_INCIDENT_REPORTS,
    barangayIncidentReports: SEED_BARANGAY_INCIDENT_REPORTS,
    sitreps: SEED_SITREPS,
  };
}

interface PrototypeStoreValue extends StoreShape {
  saveDraft: (id: string, data: PurokProfileSections) => void;
  submitPurokProfile: (id: string, data: PurokProfileSections, submittedBy: string) => void;
  verifyPurokProfile: (id: string, reviewer: string) => void;
  requestPurokCorrection: (id: string, reviewer: string, note: string) => void;
  rejectPurokProfile: (id: string, reviewer: string, note: string) => void;
  verifyBarangayProfile: (id: string, reviewer: string) => void;
  requestBarangayCorrection: (id: string, reviewer: string, note: string) => void;
  createHazardEvent: (event: Omit<HazardEvent, "id" | "createdAt" | "status"> & { activateImmediately: boolean }) => void;
  verifyHazardEvent: (id: string, reviewer: string) => void;
  requestHazardEventCorrection: (id: string, reviewer: string, note: string) => void;
  rejectHazardEvent: (id: string, reviewer: string, note: string) => void;
  saveIncidentDraft: (id: string, data: IncidentReportSections) => void;
  submitIncidentReport: (id: string, data: IncidentReportSections, submittedBy: string) => void;
  verifyIncidentReport: (id: string, reviewer: string) => void;
  requestIncidentCorrection: (id: string, reviewer: string, note: string) => void;
  rejectIncidentReport: (id: string, reviewer: string, note: string) => void;
  verifyBarangayIncidentReport: (id: string, reviewer: string) => void;
  requestBarangayIncidentCorrection: (id: string, reviewer: string, note: string) => void;
  generateSitRep: (record: Omit<SitRepRecord, "id" | "generatedVersion" | "status" | "preparedAt">) => string;
  saveSitRepDraft: (id: string, sections: SitRepSections) => void;
  submitSitRepForReview: (id: string) => void;
  approveSitRep: (id: string, approvedBy: string) => void;
  returnSitRep: (id: string, reviewer: string, note: string) => void;
  exportSitRep: (id: string, exportedBy: string) => void;
  resetPrototypeData: () => void;
}

const PrototypeStoreContext = createContext<PrototypeStoreValue | null>(null);

function loadInitialState(): StoreShape {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    if (!parsed.purokProfiles || !parsed.barangayProfiles || !parsed.hazardEvents || !parsed.incidentReports || !parsed.barangayIncidentReports) {
      throw new Error("malformed store");
    }
    return parsed as StoreShape;
  } catch {
    return seedState();
  }
}

let hazardEventSequence = 0;
let sitrepSequence = 0;

export function ProfileStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreShape>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadInitialState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<PrototypeStoreValue>(
    () => ({
      ...state,
      saveDraft(id, data) {
        setState((prev) => ({
          ...prev,
          purokProfiles: prev.purokProfiles.map((profile) =>
            profile.id === id ? { ...profile, data, status: profile.status === "not_started" ? "draft" : profile.status } : profile,
          ),
        }));
      },
      submitPurokProfile(id, data, submittedBy) {
        setState((prev) => ({
          ...prev,
          purokProfiles: prev.purokProfiles.map((profile) =>
            profile.id === id
              ? { ...profile, data, status: "submitted", submittedBy, submittedAt: new Date().toISOString(), correctionNote: undefined }
              : profile,
          ),
        }));
      },
      verifyPurokProfile(id, reviewer) {
        setState((prev) => ({
          ...prev,
          purokProfiles: prev.purokProfiles.map((profile) =>
            profile.id === id ? { ...profile, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : profile,
          ),
        }));
      },
      requestPurokCorrection(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          purokProfiles: prev.purokProfiles.map((profile) =>
            profile.id === id
              ? { ...profile, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : profile,
          ),
        }));
      },
      rejectPurokProfile(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          purokProfiles: prev.purokProfiles.map((profile) =>
            profile.id === id
              ? { ...profile, status: "rejected", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : profile,
          ),
        }));
      },
      verifyBarangayProfile(id, reviewer) {
        setState((prev) => ({
          ...prev,
          barangayProfiles: prev.barangayProfiles.map((profile) =>
            profile.id === id ? { ...profile, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : profile,
          ),
        }));
      },
      requestBarangayCorrection(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          barangayProfiles: prev.barangayProfiles.map((profile) =>
            profile.id === id
              ? { ...profile, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : profile,
          ),
        }));
      },
      createHazardEvent({ activateImmediately, ...event }) {
        hazardEventSequence += 1;
        const newEvent: HazardEvent = {
          ...event,
          id: `hazard-${Date.now()}-${hazardEventSequence}`,
          createdAt: new Date().toISOString(),
          status: activateImmediately ? "active" : "submitted",
        };
        setState((prev) => ({ ...prev, hazardEvents: [newEvent, ...prev.hazardEvents] }));
      },
      verifyHazardEvent(id, reviewer) {
        setState((prev) => ({
          ...prev,
          hazardEvents: prev.hazardEvents.map((event) =>
            event.id === id ? { ...event, status: "active", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : event,
          ),
        }));
      },
      requestHazardEventCorrection(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          hazardEvents: prev.hazardEvents.map((event) =>
            event.id === id
              ? { ...event, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : event,
          ),
        }));
      },
      rejectHazardEvent(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          hazardEvents: prev.hazardEvents.map((event) =>
            event.id === id
              ? { ...event, status: "rejected", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : event,
          ),
        }));
      },
      saveIncidentDraft(id, data) {
        setState((prev) => ({
          ...prev,
          incidentReports: prev.incidentReports.map((report) =>
            report.id === id ? { ...report, data, status: report.status === "not_started" ? "draft" : report.status } : report,
          ),
        }));
      },
      submitIncidentReport(id, data, submittedBy) {
        setState((prev) => ({
          ...prev,
          incidentReports: prev.incidentReports.map((report) =>
            report.id === id
              ? { ...report, data, status: "submitted", submittedBy, submittedAt: new Date().toISOString(), correctionNote: undefined }
              : report,
          ),
        }));
      },
      verifyIncidentReport(id, reviewer) {
        setState((prev) => ({
          ...prev,
          incidentReports: prev.incidentReports.map((report) =>
            report.id === id ? { ...report, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : report,
          ),
        }));
      },
      requestIncidentCorrection(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          incidentReports: prev.incidentReports.map((report) =>
            report.id === id
              ? { ...report, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : report,
          ),
        }));
      },
      rejectIncidentReport(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          incidentReports: prev.incidentReports.map((report) =>
            report.id === id
              ? { ...report, status: "rejected", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : report,
          ),
        }));
      },
      verifyBarangayIncidentReport(id, reviewer) {
        setState((prev) => ({
          ...prev,
          barangayIncidentReports: prev.barangayIncidentReports.map((report) =>
            report.id === id ? { ...report, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : report,
          ),
        }));
      },
      requestBarangayIncidentCorrection(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          barangayIncidentReports: prev.barangayIncidentReports.map((report) =>
            report.id === id
              ? { ...report, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
              : report,
          ),
        }));
      },
      generateSitRep(record) {
        sitrepSequence += 1;
        const id = `sitrep-${Date.now()}-${sitrepSequence}`;
        const newRecord: SitRepRecord = {
          ...record,
          id,
          generatedVersion: 1,
          status: "draft",
          preparedAt: new Date().toISOString(),
        };
        setState((prev) => ({ ...prev, sitreps: [newRecord, ...prev.sitreps] }));
        return id;
      },
      saveSitRepDraft(id, sections) {
        setState((prev) => ({
          ...prev,
          sitreps: prev.sitreps.map((s) => (s.id === id ? { ...s, sections } : s)),
        }));
      },
      submitSitRepForReview(id) {
        setState((prev) => ({
          ...prev,
          sitreps: prev.sitreps.map((s) => (s.id === id ? { ...s, status: "under_review", returnNote: undefined } : s)),
        }));
      },
      approveSitRep(id, approvedBy) {
        setState((prev) => ({
          ...prev,
          sitreps: prev.sitreps.map((s) =>
            s.id === id ? { ...s, status: "approved", approvedBy, approvedAt: new Date().toISOString() } : s,
          ),
        }));
      },
      returnSitRep(id, reviewer, note) {
        setState((prev) => ({
          ...prev,
          sitreps: prev.sitreps.map((s) =>
            s.id === id ? { ...s, status: "returned", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), returnNote: note } : s,
          ),
        }));
      },
      exportSitRep(id, exportedBy) {
        setState((prev) => ({
          ...prev,
          sitreps: prev.sitreps.map((s) =>
            s.id === id ? { ...s, status: "exported", exportedBy, exportedAt: new Date().toISOString() } : s,
          ),
        }));
      },
      resetPrototypeData() {
        setState(seedState());
      },
    }),
    [state],
  );

  return <PrototypeStoreContext.Provider value={value}>{children}</PrototypeStoreContext.Provider>;
}

export function usePrototypeStore() {
  const ctx = useContext(PrototypeStoreContext);
  if (!ctx) throw new Error("usePrototypeStore must be used within ProfileStoreProvider");
  return ctx;
}
