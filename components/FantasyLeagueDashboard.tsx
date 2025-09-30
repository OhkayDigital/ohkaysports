"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { clsx } from "clsx";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { fantasyCopy, fantasyLeagueTables } from "@/config/fantasyLeagueConfig";

interface Athlete {
  id: string;
  name: string;
  sport?: string | null;
  country?: string | null;
  delegation?: string | null;
  salary_cap_value?: number | null;
  medal_count?: number | null;
  headshot_url?: string | null;
}

interface FantasyEvent {
  id: string;
  event_name: string;
  sport?: string | null;
  stage?: string | null;
  venue?: string | null;
  start_time?: string | null;
  status?: string | null;
}

interface FantasyTeam {
  id: string;
  team_name: string;
  manager_name?: string | null;
  delegation?: string | null;
  total_points?: number | null;
  budget_remaining?: number | null;
}

interface FantasyPick {
  id: string;
  team_id: string;
  athlete_id: string;
  role?: string | null;
  locked_at?: string | null;
  created_at?: string | null;
}

interface LeaderboardRow {
  rank?: number | null;
  team_name: string;
  manager_name?: string | null;
  total_points: number;
  movement?: number | null;
  updated_at?: string | null;
}

interface LoadingState {
  athletes: boolean;
  events: boolean;
  teams: boolean;
  picks: boolean;
  leaderboard: boolean;
}

const initialLoadingState: LoadingState = {
  athletes: false,
  events: false,
  teams: false,
  picks: false,
  leaderboard: false
};

export const FantasyLeagueDashboard = () => {
  const supabase = supabaseBrowserClient;
  const [loading, setLoading] = useState(initialLoadingState);
  const [error, setError] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [events, setEvents] = useState<FantasyEvent[]>([]);
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [picks, setPicks] = useState<FantasyPick[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [filters, setFilters] = useState({ sport: "", country: "" });
  const [newTeam, setNewTeam] = useState({ team_name: "", manager_name: "" });
  const [newPick, setNewPick] = useState({ team_id: "", athlete_id: "", role: "Starter" });
  const [refreshFlag, setRefreshFlag] = useState(0);

  const clientUnavailable = useMemo(() => !supabase, [supabase]);

  const loadAthletes = useCallback(async () => {
    if (clientUnavailable) return;
    try {
      setLoading((prev) => ({ ...prev, athletes: true }));
      const { data, error } = await supabase
        .from(fantasyLeagueTables.athletes)
        .select(
          "id, name, sport, country, delegation, salary_cap_value, medal_count, headshot_url"
        )
        .order("medal_count", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      setAthletes(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load athlete pool");
    } finally {
      setLoading((prev) => ({ ...prev, athletes: false }));
    }
  }, [clientUnavailable, supabase]);

  const loadEvents = useCallback(async () => {
    if (clientUnavailable) return;
    try {
      setLoading((prev) => ({ ...prev, events: true }));
      const { data, error } = await supabase
        .from(fantasyLeagueTables.events)
        .select("id, event_name, sport, stage, venue, start_time, status")
        .order("start_time", { ascending: true });
      if (error) throw error;
      setEvents(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load events");
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  }, [clientUnavailable, supabase]);

  const loadTeams = useCallback(async () => {
    if (clientUnavailable) return;
    try {
      setLoading((prev) => ({ ...prev, teams: true }));
      const { data, error } = await supabase
        .from(fantasyLeagueTables.teams)
        .select("id, team_name, manager_name, delegation, total_points, budget_remaining")
        .order("total_points", { ascending: false })
        .order("team_name", { ascending: true });
      if (error) throw error;
      setTeams(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load fantasy teams");
    } finally {
      setLoading((prev) => ({ ...prev, teams: false }));
    }
  }, [clientUnavailable, supabase]);

  const loadPicks = useCallback(async () => {
    if (clientUnavailable) return;
    try {
      setLoading((prev) => ({ ...prev, picks: true }));
      const { data, error } = await supabase
        .from(fantasyLeagueTables.picks)
        .select("id, team_id, athlete_id, role, locked_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setPicks(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load roster picks");
    } finally {
      setLoading((prev) => ({ ...prev, picks: false }));
    }
  }, [clientUnavailable, supabase]);

  const loadLeaderboard = useCallback(async () => {
    if (clientUnavailable) return;
    try {
      setLoading((prev) => ({ ...prev, leaderboard: true }));
      const { data, error } = await supabase
        .from(fantasyLeagueTables.leaderboard)
        .select("rank, team_name, manager_name, total_points, movement, updated_at")
        .order("rank", { ascending: true });
      if (error) throw error;
      setLeaderboard(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load leaderboard");
    } finally {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
    }
  }, [clientUnavailable, supabase]);

  const handleCreateTeam = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (clientUnavailable) {
      setError("Supabase credentials are not configured");
      return;
    }
    try {
      setError(null);
      const trimmedName = newTeam.team_name.trim();
      if (!trimmedName) {
        setError("Team name is required");
        return;
      }
      const { error } = await supabase.from(fantasyLeagueTables.teams).insert({
        team_name: trimmedName,
        manager_name: newTeam.manager_name || null
      });
      if (error) throw error;
      setNewTeam({ team_name: "", manager_name: "" });
      setRefreshFlag((count) => count + 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Unable to create fantasy team");
    }
  }, [clientUnavailable, newTeam.manager_name, newTeam.team_name, supabase]);

  const handleDraftAthlete = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (clientUnavailable) {
      setError("Supabase credentials are not configured");
      return;
    }
    if (!newPick.team_id || !newPick.athlete_id) {
      setError("Select a fantasy team and athlete before drafting");
      return;
    }
    try {
      setError(null);
      const { error } = await supabase.from(fantasyLeagueTables.picks).insert({
        team_id: newPick.team_id,
        athlete_id: newPick.athlete_id,
        role: newPick.role || null
      });
      if (error) throw error;
      setNewPick((prev) => ({ ...prev, athlete_id: "" }));
      setRefreshFlag((count) => count + 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Unable to draft athlete");
    }
  }, [clientUnavailable, newPick.athlete_id, newPick.role, newPick.team_id, supabase]);

  const handleReleaseAthlete = useCallback(async (pickId: string) => {
    if (clientUnavailable) {
      setError("Supabase credentials are not configured");
      return;
    }
    try {
      const { error } = await supabase
        .from(fantasyLeagueTables.picks)
        .delete()
        .eq("id", pickId);
      if (error) throw error;
      setRefreshFlag((count) => count + 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Unable to release athlete");
    }
  }, [clientUnavailable, supabase]);

  useEffect(() => {
    if (clientUnavailable) return;
    const fetchData = async () => {
      setError(null);
      await Promise.all([
        loadAthletes(),
        loadEvents(),
        loadTeams(),
        loadPicks(),
        loadLeaderboard()
      ]);
    };
    fetchData();
  }, [clientUnavailable, refreshFlag, loadAthletes, loadEvents, loadTeams, loadPicks, loadLeaderboard]);

  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const sportMatch =
        !filters.sport || athlete.sport?.toLowerCase() === filters.sport.toLowerCase();
      const countryMatch =
        !filters.country || athlete.country?.toLowerCase() === filters.country.toLowerCase();
      return sportMatch && countryMatch;
    });
  }, [athletes, filters]);

  const roster = useMemo(() => {
    return picks.map((pick) => {
      const team = teams.find((item) => item.id === pick.team_id);
      const athlete = athletes.find((item) => item.id === pick.athlete_id);
      return { pick, team, athlete };
    });
  }, [picks, teams, athletes]);

  const uniqueSports = useMemo(() => {
    const sports = new Set<string>();
    athletes.forEach((athlete) => {
      if (athlete.sport) {
        sports.add(athlete.sport);
      }
    });
    return Array.from(sports).sort();
  }, [athletes]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    athletes.forEach((athlete) => {
      if (athlete.country) {
        countries.add(athlete.country);
      }
    });
    return Array.from(countries).sort();
  }, [athletes]);

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
              Powered by Supabase
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              {fantasyCopy.hero.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              {fantasyCopy.hero.subtitle}
            </p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-primary">
            <p className="text-sm font-semibold uppercase">Connection status</p>
            <p className="mt-2 text-2xl font-bold">
              {clientUnavailable ? "Awaiting credentials" : "Live"}
            </p>
            <p className="mt-1 text-sm text-primary/70">
              {clientUnavailable
                ? "Add your Supabase URL and anon key to .env.local to sync real data."
                : "Data refreshes automatically whenever Supabase tables update."}
            </p>
          </div>
        </div>
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Something went wrong</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </section>

      <section className="grid gap-8 md:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Athlete Draft Pool</h2>
              <p className="mt-1 text-sm text-slate-600">
                Filter medal favourites and lock athletes before their events begin.
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                className="rounded-lg border border-slate-200 px-3 py-1"
                onClick={() => setRefreshFlag((count) => count + 1)}
                disabled={clientUnavailable}
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filters.sport}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, sport: event.target.value }))
              }
            >
              <option value="">All sports</option>
              {uniqueSports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filters.country}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, country: event.target.value }))
              }
            >
              <option value="">All countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {clientUnavailable && (
              <PlaceholderCard message="Connect Supabase to load the athlete pool." />
            )}
            {!clientUnavailable && filteredAthletes.length === 0 && !loading.athletes && (
              <PlaceholderCard message="No athletes match the current filters." />
            )}
            {!clientUnavailable &&
              filteredAthletes.map((athlete) => (
                <article
                  key={athlete.id}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                    {athlete.headshot_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={athlete.headshot_url}
                        alt={athlete.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {athlete.name
                          .split(" ")
                          .map((part) => part.charAt(0))
                          .join("")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900">
                        {athlete.name}
                      </h3>
                      {typeof athlete.medal_count === "number" && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          {athlete.medal_count} medals
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {[athlete.sport, athlete.country].filter(Boolean).join(" • ")}
                    </p>
                    {athlete.salary_cap_value && (
                      <p className="mt-2 text-xs text-slate-500">
                        Salary cap value: {athlete.salary_cap_value.toLocaleString()} credits
                      </p>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Create Fantasy Team</h2>
            <p className="mt-1 text-sm text-slate-600">
              Draft a team manager and unlock a roster slot for upcoming events.
            </p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleCreateTeam}>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Team name"
                value={newTeam.team_name}
                onChange={(event) =>
                  setNewTeam((prev) => ({ ...prev, team_name: event.target.value }))
                }
                disabled={clientUnavailable}
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Manager name"
                value={newTeam.manager_name}
                onChange={(event) =>
                  setNewTeam((prev) => ({ ...prev, manager_name: event.target.value }))
                }
                disabled={clientUnavailable}
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-200"
                disabled={clientUnavailable}
              >
                Add team
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Upcoming Medal Events</h2>
            <p className="mt-1 text-sm text-slate-600">
              Schedule automatically sorts by the next event start time.
            </p>
            <div className="mt-4 flex flex-col gap-4">
              {clientUnavailable && (
                <PlaceholderCard message="Connect Supabase to load events." />
              )}
              {!clientUnavailable && events.length === 0 && !loading.events && (
                <PlaceholderCard message="No medal events have been scheduled yet." />
              )}
              {!clientUnavailable &&
                events.slice(0, 6).map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <p className="text-xs font-semibold uppercase text-secondary">
                      {event.sport}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      {event.event_name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {event.venue || "Venue TBC"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {event.start_time
                        ? format(new Date(event.start_time), "EEE, dd MMM p")
                        : "Start time TBC"}
                    </p>
                    {event.status && (
                      <span className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        {event.status}
                      </span>
                    )}
                  </article>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">My Roster</h2>
              <p className="mt-1 text-sm text-slate-600">
                Draft starters and alternates. Release athletes before lock to free slots.
              </p>
            </div>
            <button
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
              onClick={() => setRefreshFlag((count) => count + 1)}
              disabled={clientUnavailable}
            >
              Refresh
            </button>
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleDraftAthlete}>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              value={newPick.team_id}
              onChange={(event) =>
                setNewPick((prev) => ({ ...prev, team_id: event.target.value }))
              }
              disabled={clientUnavailable || teams.length === 0}
            >
              <option value="">Select fantasy team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.team_name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={newPick.athlete_id}
              onChange={(event) =>
                setNewPick((prev) => ({ ...prev, athlete_id: event.target.value }))
              }
              disabled={clientUnavailable || athletes.length === 0}
            >
              <option value="">Select athlete</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name} – {athlete.sport}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={newPick.role}
              onChange={(event) =>
                setNewPick((prev) => ({ ...prev, role: event.target.value }))
              }
              disabled={clientUnavailable}
            >
              <option value="Starter">Starter</option>
              <option value="Reserve">Reserve</option>
              <option value="Captain">Captain</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-dark disabled:cursor-not-allowed disabled:bg-slate-200 md:col-span-4"
              disabled={clientUnavailable}
            >
              Draft athlete
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            {clientUnavailable && (
              <PlaceholderCard message="Connect Supabase to view your roster." />
            )}
            {!clientUnavailable && roster.length === 0 && !loading.picks && (
              <PlaceholderCard message="Draft your first athlete to populate the roster." />
            )}
            {!clientUnavailable &&
              roster.map(({ pick, team, athlete }) => (
                <article
                  key={pick.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-secondary">
                      {team?.team_name || "Unassigned team"}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">
                      {athlete?.name || "Unknown athlete"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {[athlete?.sport, athlete?.country].filter(Boolean).join(" • ")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-200 px-2 py-1 font-semibold text-slate-700">
                        {pick.role || "Starter"}
                      </span>
                      {pick.locked_at && (
                        <span className="rounded-full bg-slate-200 px-2 py-1">
                          Locked {format(new Date(pick.locked_at), "dd MMM, HH:mm")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="self-start rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => handleReleaseAthlete(pick.id)}
                    disabled={clientUnavailable}
                  >
                    Release
                  </button>
                </article>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <p className="mt-1 text-sm text-slate-600">
              Rankings update as soon as Supabase receives new medal results.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {clientUnavailable && (
                <PlaceholderCard message="Connect Supabase to fetch leaderboard standings." />
              )}
              {!clientUnavailable && leaderboard.length === 0 && !loading.leaderboard && (
                <PlaceholderCard message="Leaderboard will appear once teams start scoring." />
              )}
              {!clientUnavailable &&
                leaderboard.map((entry) => (
                  <article
                    key={`${entry.rank}-${entry.team_name}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase text-secondary">
                        Rank {entry.rank ?? "–"}
                      </p>
                      <h3 className="text-base font-semibold text-slate-900">
                        {entry.team_name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {entry.manager_name || "Manager TBC"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{entry.total_points}</p>
                      {typeof entry.movement === "number" && (
                        <p
                          className={clsx("text-xs font-semibold", {
                            "text-emerald-600": entry.movement > 0,
                            "text-slate-500": entry.movement === 0,
                            "text-red-500": entry.movement < 0
                          })}
                        >
                          {entry.movement > 0 && `▲ ${entry.movement}`}
                          {entry.movement === 0 && "—"}
                          {entry.movement < 0 && `▼ ${Math.abs(entry.movement)}`}
                        </p>
                      )}
                      {entry.updated_at && (
                        <p className="mt-1 text-xs text-slate-400">
                          {format(new Date(entry.updated_at), "dd MMM, HH:mm")}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Frequently asked questions</h2>
            <div className="mt-4 space-y-4">
              {fantasyCopy.faq.map((item) => (
                <details key={item.question} className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isAnyLoading && (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 text-primary">
          <p className="text-sm font-semibold uppercase">Loading live data…</p>
          <p className="text-sm text-primary/70">
            Supabase requests are in flight. Large tables may take a few seconds to hydrate.
          </p>
        </div>
      )}
    </main>
  );
};

const PlaceholderCard = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
    {message}
  </div>
);
