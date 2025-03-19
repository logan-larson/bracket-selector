export interface Team {
  region: string;
  seed: number;
  name?: string;
  image?: string;
}

export interface TeamData {
  teams: Team[];
} 