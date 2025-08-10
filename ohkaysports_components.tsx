import React, { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/*
 * This file contains a pair of React components that demonstrate how to
 * integrate with Supabase to create and update records for the OhkaySports
 * platform. These components are designed to live in a modern React
 * application (e.g. Next.js) and illustrate how to handle form state,
 * validation and asynchronous requests against Supabase tables. You can
 * copy these components into your own project and customize them to
 * match your UI framework (Tailwind, Material UI, etc.).
 */

// Initialize a Supabase client using environment variables. When running
// locally you should set NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY in your `.env` or process environment. In
// the Lovable environment this configuration will already be provided.
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * ProfileForm component
 *
 * Renders a form that allows athletes to provide additional profile
 * information beyond their OSID seed phrase. This includes date of
 * birth, gender, athlete status and profile identity. On mount it
 * fetches the current user's profile using the Supabase auth session
 * then populates the form fields. When submitted it will upsert the
 * values into the `profiles` table keyed on the current user's ID.
 */
export const ProfileForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({
    date_of_birth: "",
    gender: "",
    athlete_status: "",
    profile_identity: "",
  });

  // Fetch current user's profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session || !session.user) {
          throw new Error("No active session found");
        }
        const userId = session.user.id;
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(
            "date_of_birth, gender, athlete_status, profile_identity"
          )
          .eq("id", userId)
          .single();
        if (profileError) throw profileError;
        setFormValues({
          date_of_birth: data?.date_of_birth || "",
          gender: data?.gender || "",
          athlete_status: data?.athlete_status || "",
          profile_identity: data?.profile_identity || "",
        });
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session || !session.user) {
        throw new Error("No active session found");
      }
      const userId = session.user.id;
      // Upsert the profile record. If it exists, update; if not, insert a new row
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            date_of_birth: formValues.date_of_birth || null,
            gender: formValues.gender || null,
            athlete_status: formValues.athlete_status || null,
            profile_identity: formValues.profile_identity || null,
          },
          { onConflict: "id" }
        );
      if (upsertError) throw upsertError;
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
      {error && (
        <p className="mb-2 text-red-600" data-testid="profile-error">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-2 text-green-600" data-testid="profile-success">
          Profile updated successfully!
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="date_of_birth">
            Date of Birth
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formValues.date_of_birth}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formValues.gender}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="athlete_status">
            Athlete Status
          </label>
          <input
            type="text"
            id="athlete_status"
            name="athlete_status"
            value={formValues.athlete_status}
            onChange={handleChange}
            placeholder="e.g. Active, Retired, Amateur"
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="profile_identity">
            Profile Identity
          </label>
          <textarea
            id="profile_identity"
            name="profile_identity"
            value={formValues.profile_identity}
            onChange={handleChange}
            placeholder="A short bio or identity statement"
            className="border rounded p-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
};

/**
 * CreateCompetitionForm component
 *
 * Provides a form for competition organizers to create new competition
 * records. It captures critical metadata about the event such as its
 * name, year, start and end dates, sport, venue, city, country and
 * competition level. When submitted, the form inserts a new row in
 * the `competitions` table. After a successful insert it resets the
 * form fields and displays a success message.
 */
export const CreateCompetitionForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    start_date: "",
    end_date: "",
    sport: "",
    venue: "",
    city: "",
    country: "",
    level_of_competition: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session || !session.user) {
        throw new Error("No active session found");
      }
      // Insert new competition
      const { error: insertError } = await supabase.from("competitions").insert({
        name: formValues.name,
        organizer_id: session.user.id,
        public_dashboard_enabled: false,
        year: formValues.year ? parseInt(formValues.year, 10) : null,
        start_date: formValues.start_date || null,
        end_date: formValues.end_date || null,
        sport: formValues.sport || null,
        venue: formValues.venue || null,
        city: formValues.city || null,
        country: formValues.country || null,
        level_of_competition: formValues.level_of_competition || null,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      // Reset form
      setFormValues({
        name: "",
        year: new Date().getFullYear().toString(),
        start_date: "",
        end_date: "",
        sport: "",
        venue: "",
        city: "",
        country: "",
        level_of_competition: "",
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error creating competition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Create New Competition</h2>
      {error && (
        <p className="mb-2 text-red-600" data-testid="competition-error">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-2 text-green-600" data-testid="competition-success">
          Competition created successfully!
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="name">
            Competition Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="year">
            Year
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formValues.year}
            onChange={handleChange}
            className="border rounded p-2"
            min="1900"
            max="2100"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1" htmlFor="start_date">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formValues.start_date}
              onChange={handleChange}
              className="border rounded p-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1" htmlFor="end_date">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formValues.end_date}
              onChange={handleChange}
              className="border rounded p-2"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="sport">
            Sport
          </label>
          <input
            type="text"
            id="sport"
            name="sport"
            value={formValues.sport}
            onChange={handleChange}
            className="border rounded p-2"
            placeholder="e.g. Badminton"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="venue">
            Venue
          </label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={formValues.venue}
            onChange={handleChange}
            className="border rounded p-2"
            placeholder="Stadium name or facility"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="city">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formValues.city}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="country">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formValues.country}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1" htmlFor="level_of_competition">
            Level of Competition
          </label>
          <select
            id="level_of_competition"
            name="level_of_competition"
            value={formValues.level_of_competition}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option value="">Select…</option>
            <option value="school">School</option>
            <option value="club">Club</option>
            <option value="regional">Regional</option>
            <option value="national">National</option>
            <option value="international">International</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          {loading ? "Creating…" : "Create Competition"}
        </button>
      </form>
    </div>
  );
};