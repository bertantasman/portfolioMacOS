import { siteConfig } from "@/config/site";

// The developer profile: one place for personal information, used by Notes, and
// available to every other app. Only verified information belongs here. Leave a
// field unset (or a list empty) until it is known; apps show a clear incomplete
// state instead of inventing content.

// Dates are ISO 8601 and may be partial: "2023", "2023-09" or "2023-09-15". A missing month is
// never filled in. A position or programme is only shown as ongoing when `current` is set.

export interface ExperienceEntry {
  id: string;
  /** The employer or organisation. */
  organization: string;
  role: string;
  kind?: "full-time" | "part-time" | "internship" | "freelance" | "research" | "other";
  location?: string;
  startDate?: string;
  endDate?: string;
  /** The position is held now. */
  current?: boolean;
  description?: string;
  responsibilities?: readonly string[];
  technologies?: readonly string[];
  organizationUrl?: string;
  /** Stable project ids from the project registry that relate to this role. */
  projectIds?: readonly string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  graduationDate?: string;
  /** The programme is ongoing; no graduation is implied. */
  current?: boolean;
  location?: string;
  description?: string;
  highlights?: readonly string[];
  institutionUrl?: string;
  /** Stable project ids from the project registry (academic projects). */
  projectIds?: readonly string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expirationDate?: string;
  credentialUrl?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  /** Free text, e.g. "Native" or "Professional working proficiency". */
  proficiency?: string;
}

/** The resume is a document in the document registry (data/documents.ts); this only points at it. */
export interface ResumeMetadata {
  documentId: string;
  /** ISO 8601 date the PDF was last updated. */
  updatedAt?: string;
  language?: string;
}

export interface SkillGroup {
  id: string;
  /** e.g. "Programming Languages", "Mobile Development", "Backend". */
  name: string;
  skills: readonly string[];
}

export interface JourneyMilestone {
  id: string;
  title: string;
  /** ISO 8601 date or year. */
  date?: string;
  description?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface DeveloperProfile {
  displayName: string;
  /** The full name as written in the CV. Used where a formal name fits (About page, Terminal `whoami`, Notes). */
  fullName?: string;
  headline?: string;
  /** Profile image under /public (e.g. "/images/profile.jpg"). Leave unset until one exists. */
  avatar?: string;
  /** Compact biography (about 40–70 words) for small surfaces. Falls back to the first paragraph of `bio`. */
  shortBio?: string;
  /** Full biography for the Safari About page. Paragraphs separated by a blank line. */
  bio?: string;
  location?: string;
  email?: string;
  website?: string;
  interests?: readonly string[];
  currentFocus?: string;
  // The personal sections of the About page, in the developer's own words (first person, one string per paragraph).
  // They come from the developer's account of themselves, not from the CV, and make no claims about dates or results.
  /** "My Story": how the interest in software and in mobile development began. */
  story?: readonly string[];
  /** "What Drives Me": the developer's approach to building products. A personal approach, not an achievement. */
  drives?: readonly string[];
  /** "Beyond the Code": interests outside software. */
  beyondTheCode?: readonly string[];
  /** "What's Next": career direction. Not an offer, a title or an availability date. */
  whatsNext?: readonly string[];
  /** The project whose personal story (ProjectContent.personalStory) is previewed on the About page. */
  closeProjectId?: string;
  education: readonly EducationEntry[];
  experience: readonly ExperienceEntry[];
  skillGroups: readonly SkillGroup[];
  /** Skill names (as listed in a group) to show on compact surfaces. Nothing is featured automatically. */
  featuredSkills?: readonly string[];
  /** Skill name → project ids that actually use it, so a skill can lead to its projects. */
  skillProjects?: Readonly<Record<string, readonly string[]>>;
  certifications: readonly CertificationEntry[];
  languages: readonly LanguageEntry[];
  resume?: ResumeMetadata;
  journey: readonly JourneyMilestone[];
  socialLinks: SocialLinks;
}

const orUndefined = (value: string) => value || undefined;

// Source: the developer's CV (Europass, generated 2026-10-19), plus the verified analysis of the public GitHub
// repositories. Only professional information is kept here: the CV's private personal details (birth data, home
// address, phone number) are deliberately NOT part of the portfolio. See docs/CV_PROFILE_INTEGRATION.md.
export const profile: DeveloperProfile = {
  displayName: siteConfig.owner.name,
  // The developer's chosen public name (2026-11-12): "Bertan Taşman", used everywhere. The CV and the App Store provider
  // name use older spellings; they are not shown on the site.
  fullName: "Bertan Taşman",
  // The role title in the CV's current position (Mobile Application Developer / Software Project Coordinator).
  headline: "Mobile Application Developer",
  // Updated 2026-11-12 to cover the published and case-study projects. Every project statement matches its case study.
  shortBio:
    "Mobile application developer and Master's student at Ca' Foscari University of Venice. I developed CourtRise, an iOS basketball training app published on the App Store, and I build iOS and Android applications, including a cross-platform attendance system and a physics-based arcade game.",
  bio: [
    "I'm a Computer Science graduate from Istanbul Aydin University and a Master's student at Ca' Foscari University of Venice. Mobile application development and software engineering are the areas I'm most interested in.",
    "I work as a mobile application developer and software project coordinator at Akıllı Otomat in Istanbul. Before that I was an iOS developer intern at BilgeAdam Teknoloji and a software tester at Telpass.",
    "CourtRise, an iOS basketball training app I developed on my own, is published on the App Store. I also built GeoAttend, an iOS and Android attendance system, and LineMaster, a physics-based arcade game, and I co-created BuGunluk, a job-matching platform for students. I'd like to keep growing as an engineer and to work with international teams.",
  ].join("\n\n"),
  location: "Venice, Italy",
  email: "bertantasman@gmail.com",
  interests: ["Software engineering", "Mobile application development"],
  story: [
    "My interest in technology started long before I wrote my first line of code. Growing up, I was always curious about computers and how things worked behind the screen.",
    "Over time, that curiosity evolved into software development. Being surrounded by people who were building successful mobile applications inspired me to explore mobile development myself. As smartphones became a bigger part of my everyday life, I became increasingly interested in creating experiences for the devices we use most.",
    "Today, mobile development is where I feel most at home, particularly iOS development.",
    "What interests me most isn't just making an application work. It's making it feel right to the person using it. I believe a great mobile application should be intuitive, thoughtfully designed, and enjoyable to use.",
    "I'm especially interested in opportunities where I can combine technical development with product thinking and user experience.",
  ],
  drives: [
    "For me, software development is about more than writing code. I'm interested in the entire experience of building a product, from understanding the problem to figuring out how people will interact with the final application.",
    "User experience is especially important to me. I believe that even a technically impressive application can fall short if it feels confusing or difficult to use.",
    "That's why I enjoy thinking about how an application looks, behaves, and feels from the user's perspective. My goal is to build mobile experiences that are not only functional but also intuitive and enjoyable.",
  ],
  beyondTheCode: [
    "When I'm not working on software, you'll probably find me listening to music, watching basketball, or looking forward to the next concert or sporting event.",
    "Music is a big part of my everyday life, and I particularly enjoy experiencing it live. The same goes for sports: there's something about the atmosphere of a live game that you simply can't recreate through a screen.",
    "I enjoy experiences that bring people together, whether that's a concert, a basketball game, or working with a small team to bring an idea to life.",
  ],
  whatsNext: [
    "I'm looking forward to continuing my career in software development, with a particular focus on mobile applications.",
    "iOS development is where I have the strongest experience, and it's an area I'd love to keep exploring professionally.",
    "At the same time, I enjoy learning new technologies and remain open to opportunities that allow me to grow as a software engineer.",
    "I'm especially interested in working on products where technical development and thoughtful user experience come together.",
    // Stated by the developer (2026-10-27): available now. No date, no offer, no job title is implied.
    "I'm available for new opportunities now.",
  ],
  closeProjectId: "bugunluk",
  education: [
    {
      id: "ca-foscari-msc",
      institution: "Ca' Foscari University of Venice",
      degree: "Master's Degree",
      fieldOfStudy: "Computer Science and Information Technology",
      startDate: "2026-10-16",
      current: true,
      location: "Venice, Italy",
      description:
        "Advanced studies in Computer Science, focusing on software engineering, system architecture, artificial intelligence and cybersecurity.",
      highlights: [
        "Software Architecture and Development Methodologies",
        "Machine Learning and Artificial Intelligence",
        "Advanced Database Management",
        "System Security and Cryptography",
        "Formal Methods and Software Verification",
        "Applied Probability and Mathematical Foundations",
      ],
    },
    {
      id: "aydin-bsc",
      institution: "Istanbul Aydin University",
      degree: "Bachelor of Science in Software Development",
      fieldOfStudy: "Computer Science",
      startDate: "2021-09-01",
      graduationDate: "2026-07-06",
      location: "Istanbul, Türkiye",
      description: "A programme taught entirely in English, with a focus on software development, programming, mobile applications and web technologies.",
      institutionUrl: "https://www.aydin.edu.tr",
    },
  ],
  experience: [
    {
      id: "akilli-otomat",
      organization: "Akıllı Otomat",
      role: "Mobile Application Developer / Software Project Coordinator",
      startDate: "2025-10-03",
      current: true,
      location: "Istanbul, Türkiye",
      responsibilities: [
        "Develops iOS and Android applications, with a focus on scalable, user-oriented solutions",
        "Contributes to web application development and backend integration",
        "Coordinates between technical and non-technical teams during software projects",
        "Takes part in software architecture planning and decision-making",
        "Oversees project timelines, task distribution and delivery milestones",
        "Is involved in product strategy and management-level technical planning",
      ],
    },
    {
      id: "bilgeadam-intern",
      organization: "BilgeAdam Teknoloji",
      role: "iOS Developer Intern",
      kind: "internship",
      startDate: "2024-10-01",
      endDate: "2025-06-13",
      location: "Istanbul, Türkiye",
      responsibilities: [
        "Developed iOS applications using Swift and UIKit",
        "Worked extensively with list views and user interface components",
        "Gained hands-on experience with data fetching, processing and API integration",
        "Deepened understanding of iOS application architecture and best practices",
      ],
      technologies: ["Swift", "UIKit"],
    },
    {
      id: "telpass-tester",
      organization: "Telpass",
      role: "Software Tester",
      startDate: "2024-02-08",
      endDate: "2024-08-07",
      location: "Istanbul, Türkiye",
      responsibilities: [
        "Carried out software testing and quality assurance",
        "Identified, reported and documented software bugs",
        "Tested the chat applications Taksim Chat, Beurtelet Chat and Base Chat",
        "Worked with developers to improve software quality and stability",
      ],
    },
  ],
  // Skills: the CV's list, extended on 2026-11-12 with the technologies the developer's projects use (stated by the developer,
  // and visible in the projects' own build files). Levels are kept only where the CV states one ("SwiftUI (intermediate)").
  skillGroups: [
    { id: "languages", name: "Programming Languages", skills: ["Swift", "Kotlin", "Java", "Python", "TypeScript", "JavaScript"] },
    { id: "mobile", name: "Mobile Development", skills: ["iOS development", "Android development", "UIKit", "SwiftUI (intermediate)", "Jetpack Compose", "Material 3", "SpriteKit", "libGDX", "StoreKit 2", "Flutter"] },
    { id: "backend-data", name: "Backend and Data", skills: ["Firebase", "Cloud Firestore", "Cloud Functions", "Firebase Cloud Messaging", "Express", "Prisma", "JSON"] },
    { id: "web", name: "Web Development", skills: ["Next.js", "React", "Tailwind CSS", "HTML and CSS"] },
    { id: "ai-vision", name: "Computer Vision", skills: ["OpenCV", "PyTorch"] },
    { id: "developer-tools", name: "Developer Tools", skills: ["Git", "Postman"] },
    { id: "engineering", name: "Software Engineering", skills: ["MVVM architecture", "Object-Oriented Programming", "Analysing software specifications", "Software testing"] },
  ],
  // The technologies the CV's summary names as hands-on experience.
  featuredSkills: ["Swift", "SwiftUI (intermediate)", "Kotlin", "Jetpack Compose", "Firebase", "Python"],
  certifications: [],
  languages: [
    { id: "turkish", language: "Turkish", proficiency: "Native" },
    { id: "english", language: "English", proficiency: "B2 (independent user)" },
  ],
  // Points at the entry in data/documents.ts. The CV is NOT published: it contains private details. A public,
  // privacy-checked PDF must be approved and added at public/documents/Resume.pdf before this works.
  resume: { documentId: "resume" },
  journey: [],
  // Profile URLs are configured once, in siteConfig.
  socialLinks: {
    github: orUndefined(siteConfig.profiles.github),
    linkedin: orUndefined(siteConfig.profiles.linkedin),
    instagram: orUndefined(siteConfig.profiles.instagram),
  },
};
