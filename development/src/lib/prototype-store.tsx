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
  CDRA_HAZARD_REGISTRY,
  HazardEvent,
  HazardType,
  IncidentReportRecord,
  IncidentReportSections,
  SEED_BARANGAY_INCIDENT_REPORTS,
  SEED_HAZARD_EVENTS,
  SEED_INCIDENT_REPORTS,
} from "./hazard-data";
import { SEED_SITREPS, SitRepRecord, SitRepSections } from "./sitrep-data";
import { DrrmPermission, SEED_USERS, UserRecord } from "./account-data";
import { AuditCategory, AuditEvent, nextAuditId, SEED_AUDIT_EVENTS } from "./audit-data";
import { PrototypeConfig, SEED_CONFIG, SitRepTemplateConfig } from "./config-data";

const STORAGE_KEY = "drrm-prototype-store-v3";

interface StoreShape {
  purokProfiles: PurokProfileRecord[];
  barangayProfiles: BarangayProfileRecord[];
  hazardEvents: HazardEvent[];
  incidentReports: IncidentReportRecord[];
  barangayIncidentReports: BarangayIncidentReportRecord[];
  sitreps: SitRepRecord[];
  users: UserRecord[];
  auditEvents: AuditEvent[];
  config: PrototypeConfig;
  hazardTypes: HazardType[];
}

function seedState(): StoreShape {
  return {
    purokProfiles: SEED_PUROK_PROFILES,
    barangayProfiles: SEED_BARANGAY_PROFILES,
    hazardEvents: SEED_HAZARD_EVENTS,
    incidentReports: SEED_INCIDENT_REPORTS,
    barangayIncidentReports: SEED_BARANGAY_INCIDENT_REPORTS,
    sitreps: SEED_SITREPS,
    users: SEED_USERS,
    auditEvents: SEED_AUDIT_EVENTS,
    config: SEED_CONFIG,
    hazardTypes: CDRA_HAZARD_REGISTRY,
  };
}

export interface NewUserInput {
  fullName: string;
  username: string;
  level: "purok" | "barangay" | "drrm";
  unit: string;
  parentUnit?: string;
  roleLabel: string;
  permissions?: DrrmPermission[];
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
  inviteUser: (input: NewUserInput, actor: string, authority: string) => void;
  deactivateUser: (id: string, actor: string) => void;
  reactivateUser: (id: string, actor: string) => void;
  resendUserInvitation: (id: string, actor: string) => void;
  updateUserPermissions: (id: string, permissions: DrrmPermission[], actor: string) => void;
  changePassword: (id: string, actor: string) => void;
  addHazardType: (input: { name: string; category: HazardType["category"]; description: string }, actor: string) => void;
  setHazardTypeStatus: (id: string, status: "approved" | "archived", actor: string) => void;
  updateSitrepConfig: (patch: Partial<SitRepTemplateConfig>, actor: string) => void;
  updateSchedule: (cyclePeriodLabel: string, phaseId: string, patch: { opensAt?: string; closesAt?: string }, actor: string) => void;
  resetPrototypeData: () => void;
}

const PrototypeStoreContext = createContext<PrototypeStoreValue | null>(null);

function loadInitialState(): StoreShape {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    if (
      !parsed.purokProfiles ||
      !parsed.barangayProfiles ||
      !parsed.hazardEvents ||
      !parsed.incidentReports ||
      !parsed.barangayIncidentReports ||
      !parsed.sitreps
    ) {
      throw new Error("malformed store");
    }
    return {
      ...seedState(),
      ...parsed,
      users: parsed.users && parsed.users.length > 0 ? parsed.users : SEED_USERS,
      auditEvents: parsed.auditEvents && parsed.auditEvents.length > 0 ? parsed.auditEvents : SEED_AUDIT_EVENTS,
      config: parsed.config ?? SEED_CONFIG,
      hazardTypes: parsed.hazardTypes && parsed.hazardTypes.length > 0 ? parsed.hazardTypes : CDRA_HAZARD_REGISTRY,
    };
  } catch {
    return seedState();
  }
}

let hazardEventSequence = 0;
let sitrepSequence = 0;
let userSequence = 0;
let hazardTypeSequence = 0;

function auditEvent(category: AuditCategory, action: string, actor: string, target: string, detail?: string): AuditEvent {
  return {
    id: nextAuditId(),
    occurredAt: new Date().toISOString(),
    actor,
    action,
    category,
    target,
    detail,
  };
}

function samePermissions(a: DrrmPermission[] | undefined, b: DrrmPermission[]) {
  const left = [...(a ?? [])].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

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
        setState((prev) => {
          const record = prev.purokProfiles.find((profile) => profile.id === id);
          if (!record || record.status === "verified" || record.status === "active") return prev;
          const audit = auditEvent("reporting", "Submitted Purok profile", submittedBy, id);
          return {
            ...prev,
            purokProfiles: prev.purokProfiles.map((profile) =>
              profile.id === id
                ? { ...profile, data, status: "submitted", submittedBy, submittedAt: new Date().toISOString(), correctionNote: undefined }
                : profile,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      verifyPurokProfile(id, reviewer) {
        setState((prev) => {
          const record = prev.purokProfiles.find((profile) => profile.id === id);
          if (!record || record.status === "verified") return prev;
          const audit = auditEvent("verification", "Verified Purok profile", reviewer, id);
          return {
            ...prev,
            purokProfiles: prev.purokProfiles.map((profile) =>
              profile.id === id ? { ...profile, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : profile,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      requestPurokCorrection(id, reviewer, note) {
        setState((prev) => {
          const record = prev.purokProfiles.find((profile) => profile.id === id);
          if (!record || ["correction_requested", "rejected", "verified"].includes(record.status)) return prev;
          const audit = auditEvent("verification", "Requested correction on Purok profile", reviewer, id, note);
          return {
            ...prev,
            purokProfiles: prev.purokProfiles.map((profile) =>
              profile.id === id
                ? { ...profile, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : profile,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      rejectPurokProfile(id, reviewer, note) {
        setState((prev) => {
          const record = prev.purokProfiles.find((profile) => profile.id === id);
          if (!record || record.status === "rejected") return prev;
          const audit = auditEvent("verification", "Rejected Purok profile", reviewer, id, note);
          return {
            ...prev,
            purokProfiles: prev.purokProfiles.map((profile) =>
              profile.id === id
                ? { ...profile, status: "rejected", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : profile,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      verifyBarangayProfile(id, reviewer) {
        setState((prev) => {
          const record = prev.barangayProfiles.find((profile) => profile.id === id);
          if (!record || record.status === "verified") return prev;
          const audit = auditEvent("verification", "Verified Barangay profile", reviewer, id);
          return {
            ...prev,
            barangayProfiles: prev.barangayProfiles.map((profile) =>
              profile.id === id ? { ...profile, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : profile,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      requestBarangayCorrection(id, reviewer, note) {
        setState((prev) => {
          const record = prev.barangayProfiles.find((profile) => profile.id === id);
          if (!record || ["correction_requested", "rejected", "verified"].includes(record.status)) return prev;
          const audit = auditEvent("verification", "Requested correction on Barangay profile", reviewer, id, note);
          return {
            ...prev,
            barangayProfiles: prev.barangayProfiles.map((profile) =>
              profile.id === id
                ? { ...profile, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : profile,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      createHazardEvent({ activateImmediately, ...event }) {
        hazardEventSequence += 1;
        const audit = auditEvent(
          "reporting",
          activateImmediately ? "Created hazard event" : "Submitted hazard event for verification",
          event.createdBy,
          event.title,
        );
        const newEvent: HazardEvent = {
          ...event,
          id: `hazard-${Date.now()}-${hazardEventSequence}`,
          createdAt: new Date().toISOString(),
          status: activateImmediately ? "active" : "submitted",
        };
        setState((prev) => ({
          ...prev,
          hazardEvents: [newEvent, ...prev.hazardEvents],
          auditEvents: [audit, ...prev.auditEvents],
        }));
      },
      verifyHazardEvent(id, reviewer) {
        setState((prev) => {
          const record = prev.hazardEvents.find((event) => event.id === id);
          if (!record || record.status === "active") return prev;
          const audit = auditEvent("verification", "Activated hazard event", reviewer, id);
          return {
            ...prev,
            hazardEvents: prev.hazardEvents.map((event) =>
              event.id === id ? { ...event, status: "active", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : event,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      requestHazardEventCorrection(id, reviewer, note) {
        setState((prev) => {
          const record = prev.hazardEvents.find((event) => event.id === id);
          if (!record || record.status === "correction_requested" || record.status === "active") return prev;
          const audit = auditEvent("verification", "Requested correction on hazard event", reviewer, id, note);
          return {
            ...prev,
            hazardEvents: prev.hazardEvents.map((event) =>
              event.id === id
                ? { ...event, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : event,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      rejectHazardEvent(id, reviewer, note) {
        setState((prev) => {
          const record = prev.hazardEvents.find((event) => event.id === id);
          if (!record || record.status === "rejected" || record.status === "active") return prev;
          const audit = auditEvent("verification", "Rejected hazard event", reviewer, id, note);
          return {
            ...prev,
            hazardEvents: prev.hazardEvents.map((event) =>
              event.id === id
                ? { ...event, status: "rejected", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : event,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
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
        setState((prev) => {
          const record = prev.incidentReports.find((report) => report.id === id);
          if (!record || record.status === "verified" || record.status === "active") return prev;
          const audit = auditEvent("reporting", "Submitted incident report", submittedBy, id);
          return {
            ...prev,
            incidentReports: prev.incidentReports.map((report) =>
              report.id === id
                ? { ...report, data, status: "submitted", submittedBy, submittedAt: new Date().toISOString(), correctionNote: undefined }
                : report,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      verifyIncidentReport(id, reviewer) {
        setState((prev) => {
          const record = prev.incidentReports.find((report) => report.id === id);
          if (!record || record.status === "verified") return prev;
          const audit = auditEvent("verification", "Verified incident report", reviewer, id);
          return {
            ...prev,
            incidentReports: prev.incidentReports.map((report) =>
              report.id === id ? { ...report, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : report,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      requestIncidentCorrection(id, reviewer, note) {
        setState((prev) => {
          const record = prev.incidentReports.find((report) => report.id === id);
          if (!record || ["correction_requested", "rejected", "verified"].includes(record.status)) return prev;
          const audit = auditEvent("verification", "Requested correction on incident report", reviewer, id, note);
          return {
            ...prev,
            incidentReports: prev.incidentReports.map((report) =>
              report.id === id
                ? { ...report, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : report,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      rejectIncidentReport(id, reviewer, note) {
        setState((prev) => {
          const record = prev.incidentReports.find((report) => report.id === id);
          if (!record || record.status === "rejected") return prev;
          const audit = auditEvent("verification", "Rejected incident report", reviewer, id, note);
          return {
            ...prev,
            incidentReports: prev.incidentReports.map((report) =>
              report.id === id
                ? { ...report, status: "rejected", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : report,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      verifyBarangayIncidentReport(id, reviewer) {
        setState((prev) => {
          const record = prev.barangayIncidentReports.find((report) => report.id === id);
          if (!record || record.status === "verified") return prev;
          const audit = auditEvent("verification", "Verified Barangay incident report", reviewer, id);
          return {
            ...prev,
            barangayIncidentReports: prev.barangayIncidentReports.map((report) =>
              report.id === id ? { ...report, status: "verified", reviewedBy: reviewer, reviewedAt: new Date().toISOString() } : report,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      requestBarangayIncidentCorrection(id, reviewer, note) {
        setState((prev) => {
          const record = prev.barangayIncidentReports.find((report) => report.id === id);
          if (!record || ["correction_requested", "rejected", "verified"].includes(record.status)) return prev;
          const audit = auditEvent("verification", "Requested correction on Barangay incident report", reviewer, id, note);
          return {
            ...prev,
            barangayIncidentReports: prev.barangayIncidentReports.map((report) =>
              report.id === id
                ? { ...report, status: "correction_requested", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), correctionNote: note }
                : report,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      generateSitRep(record) {
        sitrepSequence += 1;
        const id = `sitrep-${Date.now()}-${sitrepSequence}`;
        const audit = auditEvent("reporting", "Generated SitRep draft", record.preparedBy, id);
        const newRecord: SitRepRecord = {
          ...record,
          id,
          generatedVersion: 1,
          status: "draft",
          preparedAt: new Date().toISOString(),
        };
        setState((prev) => ({ ...prev, sitreps: [newRecord, ...prev.sitreps], auditEvents: [audit, ...prev.auditEvents] }));
        return id;
      },
      saveSitRepDraft(id, sections) {
        setState((prev) => ({
          ...prev,
          sitreps: prev.sitreps.map((s) => (s.id === id ? { ...s, sections } : s)),
        }));
      },
      submitSitRepForReview(id) {
        setState((prev) => {
          const record = prev.sitreps.find((s) => s.id === id);
          if (!record || record.status === "under_review" || record.status === "approved" || record.status === "exported") return prev;
          const audit = auditEvent("reporting", "Submitted SitRep for review", record.preparedBy, id);
          return {
            ...prev,
            sitreps: prev.sitreps.map((s) => (s.id === id ? { ...s, status: "under_review", returnNote: undefined } : s)),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      approveSitRep(id, approvedBy) {
        setState((prev) => {
          const record = prev.sitreps.find((s) => s.id === id);
          if (!record || record.status === "approved" || record.status === "exported") return prev;
          const audit = auditEvent("approval", `Approved SitRep (v${record.generatedVersion})`, approvedBy, id);
          return {
            ...prev,
            sitreps: prev.sitreps.map((s) =>
              s.id === id ? { ...s, status: "approved", approvedBy, approvedAt: new Date().toISOString() } : s,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      returnSitRep(id, reviewer, note) {
        setState((prev) => {
          const record = prev.sitreps.find((s) => s.id === id);
          if (!record || record.status === "returned" || record.status === "approved" || record.status === "exported") return prev;
          const audit = auditEvent("approval", "Returned SitRep for revision", reviewer, id, note);
          return {
            ...prev,
            sitreps: prev.sitreps.map((s) =>
              s.id === id ? { ...s, status: "returned", reviewedBy: reviewer, reviewedAt: new Date().toISOString(), returnNote: note } : s,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      exportSitRep(id, exportedBy) {
        setState((prev) => {
          const record = prev.sitreps.find((s) => s.id === id);
          if (!record || record.status !== "approved") return prev;
          const audit = auditEvent("export", `Exported SitRep (v${record.generatedVersion})`, exportedBy, id);
          return {
            ...prev,
            sitreps: prev.sitreps.map((s) =>
              s.id === id ? { ...s, status: "exported", exportedBy, exportedAt: new Date().toISOString() } : s,
            ),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      inviteUser(input, actor, authority) {
        userSequence += 1;
        const audit = auditEvent("user_admin", "Invited user", actor, input.fullName, input.roleLabel);
        const newUser: UserRecord = {
          ...input,
          id: `user-${Date.now()}-${userSequence}`,
          username: input.username.trim().toLowerCase(),
          status: "invited",
          issuedBy: authority,
          issuedAt: new Date().toISOString(),
        };
        setState((prev) => ({ ...prev, users: [newUser, ...prev.users], auditEvents: [audit, ...prev.auditEvents] }));
      },
      deactivateUser(id, actor) {
        setState((prev) => {
          const record = prev.users.find((u) => u.id === id);
          if (!record || record.status === "deactivated") return prev;
          const audit = auditEvent("user_admin", "Deactivated user", actor, record.fullName);
          return {
            ...prev,
            users: prev.users.map((u) => (u.id === id ? { ...u, status: "deactivated" } : u)),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      reactivateUser(id, actor) {
        setState((prev) => {
          const record = prev.users.find((u) => u.id === id);
          if (!record || record.status !== "deactivated") return prev;
          const audit = auditEvent("user_admin", "Reactivated user", actor, record.fullName);
          return {
            ...prev,
            users: prev.users.map((u) => (u.id === id ? { ...u, status: "active" } : u)),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      resendUserInvitation(id, actor) {
        setState((prev) => {
          const record = prev.users.find((u) => u.id === id);
          if (!record || record.status !== "invited") return prev;
          const audit = auditEvent("user_admin", "Resent invitation", actor, record.fullName);
          return { ...prev, auditEvents: [audit, ...prev.auditEvents] };
        });
      },
      updateUserPermissions(id, permissions, actor) {
        setState((prev) => {
          const record = prev.users.find((u) => u.id === id);
          if (!record || record.level !== "drrm" || samePermissions(record.permissions, permissions)) return prev;
          const audit = auditEvent(
            "user_admin",
            "Updated DRRM permissions",
            actor,
            record.fullName,
            permissions.length === 0 ? "Removed all permissions" : permissions.join(", "),
          );
          return {
            ...prev,
            users: prev.users.map((u) => (u.id === id ? { ...u, permissions } : u)),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      changePassword(id, actor) {
        setState((prev) => {
          const record = prev.users.find((u) => u.id === id);
          if (!record) return prev;
          const audit = auditEvent("account", "Changed password", actor, record.fullName);
          return {
            ...prev,
            users: prev.users.map((u) => (u.id === id ? { ...u, passwordChangedAt: new Date().toISOString() } : u)),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      addHazardType(input, actor) {
        hazardTypeSequence += 1;
        const audit = auditEvent("configuration", "Added hazard type to CDRA registry", actor, input.name);
        const newType: HazardType = {
          ...input,
          id: `hazard-type-${Date.now()}-${hazardTypeSequence}`,
          status: "approved",
        };
        setState((prev) => ({ ...prev, hazardTypes: [...prev.hazardTypes, newType], auditEvents: [audit, ...prev.auditEvents] }));
      },
      setHazardTypeStatus(id, status, actor) {
        setState((prev) => {
          const record = prev.hazardTypes.find((h) => h.id === id);
          if (!record || (record.status ?? "approved") === status) return prev;
          const audit = auditEvent(
            "configuration",
            status === "archived" ? "Archived hazard type from CDRA registry" : "Reactivated hazard type in CDRA registry",
            actor,
            record.name,
          );
          return {
            ...prev,
            hazardTypes: prev.hazardTypes.map((h) => (h.id === id ? { ...h, status } : h)),
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      updateSitrepConfig(patch, actor) {
        setState((prev) => {
          const changedKeys = Object.keys(patch) as (keyof SitRepTemplateConfig)[];
          const unchanged = changedKeys.every((key) => prev.config.sitrep[key] === patch[key]);
          if (unchanged) return prev;
          const audit = auditEvent("configuration", "Updated SitRep template configuration", actor, changedKeys.join(", "));
          return {
            ...prev,
            config: { ...prev.config, sitrep: { ...prev.config.sitrep, ...patch } },
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
      },
      updateSchedule(cyclePeriodLabel, phaseId, patch, actor) {
        setState((prev) => {
          const cycle = prev.config.cycles.find((c) => c.periodLabel === cyclePeriodLabel);
          const phase = cycle?.phases.find((p) => p.id === phaseId);
          if (!phase) return prev;
          const same =
            (patch.opensAt === undefined || patch.opensAt === phase.opensAt) &&
            (patch.closesAt === undefined || patch.closesAt === phase.closesAt);
          if (same) return prev;
          const audit = auditEvent("configuration", "Updated reporting schedule", actor, `${cyclePeriodLabel} · ${phase.task}`);
          return {
            ...prev,
            config: {
              ...prev.config,
              cycles: prev.config.cycles.map((cycleRow) =>
                cycleRow.periodLabel === cyclePeriodLabel
                  ? {
                      ...cycleRow,
                      phases: cycleRow.phases.map((phaseRow) => (phaseRow.id === phaseId ? { ...phaseRow, ...patch } : phaseRow)),
                    }
                  : cycleRow,
              ),
            },
            auditEvents: [audit, ...prev.auditEvents],
          };
        });
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
