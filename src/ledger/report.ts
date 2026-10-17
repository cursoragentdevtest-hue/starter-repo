export type LedgerEntry = {
  id?: string;
  date: string; // YYYY-MM-DD
  description: string;
  amountCents: number; // positive = in, negative = out
  settled?: boolean;
};

type ReportOptions = {
  currency?: string;
  unsettledOnly?: boolean;
};

export function formatLedgerReport(
  entries: readonly LedgerEntry[],
  opts: ReportOptions = {},
): string {
  const currency = opts.currency ?? "USD";
  const visible = opts.unsettledOnly
    ? entries.filter((e) => !e.settled)
    : [...entries];
  const rows = visible.map((e) => {
    const amt = (e.amountCents / 100).toFixed(2).padStart(10);
    const status = e.settled ? "SETTLED" : "OPEN";
    return `${e.date}  ${e.description.padEnd(24).slice(0, 24)}  ${amt} ${currency}  ${status}`;
  });
  const total = visible.reduce((s, e) => s + e.amountCents, 0);
  const open = visible.reduce((s, e) => s + (e.settled ? 0 : e.amountCents), 0);
  const footer = [
    "",
    `Entries: ${visible.length}`,
    `Total:   ${(total / 100).toFixed(2)} ${currency}`,
    `Open:    ${(open / 100).toFixed(2)} ${currency}`,
  ];
  return ["DATE        DESCRIPTION                 AMOUNT        STATUS", ...rows, ...footer].join(
    "\n",
  );
}
