import Link from "next/link";
import { StatusToneBadge } from "@/components/status-badge";
import { FEED_TONE_LABEL, NotificationFeedItem } from "@/lib/notification-data";

function formatDateTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function NotificationFeed({
  items,
  emptyMessage = "No notifications right now.",
}: {
  items: NotificationFeedItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="notice-empty">{emptyMessage}</p>;
  }

  return (
    <ol className="record-list">
      {items.map((item) => {
        const badge = <StatusToneBadge label={FEED_TONE_LABEL[item.tone]} tone={item.tone} />;
        const rowContent = (
          <>
            <span className="record-row-title">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </span>
            <span className="record-row-meta">{formatDateTime(item.occurredAt)}</span>
            {badge}
          </>
        );
        return (
          <li key={item.id}>
            {item.href ? (
              <Link className="record-row" href={item.href}>
                {rowContent}
              </Link>
            ) : (
              <div className="record-row">{rowContent}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
