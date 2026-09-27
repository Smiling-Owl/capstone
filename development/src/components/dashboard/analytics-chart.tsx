"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

export interface AnalyticsDatum {
  label: string;
  value: number | null;
  detail?: string;
}

interface AnalyticsChartProps {
  id: string;
  title: string;
  description: string;
  data: AnalyticsDatum[];
  emptyMessage?: string;
  chartType?: "bar" | "part-to-whole";
  valueLabel: string;
}

const formatCount = new Intl.NumberFormat("en-PH");
const pieColors = ["var(--teal-dark)", "var(--teal)", "#9aad9e"];

function AnalyticsTooltip({ active, payload, label, valueLabel }: Partial<TooltipContentProps<number, string>> & { valueLabel: string }) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload as AnalyticsDatum;

  return (
    <div className="analytics-tooltip" role="status" aria-live="assertive">
      <strong>{String(label ?? datum.label)}</strong>
      <span>{datum.value === null ? "Not reported" : `${formatCount.format(datum.value)} · ${valueLabel}`}</span>
      {datum.detail && <span>{datum.detail}</span>}
    </div>
  );
}

export function AnalyticsChart({
  id,
  title,
  description,
  data,
  emptyMessage,
  chartType = "bar",
  valueLabel,
}: AnalyticsChartProps) {
  const hasReportedValues = data.some((item) => item.value !== null);
  const hasDetails = data.some((item) => item.detail);
  const completePartToWhole = chartType === "part-to-whole" && data.every((item) => item.value !== null);
  const total = data.reduce((sum, item) => sum + (item.value ?? 0), 0);
  const showPie = completePartToWhole && total > 0;
  const maximum = Math.max(0, ...data.flatMap((item) => item.value === null ? [] : [item.value]));
  const tickStep = Math.max(1, Math.ceil(maximum / 4));
  const axisMaximum = Math.max(tickStep, Math.ceil(maximum / tickStep) * tickStep);
  const ticks = Array.from({ length: axisMaximum / tickStep + 1 }, (_, index) => index * tickStep);

  return (
    <section className="analytics-panel" aria-labelledby={`${id}-title`}>
      <header className="analytics-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{description}</p>
      </header>
      {hasReportedValues ? (
        <div className="analytics-chart-visual">
          <ResponsiveContainer width="100%" height={showPie ? 232 : 236}>
            {showPie ? (
              <PieChart accessibilityLayer title={title} desc={`${description} The table below contains the same values.`}>
                <Tooltip content={<AnalyticsTooltip valueLabel={valueLabel} />} />
                <Pie
                  data={data as Array<AnalyticsDatum & { value: number }>}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={54}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((item, index) => <Cell key={item.label} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <text x="50%" y="47%" textAnchor="middle" className="analytics-donut-total">{formatCount.format(total)}</text>
                <text x="50%" y="60%" textAnchor="middle" className="analytics-donut-caption">{valueLabel}</text>
                <Legend align="center" verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: "0.68rem", lineHeight: 1.5 }} />
              </PieChart>
            ) : (
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }} accessibilityLayer title={title} desc={`${description} Horizontal bars compare ${valueLabel.toLowerCase()}. The table below contains the same values.`}>
                <CartesianGrid horizontal={false} stroke="var(--rule)" />
                <XAxis
                  type="number"
                  domain={[0, axisMaximum]}
                  ticks={ticks}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={156}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--ink)", fontSize: 11 }}
                />
                <Tooltip content={<AnalyticsTooltip valueLabel={valueLabel} />} cursor={{ fill: "var(--teal-tint)" }} />
                <Bar dataKey="value" name={valueLabel} fill="var(--teal)" maxBarSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false} />
              </BarChart>
            )}
          </ResponsiveContainer>
          {chartType === "part-to-whole" && !showPie && (
            <p className="analytics-chart-note">
              {completePartToWhole ? "All reported categories are zero; showing counts instead of a composition." : "Some housing categories were not reported; showing available counts without estimating the composition."}
            </p>
          )}
        </div>
      ) : (
        <p className="analytics-empty">{emptyMessage ?? "No reported values are available."}</p>
      )}
      <div className="analytics-table-wrap">
        <table className="analytics-table">
          <caption className="visually-hidden">{title} data</caption>
          <thead>
            <tr><th scope="col">Category</th><th scope="col">{valueLabel}</th>{hasDetails && <th scope="col">Reporting note</th>}</tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td className="tabular-nums">{item.value === null ? "Not reported" : formatCount.format(item.value)}</td>
                {hasDetails && <td>{item.detail ?? "—"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
