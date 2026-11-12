"use client";

import { profile } from "@/data/profile";
import { useWindowStore } from "@/store/window-store";
import { ExternalProfileButton } from "../components/external-profile-button";
import { ProfileAvatar } from "../components/profile-avatar";
import { getProfileLink } from "../utils/social-links";
import { LinkedInFeaturedProjects } from "./linkedin-featured-projects";
import { LinkedInAbout, LinkedInEducation, LinkedInExperience, LinkedInSkills } from "./linkedin-sections";

const openProject = (projectId: string) => useWindowStore.getState().openProject(projectId);

/** A LinkedIn-inspired profile built from the central developer profile. */
export function LinkedInApp() {
  const link = getProfileLink("linkedin");

  return (
    <div className="@container size-full overflow-y-auto bg-surface-2 text-black">
      <div className="mx-auto max-w-[780px] space-y-3 p-4">
        <section aria-label="Profile" className="overflow-hidden rounded-lg border border-black/10 bg-raised/70">
          <div aria-hidden className="h-24 bg-gradient-to-r from-[#0a66c2] to-[#4a9be0]" />
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end justify-between">
              <ProfileAvatar name={profile.fullName ?? profile.displayName} src={profile.avatar} className="size-24 border-4 border-[var(--surface-raised)] text-[28px]" />
              <div className="flex flex-col items-end gap-1 pb-1">
                <ExternalProfileButton url={link?.url} label="Open LinkedIn Profile" className="bg-[#0a66c2] text-white hover:bg-[#004182]" />
                {!link && <p className="text-[11px] text-black/40">No LinkedIn profile is configured.</p>}
              </div>
            </div>
            <h1 className="mt-2 text-[22px] leading-7 font-semibold">{profile.fullName ?? profile.displayName}</h1>
            {profile.headline && <p className="text-[14px] text-black/75">{profile.headline}</p>}
            {profile.location && <p className="mt-0.5 text-[12px] text-black/50">{profile.location}</p>}
            {/* Honest about the source: this is the portfolio's own profile, not data read from LinkedIn. */}
            <p className="mt-3 text-[11px] text-black/40">This overview is based on my CV. It is not synchronized from LinkedIn.</p>
          </div>
        </section>

        <LinkedInAbout />
        <LinkedInExperience />
        <LinkedInEducation />
        <LinkedInSkills />
        <LinkedInFeaturedProjects onOpenProject={openProject} />
      </div>
    </div>
  );
}
