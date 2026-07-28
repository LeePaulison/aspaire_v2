"use client";

import { ListItem, MarkdownPreview, Section } from "./CareerProfileFields";
import {
  achievementMarkdown,
  formatCertificationDateRange,
  formatDateRange,
} from "./careerProfileUtils";

export function CareerProfileDisplay({ profile, preferences }) {
  return (
    <>
      <Section title="Summary">
        <div className="grid gap-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Summary preview</h3>
            <MarkdownPreview
              content={profile.summary}
              emptyText="No summary yet."
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Goals preview</h3>
            <MarkdownPreview
              content={profile.careerGoals}
              emptyText="No career goals yet."
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              Additional notes preview
            </h3>
            <MarkdownPreview
              content={profile.additionalNotes}
              emptyText="No additional notes yet."
            />
          </div>
        </div>
      </Section>

      <Section title="Experience">
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
            />
          ))}
          {profile.experience.length === 0 ? (
            <p className="text-sm text-foreground-muted">No experience yet.</p>
          ) : null}
        </div>
      </Section>

      <Section title="Education">
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
            />
          ))}
          {profile.education.length === 0 ? (
            <p className="text-sm text-foreground-muted">No education yet.</p>
          ) : null}
        </div>
      </Section>

      <Section title="Skills">
        <div className="grid gap-3 md:grid-cols-2">
          {profile.skills.map((item) => (
            <ListItem
              key={item.skillId}
              title={item.name}
              subtitle={[item.category, item.proficiency].filter(Boolean).join(" · ")}
              detail={item.evidence}
            />
          ))}
        </div>
        {profile.skills.length === 0 ? (
          <p className="text-sm text-foreground-muted">No skills yet.</p>
        ) : null}
      </Section>

      <Section title="Projects">
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
            />
          ))}
          {profile.projects.length === 0 ? (
            <p className="text-sm text-foreground-muted">No projects yet.</p>
          ) : null}
        </div>
      </Section>

      <Section title="Certifications and Awards">
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
            />
          ))}
          {profile.certifications.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No certifications or awards yet.
            </p>
          ) : null}
        </div>
      </Section>

      <Section title="Job and Location Preferences">
        <div className="grid gap-4">
          <PreviewBlock
            title="Target roles"
            content={preferences.targetRoles}
            emptyText="No target roles yet."
          />
          <PreviewBlock
            title="Target industries"
            content={preferences.targetIndustries}
            emptyText="No target industries yet."
          />
          <PreviewBlock
            title="Target locations"
            content={preferences.locations}
            emptyText="No target locations yet."
          />
          <PreviewBlock
            title="Work modes"
            content={preferences.workModes}
            emptyText="No work modes yet."
          />
          <PreviewBlock
            title="Compensation goals"
            content={preferences.compensationGoals}
            emptyText="No compensation goals yet."
          />
          <PreviewBlock
            title="Constraints or dealbreakers"
            content={preferences.constraints}
            emptyText="No constraints yet."
          />
        </div>
      </Section>
    </>
  );
}

function PreviewBlock({ title, content, emptyText }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <MarkdownPreview content={content} emptyText={emptyText} />
    </div>
  );
}
