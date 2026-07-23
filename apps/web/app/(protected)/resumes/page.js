import { Header } from "@/components/ui/Header";
import { ResumeLibraryClient } from "@/components/resumes/ResumeLibraryClient";
import { getResumes } from "@/graphql/resume/serverResume";

export default async function ResumesPage() {
  const resumes = await getResumes();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <ResumeLibraryClient initialResumes={resumes} />
    </div>
  );
}
