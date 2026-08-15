"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";

import { IconButton } from "@/components/ui/IconButton";
import {
  careerCertificationSchema,
  careerEducationSchema,
  careerExperienceSchema,
  careerProjectSchema,
} from "@/lib/careerProfile/dateRangeValidation";

import {
  DateInput,
  Field,
  Input,
  ListItem,
  Section,
  Textarea,
} from "./CareerProfileFields";
import {
  achievementMarkdown,
  arrayToText,
  emptyCertification,
  emptyEducation,
  emptyExperience,
  emptyProject,
  emptySkill,
  formatCertificationDateRange,
  formatDateRange,
} from "./careerProfileUtils";

export function CareerProfileSectionEditor({
  profile,
  preferences,
  busy,
  editors,
  actions,
  onAdd,
  onEdit,
  onCancel,
  onSubmit,
}) {
  return (
    <div className="mt-3 grid gap-2">
      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold">Career Sections</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Add and maintain the reusable evidence attached to this profile.
        </p>
      </div>

      <Section
        title="Experience"
        action={
          <IconButton
            label="Add experience"
            onClick={() => onAdd.experience(emptyExperience)}
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
              subtitle={[
                item.company,
                item.location,
                formatDateRange(item.startDate, item.endDate, {
                  isCurrent: item.isCurrent,
                }),
              ]
                .filter(Boolean)
                .join(" · ")}
              detail={[item.description, achievementMarkdown(item.achievements)]
                .filter(Boolean)
                .join("\n\n")}
              disabled={busy}
              onEdit={() =>
                onEdit.experience({
                  ...item,
                  achievements: arrayToText(item.achievements),
                })
              }
              onDelete={() => actions.deleteExperience(item.experienceId)}
            />
          ))}
          {profile.experience.length === 0 ? (
            <p className="text-sm text-foreground-muted">No experience yet.</p>
          ) : null}
        </div>
        {editors.experience ? (
          <ExperienceForm
            item={editors.experience}
            busy={busy}
            onSubmit={onSubmit.experience}
            onCancel={() => onCancel.experience(null)}
          />
        ) : null}
      </Section>

      <Section
        title="Education"
        action={
          <IconButton
            label="Add education"
            onClick={() => onAdd.education(emptyEducation)}
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
              subtitle={[
                item.degree,
                item.fieldOfStudy,
                formatDateRange(item.startDate, item.endDate),
              ]
                .filter(Boolean)
                .join(" · ")}
              detail={item.notes}
              disabled={busy}
              onEdit={() => onEdit.education(item)}
              onDelete={() => actions.deleteEducation(item.educationId)}
            />
          ))}
          {profile.education.length === 0 ? (
            <p className="text-sm text-foreground-muted">No education yet.</p>
          ) : null}
        </div>
        {editors.education ? (
          <EducationForm
            item={editors.education}
            busy={busy}
            onSubmit={onSubmit.education}
            onCancel={() => onCancel.education(null)}
          />
        ) : null}
      </Section>

      <Section
        title="Skills"
        action={
          <IconButton
            label="Add skill"
            onClick={() => onAdd.skill(emptySkill)}
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
              onEdit={() => onEdit.skill(item)}
              onDelete={() => actions.deleteSkill(item.skillId)}
            />
          ))}
        </div>
        {profile.skills.length === 0 ? (
          <p className="text-sm text-foreground-muted">No skills yet.</p>
        ) : null}
        {editors.skill ? (
          <SkillForm
            item={editors.skill}
            busy={busy}
            onSubmit={onSubmit.skill}
            onCancel={() => onCancel.skill(null)}
          />
        ) : null}
      </Section>

      <Section
        title="Projects"
        action={
          <IconButton
            label="Add project"
            onClick={() => onAdd.project(emptyProject)}
            disabled={busy}
          >
            <PlusIcon />
          </IconButton>
        }
      >
        <div className="grid gap-3">
          {profile.projects.map((item) => (
            <ListItem
              key={item.projectId}
              title={item.name}
              subtitle={[
                item.role,
                formatDateRange(item.startDate, item.endDate),
                item.link,
              ]
                .filter(Boolean)
                .join(" · ")}
              detail={[
                item.description,
                item.outcomes,
                achievementMarkdown(item.technologies),
              ]
                .filter(Boolean)
                .join("\n\n")}
              disabled={busy}
              onEdit={() =>
                onEdit.project({
                  ...item,
                  technologies: arrayToText(item.technologies),
                })
              }
              onDelete={() => actions.deleteProject(item.projectId)}
            />
          ))}
          {profile.projects.length === 0 ? (
            <p className="text-sm text-foreground-muted">No projects yet.</p>
          ) : null}
        </div>
        {editors.project ? (
          <ProjectForm
            item={editors.project}
            busy={busy}
            onSubmit={onSubmit.project}
            onCancel={() => onCancel.project(null)}
          />
        ) : null}
      </Section>

      <Section
        title="Certifications and Awards"
        action={
          <IconButton
            label="Add certification"
            onClick={() => onAdd.certification(emptyCertification)}
            disabled={busy}
          >
            <PlusIcon />
          </IconButton>
        }
      >
        <div className="grid gap-3">
          {profile.certifications.map((item) => (
            <ListItem
              key={item.certificationId}
              title={item.name}
              subtitle={[
                item.issuer,
                formatCertificationDateRange(
                  item.issueDate,
                  item.expirationDate,
                ),
              ]
                .filter(Boolean)
                .join(" · ")}
              detail={item.notes}
              disabled={busy}
              onEdit={() => onEdit.certification(item)}
              onDelete={() => actions.deleteCertification(item.certificationId)}
            />
          ))}
          {profile.certifications.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No certifications or awards yet.
            </p>
          ) : null}
        </div>
        {editors.certification ? (
          <CertificationForm
            item={editors.certification}
            busy={busy}
            onSubmit={onSubmit.certification}
            onCancel={() => onCancel.certification(null)}
          />
        ) : null}
      </Section>

      <Section title="Job and Location Preferences">
        <PreferencesForm
          profileId={profile.profileId}
          preferences={preferences}
          busy={busy}
          onSubmit={onSubmit.preferences}
        />
      </Section>
    </div>
  );
}

function ExperienceForm({ item, busy, onSubmit, onCancel }) {
  const form = useCareerSectionForm({
    item,
    schema: careerExperienceSchema,
    onSubmit,
  });

  return (
    <ValidatedSectionForm form={form}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" error={form.errors.title?.message}>
          <Input {...form.register("title")} />
        </Field>
        <Field label="Company" error={form.errors.company?.message}>
          <Input {...form.register("company")} />
        </Field>
        <Field label="Location" error={form.errors.location?.message}>
          <Input {...form.register("location")} />
        </Field>
        <Field label="Start date" error={form.errors.startDate?.message}>
          <DateInput {...form.register("startDate")} />
        </Field>
        <Field label="End date" error={form.errors.endDate?.message}>
          <DateInput {...form.register("endDate")} />
        </Field>
        <label className="flex items-center gap-2 self-end text-sm">
          <input type="checkbox" {...form.register("isCurrent")} />
          Current role
        </label>
      </div>
      <Field label="Description" error={form.errors.description?.message}>
        <Textarea {...form.register("description")} />
      </Field>
      <Field label="Achievements" error={form.errors.achievements?.message}>
        <Textarea
          placeholder="One achievement per line"
          {...form.register("achievements")}
        />
      </Field>
      <FormActions busy={busy} onCancel={onCancel} />
    </ValidatedSectionForm>
  );
}

function EducationForm({ item, busy, onSubmit, onCancel }) {
  const form = useCareerSectionForm({
    item,
    schema: careerEducationSchema,
    onSubmit,
  });

  return (
    <ValidatedSectionForm form={form}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Institution" error={form.errors.institution?.message}>
          <Input {...form.register("institution")} />
        </Field>
        <Field label="Degree or program" error={form.errors.degree?.message}>
          <Input {...form.register("degree")} />
        </Field>
        <Field label="Field of study" error={form.errors.fieldOfStudy?.message}>
          <Input {...form.register("fieldOfStudy")} />
        </Field>
        <Field label="Start date" error={form.errors.startDate?.message}>
          <DateInput {...form.register("startDate")} />
        </Field>
        <Field label="End date" error={form.errors.endDate?.message}>
          <DateInput {...form.register("endDate")} />
        </Field>
      </div>
      <Field label="Notes" error={form.errors.notes?.message}>
        <Textarea {...form.register("notes")} />
      </Field>
      <FormActions busy={busy} onCancel={onCancel} />
    </ValidatedSectionForm>
  );
}

function SkillForm({ item, busy, onSubmit, onCancel }) {
  return (
    <SectionForm onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Skill">
          <Input name="name" defaultValue={item.name} required />
        </Field>
        <Field label="Category">
          <Input name="category" defaultValue={item.category} />
        </Field>
        <Field label="Proficiency">
          <Input name="proficiency" defaultValue={item.proficiency} />
        </Field>
      </div>
      <Field label="Evidence or notes">
        <Textarea name="evidence" defaultValue={item.evidence} />
      </Field>
      <FormActions busy={busy} onCancel={onCancel} />
    </SectionForm>
  );
}

function ProjectForm({ item, busy, onSubmit, onCancel }) {
  const form = useCareerSectionForm({
    item,
    schema: careerProjectSchema,
    onSubmit,
  });

  return (
    <ValidatedSectionForm form={form}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project name" error={form.errors.name?.message}>
          <Input {...form.register("name")} required />
        </Field>
        <Field label="Role" error={form.errors.role?.message}>
          <Input {...form.register("role")} />
        </Field>
        <Field label="Start date" error={form.errors.startDate?.message}>
          <DateInput {...form.register("startDate")} />
        </Field>
        <Field label="End date" error={form.errors.endDate?.message}>
          <DateInput {...form.register("endDate")} />
        </Field>
        <Field label="Link" error={form.errors.link?.message}>
          <Input {...form.register("link")} />
        </Field>
      </div>
      <Field label="Description" error={form.errors.description?.message}>
        <Textarea {...form.register("description")} />
      </Field>
      <Field label="Outcomes" error={form.errors.outcomes?.message}>
        <Textarea {...form.register("outcomes")} />
      </Field>
      <Field label="Technologies or skills" error={form.errors.technologies?.message}>
        <Textarea
          placeholder="One technology or skill per line"
          {...form.register("technologies")}
        />
      </Field>
      <FormActions busy={busy} onCancel={onCancel} />
    </ValidatedSectionForm>
  );
}

function CertificationForm({ item, busy, onSubmit, onCancel }) {
  const form = useCareerSectionForm({
    item,
    schema: careerCertificationSchema,
    onSubmit,
  });

  return (
    <ValidatedSectionForm form={form}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={form.errors.name?.message}>
          <Input {...form.register("name")} required />
        </Field>
        <Field label="Issuer" error={form.errors.issuer?.message}>
          <Input {...form.register("issuer")} />
        </Field>
        <Field label="Issue date" error={form.errors.issueDate?.message}>
          <DateInput {...form.register("issueDate")} />
        </Field>
        <Field
          label="Expiration date"
          error={form.errors.expirationDate?.message}
        >
          <DateInput {...form.register("expirationDate")} />
        </Field>
        <Field label="Credential ID" error={form.errors.credentialId?.message}>
          <Input {...form.register("credentialId")} />
        </Field>
        <Field label="Credential URL" error={form.errors.credentialUrl?.message}>
          <Input {...form.register("credentialUrl")} />
        </Field>
      </div>
      <Field label="Notes" error={form.errors.notes?.message}>
        <Textarea {...form.register("notes")} />
      </Field>
      <FormActions busy={busy} onCancel={onCancel} />
    </ValidatedSectionForm>
  );
}

function PreferencesForm({ profileId, preferences, busy, onSubmit }) {
  return (
    <SectionForm key={`preferences-editor-${profileId}`} onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Target roles">
          <Textarea
            name="targetRoles"
            defaultValue={preferences.targetRoles}
            placeholder="One role per line"
          />
        </Field>
        <Field label="Target industries">
          <Textarea
            name="targetIndustries"
            defaultValue={preferences.targetIndustries}
            placeholder="One industry per line"
          />
        </Field>
        <Field label="Target locations">
          <Textarea
            name="locations"
            defaultValue={preferences.locations}
            placeholder="One location per line"
          />
        </Field>
        <Field label="Work modes">
          <Textarea
            name="workModes"
            defaultValue={preferences.workModes}
            placeholder="Remote, hybrid, on-site"
          />
        </Field>
      </div>
      <Field label="Compensation goals">
        <Input
          name="compensationGoals"
          defaultValue={preferences.compensationGoals}
        />
      </Field>
      <Field label="Constraints or dealbreakers">
        <Textarea name="constraints" defaultValue={preferences.constraints} />
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
    </SectionForm>
  );
}

function SectionForm({ children, onSubmit, ...props }) {
  return (
    <form
      className="mt-4 grid gap-4 rounded-lg border border-border bg-surface p-4"
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
}

function ValidatedSectionForm({ children, form }) {
  return (
    <form
      className="mt-4 grid gap-4 rounded-lg border border-border bg-surface p-4"
      onSubmit={form.onSubmit}
    >
      {children}
    </form>
  );
}

function useCareerSectionForm({ item, schema, onSubmit }) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: item,
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  return {
    errors,
    register,
    onSubmit: handleSubmit(async (values) => {
      const saved = await onSubmit(values);

      if (saved) {
        reset();
      }
    }),
  };
}

function FormActions({ busy, onCancel }) {
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CheckIcon />
        Save
      </button>
      <IconButton label="Cancel" onClick={onCancel} disabled={busy}>
        <Cross2Icon />
      </IconButton>
    </div>
  );
}
