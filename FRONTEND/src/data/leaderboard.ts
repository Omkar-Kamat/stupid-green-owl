export type LeaderboardEntry = {
  rank: number;
  name: string;
  xp: number;
  avatarColor: string;
  avatarLabel: string;
  isCurrentUser?: boolean;
};

export const LEAGUE_NAME = "Bronze League";
export const PROMOTION_COUNT = 11;
export const LEAGUE_DAYS_LEFT = 2;

export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, name: "christina", xp: 580, avatarColor: "#ff9600", avatarLabel: "C" },
  { rank: 2, name: "PUFAN", xp: 367, avatarColor: "#ff86d0", avatarLabel: "P" },
  { rank: 3, name: "nilsu", xp: 285, avatarColor: "#ce82ff", avatarLabel: "N" },
  { rank: 4, name: "Linh", xp: 156, avatarColor: "#1cb0f6", avatarLabel: "L" },
  { rank: 5, name: "MARWAN Al isehaqi", xp: 128, avatarColor: "#58cc02", avatarLabel: "M" },
  { rank: 6, name: "3132原朋海", xp: 85, avatarColor: "#ffc800", avatarLabel: "3" },
  { rank: 7, name: "Huy Huynh", xp: 76, avatarColor: "#ff4b4b", avatarLabel: "H" },
  { rank: 8, name: "Lennie Laurio", xp: 72, avatarColor: "#00cd9c", avatarLabel: "L" },
  { rank: 9, name: "Swayam Prabhu Samanta", xp: 65, avatarColor: "#afafaf", avatarLabel: "S" },
  { rank: 10, name: "blink-army Jin_dad_jokes", xp: 59, avatarColor: "#52656d", avatarLabel: "B" },
  { rank: 11, name: "Win", xp: 45, avatarColor: "#777777", avatarLabel: "W" },
  { rank: 12, name: "Omkar Kamat", xp: 43, avatarColor: "#37464f", avatarLabel: "", isCurrentUser: true },
  { rank: 13, name: "Gauri", xp: 41, avatarColor: "#ff86d0", avatarLabel: "G" },
  { rank: 14, name: "まさひろ", xp: 40, avatarColor: "#1cb0f6", avatarLabel: "ま" },
  { rank: 15, name: "Alex Chen", xp: 38, avatarColor: "#58cc02", avatarLabel: "A" },
  { rank: 16, name: "Priya Sharma", xp: 35, avatarColor: "#ffc800", avatarLabel: "P" },
  { rank: 17, name: "Lucas", xp: 32, avatarColor: "#ce82ff", avatarLabel: "L" },
  { rank: 18, name: "Emma", xp: 28, avatarColor: "#ff9600", avatarLabel: "E" },
];
