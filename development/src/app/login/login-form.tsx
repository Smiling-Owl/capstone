"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPrototypeRole } from "@/lib/prototype-login";

export function LoginForm() {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const role = getPrototypeRole(username);

    if (!username) {
      setErrors({ username: "Enter your assigned username or email." });
      usernameRef.current?.focus();
      return;
    }
    if (!role) {
      setErrors({ username: "Use a prototype account beginning with purok, barangay, or drrm." });
      usernameRef.current?.focus();
      return;
    }
    if (!password) {
      setErrors({ password: "Enter your password." });
      passwordRef.current?.focus();
      return;
    }

    setErrors({});
    router.push(`/${role}`);
  }

  return (
    <form className="login-form" onSubmit={signIn} noValidate>
      <label htmlFor="username">Username or email</label>
      <input
        ref={usernameRef}
        id="username"
        name="username"
        autoComplete="username"
        spellCheck={false}
        required
        aria-invalid={Boolean(errors.username)}
        aria-describedby={errors.username ? "username-error demo-account-help" : "demo-account-help"}
      />
      {errors.username && <p id="username-error" className="field-error" role="alert">{errors.username}</p>}
      <p id="demo-account-help" className="field-help">
        Prototype accounts: <span translate="no">purok.demo</span>, <span translate="no">barangay.demo</span>, or <span translate="no">drrm.demo</span>
      </p>

      <div className="split-label">
        <label htmlFor="password">Password</label>
        <span id="password-help">Case-sensitive</span>
      </div>
      <div className="password-control">
        <input
          ref={passwordRef}
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-help password-error" : "password-help"}
        />
        <button
          type="button"
          aria-controls="password"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {errors.password && <p id="password-error" className="field-error" role="alert">{errors.password}</p>}

      <button className="primary-action" type="submit">Sign in</button>
    </form>
  );
}
