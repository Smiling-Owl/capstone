import Image from "next/image";
import { PrototypeToolbar } from "@/components/prototype-toolbar";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <>
      <a className="skip-link" href="#login-form">Skip to sign in</a>
      <PrototypeToolbar current="login" />
      <main className="login-page-content">
        <header className="institutional-header">
          <Image className="identity-mark" src="/logo.png" alt="SitRepO" width={64} height={64} priority />
          <div className="institutional-identity">
            <h1 id="system-name">Barangay Disaster Situation Record Management and Situation Report Generation System</h1>
          </div>
          <p className="access-status">Authorized users only</p>
        </header>

        <section className="login-workspace" id="login-form" aria-labelledby="sign-in-heading" tabIndex={-1}>
          <header className="login-intro">
            <h2 id="sign-in-heading">Sign in</h2>
            <p>Use the account assigned to your role and jurisdiction.</p>
          </header>
          <div className="login-access">
            <LoginForm />
          </div>
        </section>
      </main>
    </>
  );
}
