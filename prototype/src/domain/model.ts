export type AppView = "onboarding" | "today" | "profile" | "opportunity-intake" | "opportunity" | "interview";
export type SetupStep = "welcome" | "import" | "profile-analysis" | "facts" | "direction" | "ready";
export type AsyncStatus = "idle" | "running" | "done";
export type FactStatus = "inferred" | "confirmed" | "rejected" | "unknown";
export type LifeStage = "discover" | "research" | "communicate" | "applied" | "interview" | "offer" | "outcome";
export type UserDecision = "apply" | "hold" | "decline" | null;
export type EvidenceTone = "support" | "risk" | "conflict" | "neutral";
export type EvidenceStrength = "primary" | "secondary" | "weak";

export interface CareerFact {
  id: string;
  label: string;
  detail: string;
  source: string;
  status: FactStatus;
  consequence: string;
}

export interface CareerDirection {
  title: string;
  summary: string;
  hardConstraints: string[];
  preferences: string[];
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  salary: string;
  location: string;
  direction: string;
  source: string;
  capturedAt: string;
  description: string;
}

export interface EvidenceItem {
  id: string;
  source: string;
  strength: EvidenceStrength;
  tone: EvidenceTone;
  title: string;
  summary: string;
  excerpt: string;
  impact: string;
}

export interface TraceStep {
  title: string;
  detail: string;
  input: string;
  output: string;
}

export interface ResearchState {
  status: AsyncStatus;
  step: number;
  evidence: EvidenceItem[];
}

export interface AgentMessage {
  from: "agent" | "user";
  text: string;
  time: string;
}

export interface DemoState {
  authenticated: boolean;
  view: AppView;
  setupStep: SetupStep;
  userName: string;
  resumeVisible: boolean;
  facts: CareerFact[];
  direction: CareerDirection | null;
  opportunity: Opportunity | null;
  opportunityDraftVisible: boolean;
  profileAnalysis: { status: AsyncStatus; step: number };
  opportunityParse: { status: AsyncStatus; step: number };
  research: ResearchState;
  lifeStage: LifeStage;
  decision: UserDecision;
  selectedEvidenceId: string | null;
  lifecycleNote: string | null;
  agentMessages: AgentMessage[];
}

