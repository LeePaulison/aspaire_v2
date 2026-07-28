import * as yup from "yup";

const optionalIsoDate = yup
  .string()
  .transform((value) => value || "")
  .matches(/^$|^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

function endDateAfterStartDate(endDateLabel = "End date") {
  return yup.string().test({
    name: "end-date-after-start-date",
    message: `${endDateLabel} must be on or after start date`,
    test(value) {
      const startDate = this.parent.startDate;

      return !startDate || !value || value >= startDate;
    },
  });
}

export const careerExperienceSchema = yup.object({
  title: yup.string().default(""),
  company: yup.string().default(""),
  location: yup.string().default(""),
  startDate: optionalIsoDate,
  endDate: optionalIsoDate.concat(endDateAfterStartDate()),
  isCurrent: yup.boolean().default(false),
  description: yup.string().default(""),
  achievements: yup.string().default(""),
});

export const careerEducationSchema = yup.object({
  institution: yup.string().default(""),
  degree: yup.string().default(""),
  fieldOfStudy: yup.string().default(""),
  startDate: optionalIsoDate,
  endDate: optionalIsoDate.concat(endDateAfterStartDate()),
  notes: yup.string().default(""),
});

export const careerProjectSchema = yup.object({
  name: yup.string().trim().required("Project name is required"),
  role: yup.string().default(""),
  startDate: optionalIsoDate,
  endDate: optionalIsoDate.concat(endDateAfterStartDate()),
  link: yup.string().default(""),
  description: yup.string().default(""),
  outcomes: yup.string().default(""),
  technologies: yup.string().default(""),
});

export const careerCertificationSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  issuer: yup.string().default(""),
  issueDate: optionalIsoDate,
  expirationDate: optionalIsoDate.test({
    name: "expiration-date-after-issue-date",
    message: "Expiration date must be on or after issue date",
    test(value) {
      const issueDate = this.parent.issueDate;

      return !issueDate || !value || value >= issueDate;
    },
  }),
  credentialId: yup.string().default(""),
  credentialUrl: yup.string().default(""),
  notes: yup.string().default(""),
});
