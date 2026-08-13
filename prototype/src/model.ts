export type SpaceId = "career" | "library" | "research";

export type ResearchStage = "intake" | "evidence" | "judgment" | "application" | "decision";

export type FactStatus = "confirmed" | "inferred" | "unknown" | "rejected";

export type EvidenceStrength = "primary" | "secondary" | "signal";

export type EvidenceTone = "support" | "risk" | "conflict" | "neutral";

export type UserDecision = "apply" | "hold" | "decline" | null;

export interface CareerFact {
  id: string;
  label: string;
  detail: string;
  status: FactStatus;
  source: string;
}

export interface EvidenceItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  capturedAt: string;
  strength: EvidenceStrength;
  tone: EvidenceTone;
  impact: string;
  excerpt: string;
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  salary: string;
  location: string;
  source: string;
  sourceUrl: string;
  capturedAt: string;
  rawText: string;
  direction: string;
}

export interface MaterialItem {
  id: string;
  kind: string;
  title: string;
  source: string;
  status: "parsed" | "needs-review" | "draft";
  time: string;
}
