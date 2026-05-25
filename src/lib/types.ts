export interface JourneyConfig {
  startLocation: string;
  endLocation: string;
  trainBoardingDate: string;
  arrivalDate: string;
}

export interface Station {
  id: string;
  name: string;
  emoji: string;
  dateTime: string;
  description: string;
  imageUrl: string;
  orderIndex: number;
  eventType: StationEventType;
  customMessage: string;
  spotifyUrl: string;
}

export type StationEventType =
  | "normal"
  | "hug"
  | "date-night"
  | "birthday"
  | "cozy"
  | "surprise"
  | "departure";

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: "salary" | "shopping";
  imageUrl: string;
}

export interface SheetData {
  config: JourneyConfig | null;
  stations: Station[];
  milestones: Milestone[];
}

export interface StationProgress {
  overallPercent: number;
  currentLegIndex: number;
  totalLegs: number;
  legPercent: number;
  prevStation: Station | null;
  nextStation: Station | null;
}

export type ProfileId = "prajyu" | "meghs";

export interface Profile {
  identity: ProfileId;
  name: string;
  avatar: string;
}

export type SnapAllowance = "once" | "twice" | "keep";
export type SnapStatus = "unread" | "viewed";

export interface Snap {
  id: string;
  fileId: string;
  senderId: ProfileId;
  timestamp: string;
  status: SnapStatus;
  allowance: SnapAllowance;
  view_count: number;
}
