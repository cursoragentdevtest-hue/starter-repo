// cprod-2374 legB item — review file-link fixture:
// cursor-review-file-link-prod-test/src/owned-file.txt (CODEOWNERS: @mathews-cloud-tester)

export type LegBItem = {
  id: string;
  label: string;
  detail: string;
};

export const LEG_B_ITEMS: LegBItem[] = [
  {
    id: "legb-1",
    label: "LegB item",
    detail: "cprod-2374 production test artifact (item leg).",
  },
  {
    id: "legb-2",
    label: "File link",
    detail: "References owned-file.txt in cursor-review-file-link-prod-test.",
  },
];
