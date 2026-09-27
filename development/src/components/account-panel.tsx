"use client";

import { FormEvent, useRef, useState } from "react";
import { UserRecord } from "@/lib/account-data";
import { usePrototypeStore } from "@/lib/prototype-store";

function formatDate(iso?: string) {
  if (!iso) return "Not set";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function AccountPanel({ user }: { user: UserRecord }) {
  const { changePassword } = usePrototypeStore();
  const [confirmation, setConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const currentRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const current = String(data.get("current-password") ?? "");
    const next = String(data.get("new-password") ?? "");
    const confirm = String(data.get("confirm-password") ?? "");

    const nextErrors: typeof errors = {};
    if (!current) {
      nextErrors.current = "Enter your current password to continue.";
      currentRef.current?.focus();
    }
    if (next.length < 8) {
      nextErrors.next = "Use at least 8 characters.";
      if (!nextErrors.current) nextRef.current?.focus();
    }
    if (confirm !== next) {
      nextErrors.confirm = "The confirmation does not match the new password.";
      if (!nextErrors.current && !nextErrors.next) confirmRef.current?.focus();
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    changePassword(user.id, user.fullName);
    event.currentTarget.reset();
    setConfirmation(true);
  }

  return (
    <div className="settings-stack">
      <section className="setting-block account-identity">
        <h2>Account</h2>
        <p>Account details are issued by the supervising administrative level.</p>
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{user.fullName}</dd>
          </div>
          <div>
            <dt>Account</dt>
            <dd translate="no">{user.username}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.roleLabel}</dd>
          </div>
          <div>
            <dt>Assigned unit</dt>
            <dd>
              {user.unit}
              {user.parentUnit ? `, ${user.parentUnit}` : ""}
            </dd>
          </div>
          <div>
            <dt>Issued by</dt>
            <dd>{user.issuedBy}</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>{formatDate(user.issuedAt)}</dd>
          </div>
          <div>
            <dt>Last active</dt>
            <dd>{user.lastActiveAt ? formatDate(user.lastActiveAt) : "No recorded activity"}</dd>
          </div>
          <div>
            <dt>Password last changed</dt>
            <dd>{formatDate(user.passwordChangedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="setting-block">
        <h2>Change password</h2>
        <p>Approval and other high-impact actions require your password.</p>
        {confirmation && (
          <div className="callout callout-verified" role="status">
            <strong>Password updated</strong>
            <p>Use the new password next time you sign in.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field span-2">
              <label htmlFor="current-password">Current password</label>
              <input
                ref={currentRef}
                id="current-password"
                name="current-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.current)}
                aria-describedby={errors.current ? "current-password-error" : "current-password-help"}
              />
              {errors.current ? (
                <p id="current-password-error" className="field-error" role="alert">{errors.current}</p>
              ) : (
                <span id="current-password-help" className="field-note">The password for this prototype account.</span>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="new-password">New password</label>
              <input
                ref={nextRef}
                id="new-password"
                name="new-password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.next)}
                aria-describedby={errors.next ? "new-password-error" : undefined}
              />
              {errors.next && <p id="new-password-error" className="field-error" role="alert">{errors.next}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                ref={confirmRef}
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirm)}
                aria-describedby={errors.confirm ? "confirm-password-error" : undefined}
              />
              {errors.confirm && <p id="confirm-password-error" className="field-error" role="alert">{errors.confirm}</p>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-action">Update password</button>
          </div>
        </form>
        <p className="password-note">
          Prototype only: the change is stored in this browser and does not reset the shared demonstration accounts on the
          sign-in screen.
        </p>
      </section>
    </div>
  );
}
