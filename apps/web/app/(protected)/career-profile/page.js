import { Header } from "@/components/ui/Header";
import { CareerProfileClient } from "@/components/career-profile/CareerProfileClient";
import { listCareerProfiles } from "@/graphql/careerProfile/serverCareerProfile";

export default async function CareerProfilePage() {
  const profiles = await listCareerProfiles();
  const defaultProfile =
    profiles.find((profile) => profile.isDefault) ?? profiles[0] ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <CareerProfileClient
        initialProfile={defaultProfile}
        initialProfiles={profiles}
      />
    </div>
  );
}
