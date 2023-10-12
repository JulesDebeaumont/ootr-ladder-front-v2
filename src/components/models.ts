export interface IRunner {
  userId: number;
  userName: string;
  userDiscordName: string;
  startingElo: number;
  currentElo: number;
  nbRaces: number;
  nbVictories: number;
  nbDefeats: number;
  nbDraws: number;
  rank: number;
  index?: number;
}
export interface ISession {
  id: number;
  seasonId: number;
  ladderType: string;
  start: string;
  end: string;
  nbRacers: number;
}
export interface IRace {
  id: number;
  sessionId: number;
  racer1: string;
  racer2: string;
  racer1DiscordName: string;
  racer2DiscordName: string;
  winner: string;
  racer1Result: 'forfeit' | 'finish' | 'timeout';
  racer2Result: IRace['racer1Result'];
  racer1EndTime: string;
  racer2EndTime: string;
  racer1EloChange: number;
  racer2EloChange: number;
  seedUrl: string;
  spoilerUrl: string;
  settings: string[];
  sessionStartTime: string;
  ladderType: string;
}
export interface ILadderType {
  id: number;
  label: string;
}
export interface ILeaderboard {
  ladderType: string;
  leaderboardData: IRunner[];
}
export interface IWiki {
  title: string;
  markdownBody: string;
  lastModifiedDate: string;
}
export interface IDiscordAPIResponse {
  error?: any;
  error_description?: string;
  access_token: string;
  token_type?: string;
  expires_in: string;
  refresh_token?: string;
  scope?: string;
};
export interface IUser {
  id?: string;
  username?: string;
  discriminator?: string;
  avatar?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  isLoggedIn?: boolean;
  pronoun?: string;
  profile?: string;
  global_name?: string;
}
export interface IUserProfile {
  id: number;
  admin: 'admin' | null;
  name: string;
  discordName: string;
  discordId: number;
  twitch: string;
  creationDate: string;
  avatarUrl: string;
  pronoun: string | null;
  sessionAlerts: number[];
}
export interface IAchievement {
  id: number;
  name: string;
  description: string;
  points: number;
  code: string;
  seasonId: number | null;
  ladderType: string;
  acquired: string;
  lost: null;
  data: {
    min: number;
    max: number;
    prog: number;
  } | null;
  active: boolean;
}
