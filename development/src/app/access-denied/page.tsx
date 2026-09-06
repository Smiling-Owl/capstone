import Link from "next/link";
import { PrototypeToolbar } from "@/components/prototype-toolbar";

export default function AccessDeniedPage() {
  return (
    <>
      <PrototypeToolbar current="none" />
      <main className="state-page">
        <div className="state-page-content">
          <span className="status-tag">Access denied</span>
          <h1>This workspace is outside your permissions</h1>
          <p>
            Your account is not authorized for this administrative level or section. If you believe this is
            incorrect, contact the office that issued your account.
          </p>
          <Link className="primary-action" href="/login">Return to sign in</Link>
        </div>
      </main>
    </>
  );
}
