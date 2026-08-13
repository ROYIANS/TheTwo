export type AppView = "onboarding" | "today" | "profile" | "opportunity-intake" | "opportunities" | "opportunity-compare" | "opportunity" | "interview";
export type SetupStep = "welcome" | "import" | "interview" | "profile-analysis" | "facts" | "direction" | "ready";
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

export interface CommunicationEvent {
  id: string;
  channel: string;
  status: "draft" | "recorded";
  summary: string;
  questions: string[];
  createdAt: string;
}

export interface ApplicationEvent {
  id: string;
  status: "draft" | "recorded";
  channel: string;
  materials: string[];
  createdAt: string;
  followUp: string;
}

export interface InterviewEvent {
  id: string;
  status: "planned" | "prepared" | "recorded";
  title: string;
  scheduledAt: string;
  purpose: string;
  prompts: string[];
  notes: string | null;
}

export interface OfferRecord {
  id: string;
  status: "draft" | "recorded";
  summary: string;
  terms: string[];
  createdAt: string;
}

export interface OutcomeRecord {
  id: string;
  status: "draft" | "recorded";
  title: string;
  detail: string;
  learning: string;
  createdAt: string;
}

export interface UserDecisionRecord {
  choice: Exclude<UserDecision, null>;
  reason: string;
  advisory: string;
  createdAt: string;
}

export interface OpportunityWorkspace {
  opportunity: Opportunity;
  research: ResearchState;
  lifeStage: LifeStage;
  decision: UserDecision;
  decisionRecord: UserDecisionRecord | null;
  communication: CommunicationEvent | null;
  application: ApplicationEvent | null;
  interviewEvent: InterviewEvent | null;
  offer: OfferRecord | null;
  outcome: OutcomeRecord | null;
  strategyUpdate: string | null;
  selectedEvidenceId: string | null;
  lifecycleNote: string | null;
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
  profileSource: "resume" | "conversation" | null;
  intakeText: string;
  facts: CareerFact[];
  direction: CareerDirection | null;
  opportunities: OpportunityWorkspace[];
  activeOpportunityId: string | null;
  compareOpportunityIds: string[];
  opportunityDraftVisible: boolean;
  profileAnalysis: { status: AsyncStatus; step: number };
  opportunityParse: { status: AsyncStatus; step: number };
  agentMessages: AgentMessage[];
}
