"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  BARANGAY_NAMES_SEED,
  DRRM_PERMISSION_LABEL,
  DRRM_PERMISSION_ORDER,
  DrrmPermission,
  PUROK_NAMES_IN_TETUAN,
  USER_STATUS_LABEL,
  USER_STATUS_TONE,
  UserLevel,
  UserRecord,
} from "@/lib/account-data";
import { StatusToneBadge } from "@/components/status-badge";
import { usePrototypeStore } from "@/lib/prototype-store";

export type UserDirectoryScope = "purok-users" | "barangay-users" | "system-users";

const STATUS_ORDER: Record<UserRecord["status"], number> = { active: 0, invited: 1, deactivated: 2 };

const SCOPE_COPY: Record<
  UserDirectoryScope,
  { inviteTitle: string; inviteNote: string; roleLabel: string; unitLabel: string }
> = {
  "purok-users": {
    inviteTitle: "Issue a Purok account",
    inviteNote: "Barangay issues Purok reporter accounts. There is no self-registration.",
    roleLabel: "Purok reporter",
    unitLabel: "Purok",
  },
  "barangay-users": {
    inviteTitle: "Issue a Barangay account",
    inviteNote: "The DRRM Office issues Barangay accounts to the Barangay DRRM officer of each Barangay.",
    roleLabel: "Barangay DRRM officer",
    unitLabel: "Barangay",
  },
  "system-users": {
    inviteTitle: "Add a DRRM system user",
    inviteNote: "DRRM permissions distinguish Verifier, SitRep Preparer, and Approver. One account may hold several.",
    roleLabel: "DRRM staff",
    unitLabel: "Office",
  },
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function UserDirectory({
  scope,
  actor,
  authority,
  selfId,
}: {
  scope: UserDirectoryScope;
  actor: string;
  authority: string;
  selfId?: string;
}) {
  const { users, inviteUser, deactivateUser, reactivateUser, resendUserInvitation, updateUserPermissions } =
    usePrototypeStore();
  const copy = SCOPE_COPY[scope];
  const [search, setSearch] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [unit, setUnit] = useState("");
  const [permissions, setPermissions] = useState<DrrmPermission[]>([]);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitedName, setInvitedName] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLInputElement>(null);

  const scopeUsers = useMemo(() => {
    const list = users.filter((user) => {
      if (scope === "purok-users") return user.level === "purok";
      if (scope === "barangay-users") return user.level === "barangay";
      return user.level === "drrm";
    });
    return list
      .slice()
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.fullName.localeCompare(b.fullName));
  }, [users, scope]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scopeUsers;
    return scopeUsers.filter((user) =>
      [user.fullName, user.username, user.unit, user.roleLabel].join(" ").toLowerCase().includes(q),
    );
  }, [scopeUsers, search]);

  const level: UserLevel = scope === "purok-users" ? "purok" : scope === "barangay-users" ? "barangay" : "drrm";
  const unitOptions = scope === "system-users" ? [] : scope === "purok-users" ? PUROK_NAMES_IN_TETUAN : BARANGAY_NAMES_SEED;

  function togglePermission(user: UserRecord, permission: DrrmPermission) {
    const current = new Set(user.permissions ?? []);
    if (current.has(permission)) current.delete(permission);
    else current.add(permission);
    updateUserPermissions(user.id, DRRM_PERMISSION_ORDER.filter((p) => current.has(p)), actor);
  }

  function handleInvite(event: FormEvent) {
    event.preventDefault();
    const name = fullName.trim();
    const account = username.trim().toLowerCase();
    setInvitedName(null);
    if (!name) {
      setInviteError("Enter the account holder's full name.");
      nameRef.current?.focus();
      return;
    }
    if (!account.includes("@")) {
      setInviteError("Enter the account email address, for example name@tetuan.gov.ph.");
      accountRef.current?.focus();
      return;
    }
    if (users.some((u) => u.username.trim().toLowerCase() === account)) {
      setInviteError("An account with that address already exists.");
      accountRef.current?.focus();
      return;
    }
    if (unitOptions.length > 0 && !unit) {
      setInviteError(`Select the ${copy.unitLabel.toLowerCase()} this account will report for.`);
      return;
    }
    inviteUser(
      {
        fullName: name,
        username: account,
        level,
        unit: scope === "system-users" ? "Zamboanga City DRRM Office" : unit,
        parentUnit: scope === "purok-users" ? "Barangay Tetuan" : undefined,
        roleLabel: copy.roleLabel,
        permissions: scope === "system-users" ? permissions : undefined,
      },
      actor,
      authority,
    );
    setFullName("");
    setUsername("");
    setPermissions([]);
    setInviteError(null);
    setInvitedName(name);
  }

  return (
    <>
      <section className="panel inline-create-form">
        <h2>{copy.inviteTitle}</h2>
        <p>{copy.inviteNote}</p>
        {invitedName && (
          <div className="callout callout-verified" role="status">
            <strong>Invitation issued</strong>
            <p>
              {invitedName} will receive credentials at the address entered. The account appears below as{" "}
              {USER_STATUS_LABEL.invited} until first sign-in.
            </p>
          </div>
        )}
        {inviteError && (
          <div className="callout callout-urgent" role="alert">
            <strong>Cannot issue the account</strong>
            <p>{inviteError}</p>
          </div>
        )}
        <form onSubmit={handleInvite} noValidate>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor={`${scope}-fullname`}>Full name</label>
              <input
                ref={nameRef}
                id={`${scope}-fullname`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor={`${scope}-username`}>Account email</label>
              <input
                ref={accountRef}
                id={`${scope}-username`}
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                required
              />
            </div>
            {unitOptions.length > 0 && (
              <div className="form-field">
                <label htmlFor={`${scope}-unit`}>{copy.unitLabel}</label>
                <select id={`${scope}-unit`} value={unit} onChange={(e) => setUnit(e.target.value)} required>
                  <option value="" disabled>Select {copy.unitLabel.toLowerCase()}</option>
                  {unitOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {unit &&
                  users.some(
                    (u) => u.level === level && u.unit === unit && (u.status === "active" || u.status === "invited"),
                  ) && (
                    <span className="field-note">
                      An active or pending account already exists for {unit}. Units may hold more than one user.
                    </span>
                  )}
              </div>
            )}
            {scope === "system-users" && (
              <fieldset className="form-field">
                <legend>Permissions</legend>
                <div className="permission-set">
                  {DRRM_PERMISSION_ORDER.map((permission) => (
                    <label className="permission-toggle" key={permission}>
                      <input
                        type="checkbox"
                        checked={permissions.includes(permission)}
                        onChange={(e) =>
                          setPermissions((prev) =>
                            e.target.checked ? [...prev, permission] : prev.filter((p) => p !== permission),
                          )
                        }
                      />
                      {DRRM_PERMISSION_LABEL[permission]}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
          <div className="form-step-actions">
            <span className="autosave-status" />
            <button type="submit" className="primary-action">Send invitation</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>{scope === "purok-users" ? "Purok accounts" : scope === "barangay-users" ? "Barangay accounts" : "DRRM system users"}</h2>
        <p>{filtered.length} of {scopeUsers.length} account{scopeUsers.length === 1 ? "" : "s"} shown.</p>
        <div className="list-toolbar">
          <div className="search-field">
            <label className="visually-hidden" htmlFor={`${scope}-search`}>Search accounts</label>
            <input
              id={`${scope}-search`}
              type="search"
              placeholder="Search name, account, or unit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <caption className="visually-hidden">
            {scope === "purok-users" ? "Purok accounts issued by Barangay Tetuan" : scope === "barangay-users" ? "Barangay accounts issued by the DRRM Office" : "DRRM system accounts and permissions"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col">{copy.unitLabel}</th>
              {scope === "system-users" && <th scope="col">Permissions</th>}
              <th scope="col">Status</th>
              <th scope="col">Last active</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td data-label="Account">
                  <span className="table-primary">{user.fullName}</span>
                  <span className="table-secondary" translate="no">{user.username}</span>
                </td>
                <td data-label={copy.unitLabel}>
                  <span>{user.unit}</span>
                  <span className="table-secondary">{user.roleLabel}</span>
                </td>
                {scope === "system-users" && (
                  <td data-label="Permissions">
                    {user.status === "deactivated" || user.id === selfId ? (
                      <span className="permission-set">
                        {(user.permissions ?? []).length > 0 ? (
                          user.permissions!.map((p) => (
                            <span className="permission-chip" key={p}>{DRRM_PERMISSION_LABEL[p]}</span>
                          ))
                        ) : (
                          <span className="permission-chip permission-chip-empty">None</span>
                        )}
                      </span>
                    ) : (
                      <div className="permission-set" aria-label={`Permissions for ${user.fullName}`}>
                        {DRRM_PERMISSION_ORDER.map((permission) => (
                          <label className="permission-toggle" key={permission}>
                            <input
                              type="checkbox"
                              checked={(user.permissions ?? []).includes(permission)}
                              onChange={() => togglePermission(user, permission)}
                            />
                            {DRRM_PERMISSION_LABEL[permission]}
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                )}
                <td data-label="Status">
                  <StatusToneBadge label={USER_STATUS_LABEL[user.status]} tone={USER_STATUS_TONE[user.status]} />
                </td>
                <td data-label="Last active">
                  <span>{user.lastActiveAt ? formatShortDate(user.lastActiveAt) : "Not signed in yet"}</span>
                </td>
                <td data-label="Actions">
                  <div className="table-actions">
                    {user.id === selfId ? (
                      <span className="permission-chip">Current account</span>
                    ) : user.status === "invited" ? (
                      <>
                        <button type="button" className="row-action" onClick={() => resendUserInvitation(user.id, actor)}>
                          Resend invitation
                        </button>
                        <button
                          type="button"
                          className="row-action row-action-danger"
                          onClick={() => {
                            if (window.confirm(`Cancel the invitation for ${user.fullName}?`)) {
                              deactivateUser(user.id, actor);
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : user.status === "active" ? (
                      <button
                        type="button"
                        className="row-action row-action-danger"
                        onClick={() => {
                          if (window.confirm(`Deactivate the account for ${user.fullName}? History and authorship are kept.`)) {
                            deactivateUser(user.id, actor);
                          }
                        }}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button type="button" className="row-action" onClick={() => reactivateUser(user.id, actor)}>
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="table-empty">
            No {scope === "system-users" ? "system users" : "accounts"} match "{search}".
          </p>
        )}
      </section>
    </>
  );
}
