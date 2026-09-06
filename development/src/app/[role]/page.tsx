import Link from "next/link";
import { notFound } from "next/navigation";
import { PrototypeToolbar } from "@/components/prototype-toolbar";

const roleContent = {
  purok: {
    title: "Purok workspace",
    subtitle: "Purok 6, Barangay Tetuan",
    task: "September profile is ready to update",
    nav: ["Home", "Profile", "Report", "History", "More"],
  },
  barangay: {
    title: "Barangay operations",
    subtitle: "Barangay Tetuan",
    task: "3 records require verification",
    nav: ["Overview", "Profiles", "Incidents", "Verification", "Reports", "Purok users", "Settings"],
  },
  drrm: {
    title: "DRRM operations",
    subtitle: "Zamboanga City DRRM Office",
    task: "6 Barangay reports require verification",
    nav: ["Overview", "Profiles", "Incidents", "Verification", "SitReps", "Users", "Configuration", "Audit log"],
  },
} as const;

const reportingLevels = ["Purok", "Barangay", "DRRM"] as const;

export default async function RolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!(role in roleContent)) notFound();
  const content = roleContent[role as keyof typeof roleContent];
  const isPurok = role === "purok";
  const activeLevel = reportingLevels.findIndex((level) => level.toLowerCase() === role);
  const mobileNav = (content.nav.length > 5 ? [...content.nav.slice(0, 4), "More"] : [...content.nav])
    .map((item) => item === "Verification" ? "Review" : item);

  function navigationItem(item: string, index: number) {
    return index === 0 ? (
      <Link href={`/${role}`} aria-current="page" key={item}>{item}</Link>
    ) : (
      <span aria-disabled="true" aria-label={`${item}, unavailable in this prototype`} key={item}>{item}</span>
    );
  }

  return (
    <>
      <a className="skip-link" href="#workspace-main">Skip to workspace</a>
      <PrototypeToolbar current={role as "purok" | "barangay" | "drrm"} />
      <div className={isPurok ? "mobile-shell" : "desktop-shell"}>
        {!isPurok && (
          <aside className="side-navigation">
            <div className="side-navigation-brand">
              <span className="identity-mark" aria-hidden="true">DRRM</span>
              <Link className="system-short-name" href="/login">Disaster Reporting System</Link>
            </div>
            <p className="navigation-scope">{content.subtitle}</p>
            <nav aria-label={`${content.title} navigation`}>
              {content.nav.map(navigationItem)}
            </nav>
            <p className="navigation-note">Dimmed sections arrive in later prototype checkpoints.</p>
            <div className="signed-in-user"><span>MS</span><div><strong>Maria Santos</strong><small>Authorized user</small></div></div>
          </aside>
        )}
        <main className="role-content" id="workspace-main">
          <header className="role-header">
            <div><p className="workspace-scope">{content.subtitle}</p><h1>{content.title}</h1></div>
            <p className="role-mode">Prototype workspace</p>
          </header>
          <ol className="reporting-lineage" aria-label="Reporting source chain">
            {reportingLevels.map((level, index) => (
              <li aria-current={index === activeLevel ? "step" : undefined} key={level}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <strong>{level}</strong>
              </li>
            ))}
          </ol>
          <section className="checkpoint-placeholder" aria-labelledby="checkpoint-title">
            <div className="task-index" aria-hidden="true"><span>Next</span><strong>Action</strong></div>
            <div className="task-content">
              <p className="status-label">Required action</p>
              <h2 id="checkpoint-title">{content.task}</h2>
              <p>Review this item and complete the next required step.</p>
              <button className="primary-action" type="button" disabled aria-describedby="task-availability">Open task</button>
              <p className="task-availability" id="task-availability">Preview only. Workflow controls are not connected yet.</p>
            </div>
          </section>
        </main>
        <nav className="mobile-navigation" aria-label={`${content.title} mobile navigation`}>
          {mobileNav.map(navigationItem)}
        </nav>
      </div>
    </>
  );
}
