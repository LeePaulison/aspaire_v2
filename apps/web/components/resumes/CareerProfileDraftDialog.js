"use client";

import { useRef, useState } from "react";

import { AppDialog } from "@/components/ui/AppDialog";
import { ProfileEditForm } from "@/components/career-profile/CareerProfileChrome";
import { CareerProfileSectionEditor } from "@/components/career-profile/CareerProfileSectionEditor";
import { StatusLine } from "@/components/career-profile/CareerProfileFields";
import {
  getContactInfoFromForm,
  getFormValue,
} from "@/components/career-profile/careerProfileUtils";

function nextDraftId(prefix) {
  return `draft-${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const SECTION_ID_KEYS = {
  experience: "experienceId",
  education: "educationId",
  skills: "skillId",
  projects: "projectId",
  certifications: "certificationId",
};

function getSectionKey(section) {
  return SECTION_ID_KEYS[section];
}

function upsertSectionItem(items, idKey, item) {
  const existingIndex = items.findIndex(
    (currentItem) => currentItem[idKey] === item[idKey],
  );

  if (existingIndex === -1) {
    return [...items, item];
  }

  return items.map((currentItem, index) =>
    index === existingIndex ? item : currentItem,
  );
}

export function CareerProfileDraftDialog({
  draft,
  open,
  busy,
  status,
  error,
  onAccept,
  onChange,
  onOpenChange,
}) {
  const profileFormRef = useRef(null);
  const [editors, setEditors] = useState({
    experience: null,
    education: null,
    skill: null,
    project: null,
    certification: null,
  });

  function updateDraft(updater) {
    onChange(updater(draft));
  }

  function updateEditor(section, value) {
    setEditors((current) => ({
      ...current,
      [section]: value,
    }));
  }

  function deleteItem(section, itemId) {
    const idKey = getSectionKey(section);

    updateDraft((current) => ({
      ...current,
      [section]: current[section].filter((item) => item[idKey] !== itemId),
    }));
  }

  function upsertItem(section, editorKey, values) {
    const idKey = getSectionKey(section);
    const editor = editors[editorKey];
    const nextItem = {
      ...values,
      [idKey]: editor?.[idKey] ?? nextDraftId(editorKey),
      sortOrder: editor?.sortOrder ?? draft[section].length,
    };

    updateDraft((current) => ({
      ...current,
      [section]: upsertSectionItem(current[section], idKey, nextItem),
    }));
    updateEditor(editorKey, null);
    return true;
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    updateProfileFromForm(event.currentTarget);
  }

  function updateProfileFromForm(form) {
    const formData = new FormData(form);

    updateDraft((current) => ({
      ...current,
      name: getFormValue(formData, "name"),
      focus: getFormValue(formData, "focus"),
      isDefault: formData.get("isDefault") === "on",
      headline: getFormValue(formData, "headline"),
      summary: getFormValue(formData, "summary"),
      careerGoals: getFormValue(formData, "careerGoals"),
      contactInfo: getContactInfoFromForm(formData),
      additionalNotes: getFormValue(formData, "additionalNotes"),
    }));
  }

  function handleAccept() {
    if (profileFormRef.current) {
      const formData = new FormData(profileFormRef.current);
      onAccept({
        ...draft,
        name: getFormValue(formData, "name"),
        focus: getFormValue(formData, "focus"),
        isDefault: formData.get("isDefault") === "on",
        headline: getFormValue(formData, "headline"),
        summary: getFormValue(formData, "summary"),
        careerGoals: getFormValue(formData, "careerGoals"),
        contactInfo: getContactInfoFromForm(formData),
        additionalNotes: getFormValue(formData, "additionalNotes"),
      });
      return;
    }

    onAccept(draft);
  }

  function handleSkillSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    return upsertItem("skills", "skill", {
      name: getFormValue(formData, "name"),
      category: getFormValue(formData, "category"),
      proficiency: getFormValue(formData, "proficiency"),
      evidence: getFormValue(formData, "evidence"),
    });
  }

  function handlePreferencesSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    updateDraft((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        targetRoles: getFormValue(formData, "targetRoles"),
        targetIndustries: getFormValue(formData, "targetIndustries"),
        locations: getFormValue(formData, "locations"),
        workModes: getFormValue(formData, "workModes"),
        compensationGoals: getFormValue(formData, "compensationGoals"),
        constraints: getFormValue(formData, "constraints"),
      },
    }));
  }

  if (!draft) {
    return null;
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Review career profile draft"
      description="Accepting this draft will create a new Career Profile variant."
      size="large"
    >
      <div className="grid gap-4">
        <StatusLine status={status} error={error} />
        <ProfileEditForm
          profile={draft}
          busy={busy}
          formRef={profileFormRef}
          onSubmit={handleProfileSubmit}
        />
        <CareerProfileSectionEditor
          profile={draft}
          preferences={draft.preferences}
          busy={busy}
          editors={editors}
          actions={{
            deleteExperience: (itemId) => deleteItem("experience", itemId),
            deleteEducation: (itemId) => deleteItem("education", itemId),
            deleteSkill: (itemId) => deleteItem("skills", itemId),
            deleteProject: (itemId) => deleteItem("projects", itemId),
            deleteCertification: (itemId) =>
              deleteItem("certifications", itemId),
          }}
          onAdd={{
            experience: (item) => updateEditor("experience", item),
            education: (item) => updateEditor("education", item),
            skill: (item) => updateEditor("skill", item),
            project: (item) => updateEditor("project", item),
            certification: (item) => updateEditor("certification", item),
          }}
          onEdit={{
            experience: (item) => updateEditor("experience", item),
            education: (item) => updateEditor("education", item),
            skill: (item) => updateEditor("skill", item),
            project: (item) => updateEditor("project", item),
            certification: (item) => updateEditor("certification", item),
          }}
          onCancel={{
            experience: () => updateEditor("experience", null),
            education: () => updateEditor("education", null),
            skill: () => updateEditor("skill", null),
            project: () => updateEditor("project", null),
            certification: () => updateEditor("certification", null),
          }}
          onSubmit={{
            experience: (values) =>
              upsertItem("experience", "experience", values),
            education: (values) => upsertItem("education", "education", values),
            skill: handleSkillSubmit,
            project: (values) => upsertItem("projects", "project", values),
            certification: (values) =>
              upsertItem("certifications", "certification", values),
            preferences: handlePreferencesSubmit,
          }}
        />
        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={handleAccept}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Accept and create profile
          </button>
        </div>
      </div>
    </AppDialog>
  );
}
