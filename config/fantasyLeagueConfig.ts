export const fantasyLeagueTables = {
  athletes:
    process.env.NEXT_PUBLIC_SUPABASE_TABLE_ATHLETES || "fantasy_athletes",
  events: process.env.NEXT_PUBLIC_SUPABASE_TABLE_EVENTS || "fantasy_events",
  teams: process.env.NEXT_PUBLIC_SUPABASE_TABLE_TEAMS || "fantasy_teams",
  picks:
    process.env.NEXT_PUBLIC_SUPABASE_TABLE_PICKS || "fantasy_team_picks",
  leaderboard:
    process.env.NEXT_PUBLIC_SUPABASE_TABLE_LEADERBOARD ||
    "fantasy_leaderboard_view"
} as const;

export const supabaseViewColumns = {
  leaderboard: {
    rank: "rank",
    teamName: "team_name",
    managerName: "manager_name",
    points: "total_points",
    change: "movement",
    updatedAt: "updated_at"
  }
} as const;

export const fantasyCopy = {
  hero: {
    title: "SEA Games 2025 Fantasy League Dashboard",
    subtitle:
      "Track athlete performances, lock in your roster, and follow the live medal race in real-time."
  },
  faq: [
    {
      question: "How often does the leaderboard update?",
      answer:
        "The leaderboard pulls live scoring from Supabase. Any time an athlete's medal tally or bonus points change, your team's total updates instantly."
    },
    {
      question: "Can I edit my roster after locking athletes?",
      answer:
        "Roster changes are permitted until an athlete's event begins. Use the \"Release\" action in the My Roster section to free a slot before locking a replacement."
    },
    {
      question: "What tables power this dashboard?",
      answer:
        "The proof of concept uses the fantasy_athletes, fantasy_events, fantasy_teams, fantasy_team_picks, and fantasy_leaderboard_view tables in Supabase. You can override these via NEXT_PUBLIC_SUPABASE_TABLE_* variables."
    }
  ]
};
