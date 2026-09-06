import Link from "next/link";
import { PrototypeToolbar } from "@/components/prototype-toolbar";

export default function SessionExpiredPage() {
  return (
    <>
      <PrototypeToolbar current="none" />
      <main className="state-page">
        <div className="state-page-content">
          <span className="status-tag">Session expired</span>
          <h1>You have been signed out</h1>
          <p>
            Your session ended after a period of inactivity. Unsaved changes on this device were kept as a
            local draft and are not queued for submission until you sign in again.
          </p>
          <Link className="primary-action" href="/login">Sign in again</Link>
        </div>
      </main>
    </>
  );
}
