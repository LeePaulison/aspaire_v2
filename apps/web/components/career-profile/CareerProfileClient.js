"use client";

import { useMemo, useState } from "react";
import { ScrollArea } from "radix-ui";

import { AppDialog } from "@/components/ui/AppDialog";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  createCareerProfile,
  deleteCareerCertification,
  deleteCareerEducation,
  deleteCareerExperience,
  deleteCareerProfile,
  deleteCareerProject,
  deleteCareerSkill,
  updateCareerPreferences,
  updateCareerProfileSummary,
  upsertCareerCertification,
  upsertCareerEducation,
  upsertCareerExperience,
  upsertCareerProject,
  upsertCareerSkill,
} from "@/graphql/careerProfile/careerProfile";
import { createResume } from "@/graphql/resume/resume";
import { createResumeDraftFromCareerProfile } from "@/lib/resumes/careerProfileResumeDraft";

import {
  ProfileCreateForm,
  ProfileEditForm,
  ProfileList,
  ProfileToolbar,
} from "./CareerProfileChrome";
import { CareerProfileDisplay } from "./CareerProfileDisplay";
import { StatusLine } from "./CareerProfileFields";
import { CareerProfileSectionEditor } from "./CareerProfileSectionEditor";
import { ResumeMarkdownDraftDialog } from "./ResumeMarkdownDraftDialog";
import {
  arrayToText,
  emptyPreferences,
  getFormValue,
  sortProfiles,
} from "./careerProfileUtils";

export function CareerProfileClient({ initialProfile, initialProfiles = [] }) {
  const [profiles, setProfiles] = useState(() => sortProfiles(initialProfiles));
  const [profile, setProfile] = useState(initialProfile);
  const [creatingProfile, setCreatingProfile] = useState(
    initialProfiles.length === 0,
  );
  const [editingProfile, setEditingProfile] = useState(null);
  const [pendingProfileDeletion, setPendingProfileDeletion] = useState(null);
  const [profileDeleteError, setProfileDeleteError] = useState("");
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingCertification, setEditingCertification] = useState(null);
  const [resumeDraft, setResumeDraft] = useState(null);
  const [resumeDraftOpen, setResumeDraftOpen] = useState(false);
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

  function resetSectionEditors() {
    setEditingProfile(null);
    setEditingExperience(null);
    setEditingEducation(null);
    setEditingSkill(null);
    setEditingProject(null);
    setEditingCertification(null);
  }

  function replaceProfile(updatedProfile) {
    if (!updatedProfile) {
      return;
    }

    setProfiles((current) => {
      let nextProfiles = current.filter(
        (item) => item.profileId !== updatedProfile.profileId,
      );

      if (updatedProfile.isDefault) {
        nextProfiles = nextProfiles.map((item) => ({
          ...item,
          isDefault: false,
        }));
      }

      nextProfiles.push(updatedProfile);
      return sortProfiles(nextProfiles);
    });
    setProfile(updatedProfile);
  }

  function replaceProfiles(nextProfiles, preferredProfileId) {
    const sortedProfiles = sortProfiles(nextProfiles);
    const nextProfile =
      sortedProfiles.find((item) => item.profileId === preferredProfileId) ??
      sortedProfiles.find((item) => item.isDefault) ??
      sortedProfiles[0] ??
      null;

    setProfiles(sortedProfiles);
    setProfile(nextProfile);
  }

  async function runAction(action, successMessage) {
    setBusy(true);
    setError("");
    setStatus("");

    try {
      const updatedProfile = await action();
      replaceProfile(updatedProfile);
      setStatus(successMessage);
      return true;
    } catch (actionError) {
      setError(actionError.message || "Career profile update failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProfileSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const created = await runAction(
      () =>
        createCareerProfile({
          name: getFormValue(formData, "name"),
          focus: getFormValue(formData, "focus"),
          isDefault: formData.get("isDefault") === "on",
        }),
      "Profile created.",
    );

    if (created) {
      setCreatingProfile(false);
      event.currentTarget.reset();
    }
  }

  async function handleProfileEditSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const saved = await runAction(
      () =>
        updateCareerProfileSummary({
          profileId: profile.profileId,
          name: getFormValue(formData, "name"),
          focus: getFormValue(formData, "focus"),
          isDefault: profile.isDefault || formData.get("isDefault") === "on",
          headline: getFormValue(formData, "headline"),
          summary: getFormValue(formData, "summary"),
          careerGoals: getFormValue(formData, "careerGoals"),
          additionalNotes: getFormValue(formData, "additionalNotes"),
        }),
      "Profile saved.",
    );

    if (saved) {
      resetSectionEditors();
    }
  }

  async function handleSetDefaultProfile() {
    await runAction(
      () =>
        updateCareerProfileSummary({
          profileId: profile.profileId,
          isDefault: true,
        }),
      "Default profile updated.",
    );
  }

  async function handleDeleteProfile() {
    if (!pendingProfileDeletion || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");
    setProfileDeleteError("");

    try {
      const nextProfiles = await deleteCareerProfile(
        pendingProfileDeletion.profileId,
      );
      replaceProfiles(nextProfiles, profile.profileId);
      setStatus("Profile deleted.");
      setPendingProfileDeletion(null);
      resetSectionEditors();
    } catch (deleteError) {
      setProfileDeleteError(deleteError.message || "Profile deletion failed");
    } finally {
      setBusy(false);
    }
  }

  function handleProfileDeleteDialogChange(open) {
    if (!open && !busy) {
      setPendingProfileDeletion(null);
      setProfileDeleteError("");
    }
  }

  function selectProfile(profileId) {
    const nextProfile =
      profiles.find((item) => item.profileId === profileId) ?? profile;

    setProfile(nextProfile);
    setCreatingProfile(false);
    resetSectionEditors();
  }

  async function handleExperienceSubmit(values) {
    const saved = await runAction(
      () =>
        upsertCareerExperience({
          experienceId: editingExperience?.experienceId,
          profileId: profile.profileId,
          company: values.company,
          title: values.title,
          location: values.location,
          startDate: values.startDate,
          endDate: values.endDate,
          isCurrent: values.isCurrent,
          description: values.description,
          achievements: values.achievements,
          sortOrder: editingExperience?.sortOrder ?? profile.experience.length,
        }),
      "Experience saved.",
    );

    if (saved) {
      setEditingExperience(null);
    }

    return saved;
  }

  async function handleEducationSubmit(values) {
    const saved = await runAction(
      () =>
        upsertCareerEducation({
          educationId: editingEducation?.educationId,
          profileId: profile.profileId,
          institution: values.institution,
          degree: values.degree,
          fieldOfStudy: values.fieldOfStudy,
          startDate: values.startDate,
          endDate: values.endDate,
          notes: values.notes,
          sortOrder: editingEducation?.sortOrder ?? profile.education.length,
        }),
      "Education saved.",
    );

    if (saved) {
      setEditingEducation(null);
    }

    return saved;
  }

  async function handleSkillSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const saved = await runAction(
      () =>
        upsertCareerSkill({
          skillId: editingSkill?.skillId,
          profileId: profile.profileId,
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

  async function handleProjectSubmit(values) {
    const saved = await runAction(
      () =>
        upsertCareerProject({
          projectId: editingProject?.projectId,
          profileId: profile.profileId,
          name: values.name,
          role: values.role,
          description: values.description,
          outcomes: values.outcomes,
          technologies: values.technologies,
          link: values.link,
          startDate: values.startDate,
          endDate: values.endDate,
          sortOrder: editingProject?.sortOrder ?? profile.projects.length,
        }),
      "Project saved.",
    );

    if (saved) {
      setEditingProject(null);
    }

    return saved;
  }

  async function handleCertificationSubmit(values) {
    const saved = await runAction(
      () =>
        upsertCareerCertification({
          certificationId: editingCertification?.certificationId,
          profileId: profile.profileId,
          name: values.name,
          issuer: values.issuer,
          issueDate: values.issueDate,
          expirationDate: values.expirationDate,
          credentialId: values.credentialId,
          credentialUrl: values.credentialUrl,
          notes: values.notes,
          sortOrder:
            editingCertification?.sortOrder ?? profile.certifications.length,
        }),
      "Certification saved.",
    );

    if (saved) {
      setEditingCertification(null);
    }

    return saved;
  }

  async function handlePreferencesSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction(
      () =>
        updateCareerPreferences({
          profileId: profile.profileId,
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

  function handleGenerateResumeDraft() {
    setError("");
    setStatus("");
    setResumeDraft(createResumeDraftFromCareerProfile(profile, profilePreferences));
    setResumeDraftOpen(true);
  }

  async function handleAcceptResumeDraft(input) {
    if (busy) {
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    try {
      const resume = await createResume(input);
      setResumeDraft(null);
      setResumeDraftOpen(false);
      setStatus(`Resume "${resume.title}" created in Resume Library.`);
    } catch (createError) {
      setError(createError.message || "Resume draft save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">Career Profiles</h1>
          <p className="mt-3 text-foreground-muted">
            Create a focused profile variant for a resume direction, career path,
            or professional identity.
          </p>
          <div className="mt-6">
            <ProfileCreateForm
              busy={busy}
              onSubmit={handleCreateProfileSubmit}
            />
          </div>
          <div className="mt-4">
            <StatusLine status={status} error={error} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <ScrollArea.Root className="ScrollAreaRoot">
        <ScrollArea.Viewport className="ScrollAreaViewport">
          <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[22rem_1fr]">
            <ProfileList
              profiles={profiles}
              selectedId={profile.profileId}
              busy={busy}
              onDelete={(item) => setPendingProfileDeletion(item)}
              onEdit={(item) => {
                selectProfile(item.profileId);
                setEditingProfile(item);
              }}
              onSelect={selectProfile}
              onCreate={() => {
                setCreatingProfile(true);
                resetSectionEditors();
              }}
            />

            <section className="min-w-0">
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">
                      {profile.name || "Career Profile"}
                    </h1>
                    {profile.isDefault ? (
                      <span className="rounded-md border border-border px-2 py-1 text-xs text-foreground-muted">
                        Default
                      </span>
                    ) : null}
                  </div>
                  {profile.focus ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground-muted">
                      {profile.focus}
                    </p>
                  ) : null}
                  {profile.headline ? (
                    <p className="mt-2 text-sm font-medium">
                      {profile.headline}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <StatusLine status={status} error={error} />
                  </div>
                </div>
                <ProfileToolbar
                  profile={profile}
                  busy={busy}
                  canDelete={profiles.length > 1}
                  onEdit={() => setEditingProfile(profile)}
                  onGenerateResumeDraft={handleGenerateResumeDraft}
                  onDelete={() => setPendingProfileDeletion(profile)}
                  onSetDefault={handleSetDefaultProfile}
                />
              </div>

              {creatingProfile ? (
                <div className="mb-6">
                  <h2 className="mb-4 text-xl font-semibold">New Profile</h2>
                  <ProfileCreateForm
                    busy={busy}
                    onSubmit={handleCreateProfileSubmit}
                    onCancel={() => setCreatingProfile(false)}
                  />
                </div>
              ) : null}

              <CareerProfileDisplay
                profile={profile}
                preferences={profilePreferences}
              />
            </section>
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

      <AppDialog
        open={Boolean(editingProfile)}
        onOpenChange={(open) => {
          if (!open && !busy) {
            resetSectionEditors();
          }
        }}
        title="Edit career profile"
        description={`Update "${profile.name || "this profile"}" and its career sections.`}
        size="large"
      >
        <ProfileEditForm
          profile={profile}
          busy={busy}
          onSubmit={handleProfileEditSubmit}
        />
        <CareerProfileSectionEditor
          profile={profile}
          preferences={profilePreferences}
          busy={busy}
          editors={{
            experience: editingExperience,
            education: editingEducation,
            skill: editingSkill,
            project: editingProject,
            certification: editingCertification,
          }}
          actions={{
            deleteExperience: (experienceId) =>
              runAction(
                () => deleteCareerExperience(experienceId, profile.profileId),
                "Experience deleted.",
              ),
            deleteEducation: (educationId) =>
              runAction(
                () => deleteCareerEducation(educationId, profile.profileId),
                "Education deleted.",
              ),
            deleteSkill: (skillId) =>
              runAction(
                () => deleteCareerSkill(skillId, profile.profileId),
                "Skill deleted.",
              ),
            deleteProject: (projectId) =>
              runAction(
                () => deleteCareerProject(projectId, profile.profileId),
                "Project deleted.",
              ),
            deleteCertification: (certificationId) =>
              runAction(
                () =>
                  deleteCareerCertification(certificationId, profile.profileId),
                "Certification deleted.",
              ),
          }}
          onAdd={{
            experience: setEditingExperience,
            education: setEditingEducation,
            skill: setEditingSkill,
            project: setEditingProject,
            certification: setEditingCertification,
          }}
          onEdit={{
            experience: setEditingExperience,
            education: setEditingEducation,
            skill: setEditingSkill,
            project: setEditingProject,
            certification: setEditingCertification,
          }}
          onCancel={{
            experience: setEditingExperience,
            education: setEditingEducation,
            skill: setEditingSkill,
            project: setEditingProject,
            certification: setEditingCertification,
          }}
          onSubmit={{
            experience: handleExperienceSubmit,
            education: handleEducationSubmit,
            skill: handleSkillSubmit,
            project: handleProjectSubmit,
            certification: handleCertificationSubmit,
            preferences: handlePreferencesSubmit,
          }}
        />
      </AppDialog>

      <ConfirmationDialog
        open={Boolean(pendingProfileDeletion)}
        onOpenChange={handleProfileDeleteDialogChange}
        title="Delete profile?"
        description={`"${pendingProfileDeletion?.name || "This profile"}" and its profile sections will be removed. This does not delete resumes.`}
        error={profileDeleteError}
        loading={busy}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        variant="destructive"
        onConfirm={handleDeleteProfile}
      />
      <ResumeMarkdownDraftDialog
        draft={resumeDraft}
        open={resumeDraftOpen}
        busy={busy}
        status={status}
        error={error}
        onAccept={handleAcceptResumeDraft}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setResumeDraftOpen(false);
            setResumeDraft(null);
          }
        }}
      />
    </>
  );
}
