#!/usr/bin/env python3
import argparse, json, sys


def settle(entries):
  open_ = [e for e in entries if not e.get("settled")]
  for e in open_:
    e["remaining_cents"] = int(e.get("remaining_cents", e.get("amount_cents", 0)))
  pos = [e for e in open_ if e["remaining_cents"] > 0]
  neg = [e for e in open_ if e["remaining_cents"] < 0]
  i = j = 0
  while i < len(pos) and j < len(neg):
    amt = min(pos[i]["remaining_cents"], -neg[j]["remaining_cents"])
    pos[i]["remaining_cents"] -= amt
    neg[j]["remaining_cents"] += amt
    if pos[i]["remaining_cents"] == 0: pos[i]["settled"] = True; i += 1
    if neg[j]["remaining_cents"] == 0: neg[j]["settled"] = True; j += 1
  return entries


def main():
  ap = argparse.ArgumentParser(description="Settle open ledger entries in a JSON list.")
  ap.add_argument("--infile", default="-", help="Input JSON file ('-' for stdin)")
  ap.add_argument("--outfile", default="-", help="Output JSON file ('-' for stdout)")
  args = ap.parse_args()
  src = sys.stdin.read() if args.infile == "-" else open(args.infile, "r", encoding="utf-8").read()
  entries = json.loads(src)
  out = json.dumps(settle(entries), indent=2, sort_keys=True) + "\n"
  (sys.stdout if args.outfile == "-" else open(args.outfile, "w", encoding="utf-8")).write(out)


if __name__ == "__main__":
  main()
