"use client";

import { useMemo, useState } from "react";
import {
  CheckIcon,
  Cross2Icon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { ScrollArea } from "radix-ui";

import {
  createCareerProfile,
  deleteCareerEducation,
  deleteCareerExperience,
  deleteCareerSkill,
  updateCareerPreferences,
  updateCareerProfileSummary,
  upsertCareerEducation,
  upsertCareerExperience,
  upsertCareerSkill,
} from "@/graphql/careerProfile/careerProfile";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { IconButton } from "@/components/ui/IconButton";

const emptyExperience = {
  company: "",
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  achievements: "",
  sortOrder: 0,
};

const emptyEducation = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  notes: "",
  sortOrder: 0,
};

const emptySkill = {
  name: "",
  category: "General",
  proficiency: "",
  evidence: "",
  sortOrder: 0,
};

const emptyPreferences = {
  targetRoles: "",
  targetIndustries: "",
  locations: "",
  workModes: "",
  compensationGoals: "",
  constraints: "",
};

function arrayToText(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function getFormValue(formData, key) {
  return String(formData.get(key) ?? "");
}

function StatusLine({ status, error }) {
  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  if (status) {
    return <p className="text-sm text-foreground-muted">{status}</p>;
  }

  return null;
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-ring"
      {...props}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      className="min-h-28 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm leading-6 outline-none focus:border-ring"
      {...props}
    />
  );
}

function MarkdownPreview({ content }) {
  if (!content?.trim()) {
    return null;
  }

  return (
    <div className="message-bubble rounded-lg border border-border bg-surface p-4 text-sm">
      <MarkdownRenderer content={content} />
    </div>
  );
}

function achievementMarkdown(achievements) {
  if (!Array.isArray(achievements) || achievements.length === 0) {
    return "";
  }

  return achievements.map((item) => `- ${item}`).join("\n");
}

function Section({ title, action, children }) {
  return (
    <section className="border-t border-border py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ListItem({ title, subtitle, detail, onEdit, onDelete, disabled }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{title || "Untitled"}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <IconButton label="Edit" onClick={onEdit} disabled={disabled}>
            <Pencil1Icon />
          </IconButton>
          <IconButton label="Delete" onClick={onDelete} disabled={disabled}>
            <TrashIcon />
          </IconButton>
        </div>
      </div>
      {detail ? (
        <div className="mt-3">
          <MarkdownPreview content={detail} />
        </div>
      ) : null}
    </div>
  );
}

export function CareerProfileClient({ initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const profilePreferences = useMemo(() => {
    if (!profile?.preferences) {
      return emptyPreferences;
    }

    return {
      targetRoles: arrayToText(profile.preferences.targetRoles),
      targetIndustries: arrayToText(profile.preferences.targetIndustries),
      locations: arrayToText(profile.preferences.locations),
      workModes: arrayToText(profile.preferences.workModes),
      compensationGoals: profile.preferences.compensationGoals,
      constraints: profile.preferences.constraints,
    };
  }, [profile]);

  async function runAction(action, successMessage) {
    setBusy(true);
    setError("");
    setStatus("");

    try {
      const updatedProfile = await action();
      setProfile(updatedProfile);
      setStatus(successMessage);
      return true;
    } catch (actionError) {
      setError(actionError.message || "Career profile update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProfile() {
    await runAction(createCareerProfile, "Profile created.");
  }

  async function handleSummarySubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction(
      () =>
        updateCareerProfileSummary({
          headline: getFormValue(formData, "headline"),
          summary: getFormValue(formData, "summary"),
          careerGoals: getFormValue(formData, "careerGoals"),
        }),
      "Profile summary saved.",
    );
  }

  async function handleExperienceSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const saved = await runAction(
      () =>
        upsertCareerExperience({
          experienceId: editingExperience?.experienceId,
          company: getFormValue(formData, "company"),
          title: getFormValue(formData, "title"),
          location: getFormValue(formData, "location"),
          startDate: getFormValue(formData, "startDate"),
          endDate: getFormValue(formData, "endDate"),
          isCurrent: formData.get("isCurrent") === "on",
          description: getFormValue(formData, "description"),
          achievements: getFormValue(formData, "achievements"),
          sortOrder: editingExperience?.sortOrder ?? profile.experience.length,
        }),
      "Experience saved.",
    );

    if (saved) {
      setEditingExperience(null);
      form.reset();
    }
  }

  async function handleEducationSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const saved = await runAction(
      () =>
        upsertCareerEducation({
          educationId: editingEducation?.educationId,
          institution: getFormValue(formData, "institution"),
          degree: getFormValue(formData, "degree"),
          fieldOfStudy: getFormValue(formData, "fieldOfStudy"),
          startDate: getFormValue(formData, "startDate"),
          endDate: getFormValue(formData, "endDate"),
          notes: getFormValue(formData, "notes"),
          sortOrder: editingEducation?.sortOrder ?? profile.education.length,
        }),
      "Education saved.",
    );

    if (saved) {
      setEditingEducation(null);
      form.reset();
    }
  }

  async function handleSkillSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const saved = await runAction(
      () =>
        upsertCareerSkill({
          skillId: editingSkill?.skillId,
          name: getFormValue(formData, "name"),
          category: getFormValue(formData, "category"),
          proficiency: getFormValue(formData, "proficiency"),
          evidence: getFormValue(formData, "evidence"),
          sortOrder: editingSkill?.sortOrder ?? profile.skills.length,
        }),
      "Skill saved.",
    );

    if (saved) {
      setEditingSkill(null);
      form.reset();
    }
  }

  async function handlePreferencesSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction(
      () =>
        updateCareerPreferences({
          targetRoles: getFormValue(formData, "targetRoles"),
          targetIndustries: getFormValue(formData, "targetIndustries"),
          locations: getFormValue(formData, "locations"),
          workModes: getFormValue(formData, "workModes"),
          compensationGoals: getFormValue(formData, "compensationGoals"),
          constraints: getFormValue(formData, "constraints"),
        }),
      "Career preferences saved.",
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">Career Profile</h1>
          <p className="mt-3 text-foreground-muted">
            Create the reusable career context AspAIre will use across resumes,
            saved jobs, analysis, and interview prep.
          </p>
          <button
            type="button"
            onClick={handleCreateProfile}
            disabled={busy}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusIcon />
            Create profile
          </button>
          <div className="mt-4">
            <StatusLine status={status} error={error} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <ScrollArea.Root className="ScrollAreaRoot">
      <ScrollArea.Viewport className="ScrollAreaViewport">
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Career Profile</h1>
            <p className="max-w-3xl text-sm leading-6 text-foreground-muted">
              Maintain the career context that will power resume, job, analysis,
              and preparation workflows.
            </p>
            <StatusLine status={status} error={error} />
          </div>

          <Section title="Summary">
            <form className="grid gap-4" onSubmit={handleSummarySubmit}>
              <Field label="Headline">
                <Input
                  name="headline"
                  defaultValue={profile.headline}
                  placeholder="Senior operations analyst targeting product roles"
                />
              </Field>
              <Field label="Professional summary">
                <Textarea
                  name="summary"
                  defaultValue={profile.summary}
                  placeholder="A concise overview of your background, strengths, and direction."
                />
              </Field>
              <Field label="Career goals">
                <Textarea
                  name="careerGoals"
                  defaultValue={profile.careerGoals}
                  placeholder="Roles, responsibilities, growth goals, or direction you want next."
                />
              </Field>
              <div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckIcon />
                  Save summary
                </button>
              </div>
            </form>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Summary preview</h3>
                <MarkdownPreview content={profile.summary} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Goals preview</h3>
                <MarkdownPreview content={profile.careerGoals} />
              </div>
            </div>
          </Section>

          <Section
            title="Experience"
            action={
              <IconButton
                label="Add experience"
                onClick={() => setEditingExperience(emptyExperience)}
                disabled={busy}
              >
                <PlusIcon />
              </IconButton>
            }
          >
            <div className="grid gap-3">
              {profile.experience.map((item) => (
                <ListItem
                  key={item.experienceId}
                  title={item.title}
                  subtitle={[item.company, item.location]
                    .filter(Boolean)
                    .join(" · ")}
                  detail={[item.description, achievementMarkdown(item.achievements)]
                    .filter(Boolean)
                    .join("\n\n")}
                  disabled={busy}
                  onEdit={() =>
                    setEditingExperience({
                      ...item,
                      achievements: arrayToText(item.achievements),
                    })
                  }
                  onDelete={() =>
                    runAction(
                      () => deleteCareerExperience(item.experienceId),
                      "Experience deleted.",
                    )
                  }
                />
              ))}
              {profile.experience.length === 0 ? (
                <p className="text-sm text-foreground-muted">No experience yet.</p>
              ) : null}
            </div>

        {editingExperience ? (
          <form
            className="mt-4 grid gap-4 rounded-lg border border-border bg-surface p-4"
            onSubmit={handleExperienceSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <Input name="title" defaultValue={editingExperience.title} />
              </Field>
              <Field label="Company">
                <Input name="company" defaultValue={editingExperience.company} />
              </Field>
              <Field label="Location">
                <Input name="location" defaultValue={editingExperience.location} />
              </Field>
              <Field label="Start date">
                <Input name="startDate" defaultValue={editingExperience.startDate} />
              </Field>
              <Field label="End date">
                <Input name="endDate" defaultValue={editingExperience.endDate} />
              </Field>
              <label className="flex items-center gap-2 self-end text-sm">
                <input
                  name="isCurrent"
                  type="checkbox"
                  defaultChecked={editingExperience.isCurrent}
                />
                Current role
              </label>
            </div>
            <Field label="Description">
              <Textarea
                name="description"
                defaultValue={editingExperience.description}
              />
            </Field>
            <Field label="Achievements">
              <Textarea
                name="achievements"
                defaultValue={editingExperience.achievements}
                placeholder="One achievement per line"
              />
            </Field>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckIcon />
                Save
              </button>
              <IconButton
                label="Cancel"
                onClick={() => setEditingExperience(null)}
                disabled={busy}
              >
                <Cross2Icon />
              </IconButton>
            </div>
          </form>
        ) : null}
          </Section>

          <Section
        title="Education"
        action={
          <IconButton
            label="Add education"
            onClick={() => setEditingEducation(emptyEducation)}
            disabled={busy}
          >
            <PlusIcon />
          </IconButton>
        }
      >
        <div className="grid gap-3">
          {profile.education.map((item) => (
            <ListItem
              key={item.educationId}
              title={item.institution}
              subtitle={[item.degree, item.fieldOfStudy].filter(Boolean).join(" · ")}
              detail={item.notes}
              disabled={busy}
              onEdit={() => setEditingEducation(item)}
              onDelete={() =>
                runAction(
                  () => deleteCareerEducation(item.educationId),
                  "Education deleted.",
                )
              }
            />
          ))}
          {profile.education.length === 0 ? (
            <p className="text-sm text-foreground-muted">No education yet.</p>
          ) : null}
        </div>

        {editingEducation ? (
          <form
            className="mt-4 grid gap-4 rounded-lg border border-border bg-surface p-4"
            onSubmit={handleEducationSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Institution">
                <Input
                  name="institution"
                  defaultValue={editingEducation.institution}
                />
              </Field>
              <Field label="Degree or program">
                <Input name="degree" defaultValue={editingEducation.degree} />
              </Field>
              <Field label="Field of study">
                <Input
                  name="fieldOfStudy"
                  defaultValue={editingEducation.fieldOfStudy}
                />
              </Field>
              <Field label="Start date">
                <Input name="startDate" defaultValue={editingEducation.startDate} />
              </Field>
              <Field label="End date">
                <Input name="endDate" defaultValue={editingEducation.endDate} />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea name="notes" defaultValue={editingEducation.notes} />
            </Field>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckIcon />
                Save
              </button>
              <IconButton
                label="Cancel"
                onClick={() => setEditingEducation(null)}
                disabled={busy}
              >
                <Cross2Icon />
              </IconButton>
            </div>
          </form>
        ) : null}
          </Section>

          <Section
        title="Skills"
        action={
          <IconButton
            label="Add skill"
            onClick={() => setEditingSkill(emptySkill)}
            disabled={busy}
          >
            <PlusIcon />
          </IconButton>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {profile.skills.map((item) => (
            <ListItem
              key={item.skillId}
              title={item.name}
              subtitle={[item.category, item.proficiency].filter(Boolean).join(" · ")}
              detail={item.evidence}
              disabled={busy}
              onEdit={() => setEditingSkill(item)}
              onDelete={() =>
                runAction(() => deleteCareerSkill(item.skillId), "Skill deleted.")
              }
            />
          ))}
        </div>
        {profile.skills.length === 0 ? (
          <p className="text-sm text-foreground-muted">No skills yet.</p>
        ) : null}

        {editingSkill ? (
          <form
            className="mt-4 grid gap-4 rounded-lg border border-border bg-surface p-4"
            onSubmit={handleSkillSubmit}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Skill">
                <Input name="name" defaultValue={editingSkill.name} required />
              </Field>
              <Field label="Category">
                <Input name="category" defaultValue={editingSkill.category} />
              </Field>
              <Field label="Proficiency">
                <Input
                  name="proficiency"
                  defaultValue={editingSkill.proficiency}
                />
              </Field>
            </div>
            <Field label="Evidence or notes">
              <Textarea name="evidence" defaultValue={editingSkill.evidence} />
            </Field>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckIcon />
                Save
              </button>
              <IconButton
                label="Cancel"
                onClick={() => setEditingSkill(null)}
                disabled={busy}
              >
                <Cross2Icon />
              </IconButton>
            </div>
          </form>
        ) : null}
          </Section>

          <Section title="Job and Location Preferences">
        <form className="grid gap-4" onSubmit={handlePreferencesSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Target roles">
              <Textarea
                name="targetRoles"
                defaultValue={profilePreferences.targetRoles}
                placeholder="One role per line"
              />
            </Field>
            <Field label="Target industries">
              <Textarea
                name="targetIndustries"
                defaultValue={profilePreferences.targetIndustries}
                placeholder="One industry per line"
              />
            </Field>
            <Field label="Target locations">
              <Textarea
                name="locations"
                defaultValue={profilePreferences.locations}
                placeholder="One location per line"
              />
            </Field>
            <Field label="Work modes">
              <Textarea
                name="workModes"
                defaultValue={profilePreferences.workModes}
                placeholder="Remote, hybrid, on-site"
              />
            </Field>
          </div>
          <Field label="Compensation goals">
            <Input
              name="compensationGoals"
              defaultValue={profilePreferences.compensationGoals}
            />
          </Field>
          <Field label="Constraints or dealbreakers">
            <Textarea
              name="constraints"
              defaultValue={profilePreferences.constraints}
            />
          </Field>
          <div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckIcon />
              Save preferences
            </button>
          </div>
        </form>
          </Section>
        </main>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="ScrollAreaScrollbar"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="ScrollAreaThumb" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="ScrollAreaCorner" />
    </ScrollArea.Root>
  );
}
