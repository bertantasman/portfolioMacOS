import type { ProjectContent } from "@/types/project-content";

/**
 * Curated project content. Add one entry per project, keyed by the project's id: a curated id such as
 * "bugunluk", or "github:<repository id>" for a GitHub-backed project (the numeric id survives renames).
 * Write only what you can stand behind: no metrics, awards or architecture you haven't verified.
 *
 * Example entry (not real content, so it is commented out):
 *
 *   {
 *     projectId: "geoattend",
 *     tagline: "…",
 *     overview: "First paragraph.\n\nSecond paragraph.",
 *     technologies: [{ name: "Swift", category: "mobile" }, { name: "Firebase", category: "backend" }],
 *     features: [{ id: "geofence", title: "…", description: "…", icon: "map-pin" }],
 *     links: { appStore: "https://apps.apple.com/…" },
 *     developmentStatus: "completed",
 *   }
 *
 * Screenshots are not listed here: add them to the shared media library (src/data/media.ts) with the
 * project's id, and they appear in this project's gallery and in Photos. Set `coverMediaId` to pick the cover.
 */
export const curatedContent: readonly ProjectContent[] = [
  // ── Curated projects (no public repository). Their factual description stays in data/projects.ts. ──
  {
    projectId: "bugunluk",
    // Written from the developer's own account and from the project's source (reviewed 2026-10-27, see
    // docs/BUGUNLUK_CASE_STUDY.md). BuGunluk is a team project and has not been publicly released: nothing below
    // claims users, downloads, revenue, launch dates or results, and no technical claim goes beyond what the code shows.
    tagline:
      "BuGunluk is a native iOS platform connecting students and young workers with flexible, short-term job opportunities. Built collaboratively with a small team, the application combines role-based experiences, job discovery, applications, employer management, and Firebase-powered workflows.",
    overview:
      "BuGunluk is a native iOS application designed to simplify the process of finding and offering short-term work.\n\nThe platform brings together two different user groups: people looking for flexible employment opportunities and businesses seeking temporary workers. Instead of treating job discovery and recruitment as separate experiences, BuGunluk aims to connect them through a single mobile platform.\n\nThe application includes role-specific interfaces, job listings, applications, employer management tools, and supporting communication workflows.",
    problem:
      "Students and young workers may need employment opportunities that fit around their schedules. At the same time, businesses may occasionally need additional workers for short-term assignments.\n\nBuGunluk was conceived to make it easier for these two groups to find each other through a mobile-first experience.",
    solution:
      "BuGunluk is a two-sided platform: one app with a separate experience for workers and for employers, connected by job listings, applications and messaging.",
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "SwiftUI", category: "mobile" },
      { name: "MVVM", category: "mobile" },
      { name: "Repository Pattern", category: "mobile" },
      { name: "Firebase Authentication", category: "backend" },
      { name: "Google Sign-In", category: "backend" },
      { name: "Cloud Firestore", category: "backend" },
      { name: "Firebase Cloud Messaging", category: "backend" },
      { name: "Cloud Functions", category: "backend" },
    ],
    developmentStatus: "in-development",
    // The jobs list is the cover, rather than the first (onboarding) screenshot.
    coverMediaId: "bugunluk-05",
    caseStudy: {
      summary: [
        { label: "Role", value: "Co-Creator & iOS / Firebase Developer" },
        { label: "Team", value: "4 people" },
        { label: "Platform", value: "iOS" },
        { label: "Technologies", value: "Swift, SwiftUI, Firebase, Firestore" },
        { label: "Status", value: "In Development" },
        { label: "Started", value: "November 2025" },
      ],
      // The developer's own accounts (2026-10-27), verbatim. Nothing here implies legal clearance, incorporation,
      // regulatory approval, users or revenue, and no team member is named.
      origin: {
        title: "How It Started",
        paragraphs: [
          "BuGunluk started as an idea that a close friend and I came up with together.",
          "What began as a conversation gradually turned into something much bigger. We spent countless hours discussing how the platform should work, refining the user experience, and making decisions about the product.",
          "Throughout the development process, we held more than 30 meetings, sometimes involving a friend who is a lawyer to better understand the legal considerations surrounding the platform.",
          "As the project grew, our team expanded to include an Android developer and a project manager.",
        ],
      },
      role: {
        title: "My Role",
        paragraphs: [
          "As a co-creator of BuGunluk, I took responsibility for developing the native iOS application and its Firebase backend.",
          "My work covered the technical implementation of the iOS experience, including SwiftUI interfaces, application architecture, authentication, Firestore integration, and the platform's core workflows.",
          "Beyond writing code, I worked closely with my co-creator on product decisions, UI/UX design, and shaping the overall experience.",
          "Being involved in both product discussions and technical implementation gave me a broader perspective on what it takes to turn an idea into a working application.",
        ],
        ownership: {
          title: "Technical ownership",
          items: [
            { label: "Native iOS development", value: "Swift and SwiftUI implementation of the iOS application." },
            { label: "Application architecture", value: "MVVM-based separation of views, state management, business logic, and data access." },
            { label: "Authentication and user management", value: "Firebase Authentication, Google Sign-In, and role-based onboarding flows." },
            { label: "Backend and data management", value: "Cloud Firestore integration, repositories, data models, and application workflows." },
            { label: "Real-time functionality", value: "Firestore-based updates and communication-related functionality." },
            { label: "Supporting infrastructure", value: "Documented Firebase Cloud Messaging and Cloud Functions integrations." },
          ],
        },
      },
      collaboration: {
        title: "Building Together",
        stages: [
          { label: "The beginning", value: "Two people developing an idea together." },
          { label: "Product development", value: "More than 30 meetings discussing product details, design decisions, and practical considerations." },
          { label: "Team expansion", value: "An Android developer and a project manager joined the team." },
          { label: "Collaboration", value: "A multidisciplinary effort involving product thinking, design, development, and discussions of legal considerations." },
        ],
      },
      challenge: {
        title: "The Biggest Challenge Wasn't the Code",
        paragraphs: [
          "Interestingly, the most challenging part of building BuGunluk wasn't writing the code.",
          "It was understanding the legal considerations involved in creating a platform that connects workers and employers.",
          "As we explored how the platform should operate, we realized that building a real product requires thinking beyond features and technical implementation.",
          "We discussed these questions in several meetings, including conversations with a friend who is a lawyer.",
          "The experience helped me understand that software development also involves responsibilities, constraints, and decisions that exist outside the codebase.",
        ],
      },
      reflection: {
        title: "What BuGunluk Taught Me",
        paragraphs: [
          "BuGunluk taught me that building a product is about much more than implementing features.",
          "Working on an idea from its earliest stages helped me understand how technical decisions, user experience, teamwork, and practical considerations influence one another.",
          "Taking responsibility for the iOS application and Firebase backend gave me the opportunity to work across multiple parts of a connected system.",
          "At the same time, collaborating with a growing team showed me how important communication and shared decision-making are throughout development.",
          "Most importantly, BuGunluk reinforced my interest in building mobile products that are useful, intuitive, and thoughtfully designed.",
        ],
      },
      audiences: [
        {
          title: "For workers",
          intro: "The application is designed to help workers:",
          items: ["Discover available jobs.", "Review job details.", "Submit applications.", "Track application statuses.", "Communicate with employers.", "Review work and payment information."],
        },
        {
          title: "For employers",
          intro: "The application is designed to help employers:",
          items: ["Create job postings.", "Review applications.", "Manage applicants.", "Communicate with workers.", "Update hiring decisions.", "Track payment statuses."],
        },
      ],
      userExperience: {
        title: "Designing for Two Different Users",
        paragraphs: [
          "One of the central product challenges was designing an experience that works for both workers and employers.",
          "Workers need a straightforward way to discover opportunities and apply for jobs. Employers need tools for publishing opportunities, reviewing applicants, and managing their hiring workflow.",
          "BuGunluk approaches these requirements through separate role-based interfaces while maintaining a consistent design language.",
          "User experience was an important part of the BuGunluk development process. The team worked on creating distinct experiences for workers and employers while maintaining consistency across the application. The interface uses a shared design system, reusable components, clear navigation, and visual feedback to support common actions. The goal was to make important workflows understandable without unnecessary complexity.",
        ],
        designElements: {
          title: "Design elements in the app",
          items: ["SwiftUI interface", "Light and Dark Mode", "Reusable components", "Consistent color system", "Loading states", "Error states", "Empty states", "Form validation", "Role-specific navigation"],
        },
      },
      journeys: [
        {
          title: "Worker journey",
          items: ["Create an account.", "Select the Worker role.", "Complete a profile.", "Explore job listings.", "Review job details.", "Submit an application.", "Track application progress.", "Communicate with the employer."],
        },
        {
          title: "Employer journey",
          items: ["Create an account.", "Select the Employer role.", "Complete company information.", "Publish a job listing.", "Review applications.", "Select applicants.", "Communicate with workers.", "Track payment status."],
        },
      ],
      architecture: {
        intro: [
          "BuGunluk separates its interface, application state, business logic, and data access into distinct layers.",
          "SwiftUI views handle presentation and user interaction. ViewModels manage screen state and coordinate application behavior. Services and repositories encapsulate authentication, Firestore operations, and domain-specific workflows. Models represent application entities such as jobs, applications, users, conversations, and payouts.",
          "This structure supports clearer responsibilities and more maintainable development.",
        ],
        facts: [
          { label: "Platform", value: "Native iOS" },
          { label: "Language", value: "Swift" },
          { label: "UI framework", value: "SwiftUI" },
          { label: "Architectural pattern", value: "MVVM" },
          { label: "Data access", value: "Repository and Service layers" },
          { label: "Backend", value: "Firebase" },
          { label: "Authentication", value: "Firebase Authentication and Google Sign-In" },
          { label: "Database", value: "Cloud Firestore" },
          { label: "Notifications", value: "Firebase Cloud Messaging and Cloud Functions" },
        ],
      },
      highlights: [
        {
          title: "Role-based application flow",
          body: "A centralized session ViewModel coordinates authentication, onboarding, role selection, profile completion and navigation. This supports distinct Worker and Employer experiences.",
          verification: "Confirmed in the source: one session ViewModel routes a signed-in user to the worker or employer experience, or to role selection and registration.",
        },
        {
          title: "Duplicate application prevention",
          body: "Application identifiers are derived deterministically from the job and worker IDs, which helps prevent multiple applications from the same worker to the same job.",
          verification: "Confirmed in the source: the identifier combines both IDs, and the app checks for an existing application before creating one.",
        },
        {
          title: "Real-time messaging and payments",
          body: "Firestore listeners keep conversations and payment records up to date while a screen is open.",
          verification: "Confirmed in the source for chats, messages and payouts. Job listings are loaded on request, not through a live listener.",
        },
        {
          title: "Hiring workflow",
          body: "Hiring a worker updates the application status inside a transaction, then records a job snapshot, updates the conversation, creates the payout record and sends an onboarding message to the worker.",
          verification: "Confirmed in the source. The follow-up steps run after the transaction, not as one atomic operation.",
        },
        {
          title: "Payment status tracking",
          body: "Payments are tracked through three states: Pending, Paid and Confirmed. This is status tracking only. BuGunluk does not process payments or transfer money.",
          verification: "Confirmed in the source: the employer marks a payout as paid and the worker confirms it. No payment gateway is integrated.",
        },
        {
          title: "Push notification infrastructure",
          body: "The project's Cloud Functions code notifies workers when a job is posted and notifies a user when a message arrives, using Firebase Cloud Messaging. Another function marks jobs as expired after their shift ends.",
          verification: "These functions exist in the source. Whether they are deployed and running was not verified, so they are not presented as operational.",
        },
      ],
      currentStatus: {
        badges: ["Active Development", "Not Yet Publicly Released"],
        paragraphs: [
          "BuGunluk is still being developed and refined. Development began in November 2025.",
          "The application is not available to the public. The interface is currently in Turkish, and the source repository is private.",
        ],
        next: {
          title: "What's next",
          items: [
            "Profile photo storage (profile photos are not yet uploaded to cloud storage).",
            "A real notification center (the in-app notifications screen still shows sample content).",
            "Further refinement of job discovery and filtering (a nearby-jobs filter and sorting already exist).",
            "Automated testing (the test targets contain only the Xcode templates).",
            "Further workflow refinements.",
          ],
        },
      },
    },
    personalStory: {
      title: "What BuGunluk Means to Me",
      paragraphs: [
        "BuGunluk is more than another project in my portfolio.",
        "It's something a close friend and I started together, shaped through countless conversations, and gradually turned into a real application with our team.",
        "Although it hasn't been publicly released yet, it's the project I feel most personally connected to.",
        "We've invested so much time and care into it that it feels like something we've grown together from the very beginning.",
      ],
      // The About page shows the first paragraph and the release statement, and links here for the rest.
      previewParagraphs: [0, 2],
    },
    outcomes: [{ label: "Team project, not yet released", description: "Developed collaboratively by a team of four. It has not been publicly released." }],
  },

  {
    projectId: "courtrise",
    // Written from the developer's brief, the public App Store listing and the project's source (reviewed 2026-10-27,
    // see docs/COURTRISE_CASE_STUDY.md). Nothing here states ratings, downloads, users, subscribers or revenue.
    tagline:
      "CourtRise is a published native iOS basketball training application featuring adaptive drills, XP progression, player attributes, training statistics, and an optional Pro subscription.",
    overview:
      "Train Smarter. Track Progress. Level Up.\n\nCourtRise is a native iOS basketball training application designed to turn practice into measurable progress.\n\nInstead of simply recording workouts, CourtRise combines basketball drills with adaptive training targets, player attributes, XP, daily missions, and progression systems. The goal is to make basketball development more structured, engaging, and rewarding.\n\nBuilt with SwiftUI and Firebase, CourtRise brings together sports training, mobile product design, and gamification.",
    problem:
      "Basketball improvement requires consistent practice, but progress can be difficult to visualize through individual training sessions.\n\nCourtRise explores how a mobile application can help players record training activity, monitor development, and stay motivated through clear progression systems.",
    solution:
      "CourtRise combines the capabilities below in one app. They are documented product features: the app does not offer professional coaching certification and does not guarantee athletic improvement.",
    features: [
      { id: "drills", title: "Basketball drill tracking", description: "Log training sessions across basketball skill areas.", icon: "check" },
      { id: "adaptive", title: "Adaptive training targets", description: "Selected drill targets adjust to the player's progression.", icon: "zap" },
      { id: "attributes", title: "Player attribute progression", description: "Five basketball-related attributes that grow with training.", icon: "layout" },
      { id: "xp", title: "XP and leveling", description: "Training activity earns experience points and levels.", icon: "zap" },
      { id: "missions", title: "Daily missions", description: "Daily training objectives.", icon: "calendar" },
      { id: "streaks", title: "Streak tracking", description: "Consistency is tracked over time.", icon: "check" },
      { id: "stats", title: "Training statistics", description: "Statistics based on session history.", icon: "layout" },
      { id: "compare", title: "Player comparisons", description: "Compare player profiles.", icon: "users" },
      { id: "recommend", title: "Personalized recommendations", description: "Training suggestions for the player's profile.", icon: "search" },
    ],
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "SwiftUI", category: "mobile" },
      { name: "MVVM", category: "mobile" },
      { name: "StoreKit 2", category: "mobile" },
      { name: "Firebase Authentication", category: "backend" },
      { name: "Cloud Firestore", category: "backend" },
      { name: "Firebase Storage", category: "backend" },
      { name: "Google Sign-In", category: "backend" },
      { name: "Sign in with Apple", category: "backend" },
    ],
    links: { appStore: "https://apps.apple.com/tr/app/courtrise/id6760609447" },
    developmentStatus: "published",
    outcomes: [{ label: "Published on the App Store", description: "A public App Store listing exists. This page states no ratings, downloads, subscribers or revenue." }],
    caseStudy: {
      summary: [
        { label: "Role", value: "Solo Developer & Product Creator" },
        { label: "Platform", value: "iOS" },
        { label: "Status", value: "Published on the App Store" },
        { label: "Built with", value: "Swift, SwiftUI" },
        { label: "Backend", value: "Firebase (Authentication, Firestore, Storage)" },
        { label: "Monetization", value: "Freemium, with an optional Pro subscription (StoreKit 2)" },
        { label: "Languages", value: "English, Turkish" },
        { label: "Organic reach", value: "About 30,000 App Store impressions, no paid advertising" },
      ],
      sections: [
        {
          id: "role",
          title: "My Role",
          label: "My Role",
          // The developer's own account (2026-10-27), verbatim: CourtRise was built independently.
          paragraphs: [
            "CourtRise is a project I built entirely on my own, from the initial idea to its release on the App Store.",
            "I was responsible for every stage of development, including product planning, UI/UX design, visual identity, native iOS development, Firebase backend integration, and App Store distribution.",
            "One of the most interesting technical challenges was designing the adaptive training system, which adjusts workout targets based on player progression and attributes.",
            "I also developed the application's gamification mechanics, authentication flows, guest experience, bilingual interface, and StoreKit 2 subscription integration.",
            "Building CourtRise independently gave me hands-on experience across the complete mobile product lifecycle, from designing the user experience to delivering a publicly available application.",
            "CourtRise represents my ability to take an idea, build a complete native iOS product, and bring it to the App Store independently.",
          ],
        },
        {
          id: "training",
          title: "A Structured Training Experience",
          label: "Training",
          paragraphs: ["CourtRise organizes practice into five training categories."],
          items: [
            { label: "Shooting", value: "Basketball shooting drills and accuracy-based tracking." },
            { label: "Finishing", value: "Basketball finishing exercises and completion-based goals." },
            { label: "Dribbling", value: "Ball-handling and playmaking-focused exercises." },
            { label: "Defense", value: "Defensive training activities." },
            { label: "Physical", value: "Physical development exercises." },
          ],
          bulletsIntro: "Drills can be evaluated in several ways:",
          bullets: ["Accuracy-based results", "Repetition targets", "Time-based objectives", "Turnover limits"],
        },
        {
          id: "adaptive",
          title: "Adaptive Training Difficulty",
          label: "Adaptive Difficulty",
          paragraphs: [
            "CourtRise uses a centralized difficulty policy that adjusts selected training targets based on the player's level, the relevant attribute level, the training category and a difficulty tier.",
            "It applies to accuracy-based and repetition-based drills. Time-target and turnover-limit drills keep their existing evaluation behavior.",
            "The system determines a target range from the player's level, then places the target within that range using a weighted combination of two factors: 65% progress within the player's current level band and 35% progress of the relevant attribute.",
          ],
          items: [
            { label: "Target selection", value: "The result is rounded and kept inside the range for the player's level." },
            { label: "Improvement qualification", value: "Performance is compared with a required improvement threshold that varies with the player's level and the relevant attribute's level." },
            { label: "What players see", value: "As players progress, selected drills can become more demanding, so training goals evolve alongside their in-app progression." },
          ],
          note: "This is a rule-based adaptive system. It is not machine learning or AI, it has not been scientifically validated, and it does not guarantee improved basketball performance.",
        },
        {
          id: "progression",
          title: "Turning Practice Into Progress",
          label: "Progression",
          items: [
            { label: "Experience points", value: "Players earn XP through training activity." },
            { label: "Player levels", value: "Training contributes to overall progression." },
            { label: "Attributes", value: "Five basketball-related attributes: Shooting, Finishing, Dribbling / Playmaking, Defense and Physical." },
            { label: "Overall rating", value: "The floor of the average of the five attributes." },
            { label: "Streaks", value: "The app tracks training consistency." },
            { label: "Daily missions", value: "Players receive daily training objectives." },
            { label: "Inactivity", value: "An attribute's rating can decrease after each full 48 hours without training that category." },
          ],
          note: "These are product mechanics inside the app. The virtual attributes are not validated measurements of real-world athletic ability.",
        },
        {
          id: "identity",
          title: "Building a Player Identity",
          label: "Player Identity",
          paragraphs: [
            "Users configure a basketball profile with details such as name and nickname, position, height, a personal training goal and starting attributes.",
            "Onboarding includes a 300-point initial attribute allocation, which creates a personalized starting profile for the app.",
          ],
          note: "The profile personalizes the experience. The app does not perform professional athletic assessments.",
        },
        {
          id: "access",
          title: "Making Training Accessible",
          label: "Access & Sign-in",
          bulletsIntro: "CourtRise supports:",
          bullets: ["Email/password authentication", "Google Sign-In", "Sign in with Apple", "Guest Mode"],
          paragraphs: [
            "CourtRise allows users to explore the training experience without immediately creating an account. Guest users can complete workouts and maintain local progress. When they decide to create an account, the application includes a migration flow designed to transfer their local progress into their authenticated profile.",
            "Technical highlights: local guest persistence, authenticated Firestore persistence, guest-to-account migration, duplicate session prevention, and premium functionality tied to an account.",
          ],
          note: "The migration flow is documented and present in the app; every edge case has not been independently verified.",
        },
        {
          id: "freemium",
          title: "Building a Freemium Experience",
          label: "Freemium",
          paragraphs: ["CourtRise is free to download and includes an optional monthly Pro subscription."],
          bulletsIntro: "The documented Pro experience includes:",
          bullets: ["Full training library", "Smart training recommendations", "Advanced player comparison", "Performance insights", "Streak protection"],
          items: [
            { label: "Technical implementation", value: "StoreKit 2 handles product loading, purchase flows, restoration and entitlement checks. The app shows StoreKit's runtime product price instead of a hardcoded one." },
          ],
          note: "A configured subscription does not prove paying subscribers, revenue or commercial success, and none is claimed. No price is shown here because App Store pricing varies by region and over time.",
        },
        {
          id: "backend",
          title: "Backend and Persistence",
          label: "Backend",
          paragraphs: ["The app uses a centralized observable application model alongside dedicated services."],
          items: [
            { label: "Firebase Authentication", value: "User authentication and session management." },
            { label: "Cloud Firestore", value: "Profiles, training records, progression and related application data." },
            { label: "Firebase Storage", value: "Profile image storage." },
            { label: "Local persistence", value: "Guest progress and locally persisted preferences." },
          ],
        },
        {
          id: "localization",
          title: "Built for Two Languages",
          label: "Localization",
          paragraphs: [
            "CourtRise supports English and Turkish. It uses a string catalog and an in-app language selector, so players can switch the interface language without changing their device language.",
          ],
        },
        {
          id: "mascot",
          title: "Feedback That Feels Human",
          label: "Mascot",
          paragraphs: ["A mascot reacts to training outcomes and offers contextual guidance. It is a designed feedback system, not an AI coach."],
          bulletsIntro: "Documented mascot states:",
          bullets: ["Normal", "Happy", "Sad", "Angry", "Tired", "Idea"],
        },
        {
          id: "identity-visual",
          title: "Visual Identity",
          label: "Visual Identity",
          paragraphs: ["CourtRise uses a premium dark sports interface. Attribute-specific accent colors support the main palette."],
          items: [
            { label: "Primary accent: Orange", value: "#FF6B00", swatch: "#FF6B00" },
            { label: "Background: Near-black", value: "#0E0E10", swatch: "#0E0E10" },
            { label: "Surface: Dark gray", value: "#1C1C1E", swatch: "#1C1C1E" },
          ],
          bulletsIntro: "The interface emphasizes:",
          bullets: ["Clear actions", "Strong contrast", "Training-focused information", "Consistent visual hierarchy", "Progress feedback", "Readable statistics"],
          note: "This is the app's own design system. This portfolio keeps its macOS-inspired look.",
        },
        {
          id: "meets",
          title: "Where Basketball Meets Development",
          label: "Basketball & Code",
          paragraphs: [
            "Basketball has always been one of my interests outside software development.",
            "CourtRise brings these two interests together.",
            "I wanted to work on a mobile experience where basketball training could feel more structured, measurable, and engaging.",
            "The idea of combining real practice with progression systems made CourtRise particularly interesting to develop.",
            "Working on this application allowed me to explore how software can support activities people are already passionate about.",
          ],
        },
        {
          id: "highlights",
          title: "Engineering Highlights",
          label: "Highlights",
          bullets: [
            "Native SwiftUI application",
            "Centralized observable state management",
            "Rule-based adaptive training difficulty",
            "XP and attribute progression",
            "Firebase authentication and persistence",
            "Guest progress migration",
            "StoreKit 2 subscription integration",
            "Runtime language switching",
            "Contextual mascot feedback",
            "App Store publication",
          ],
        },
        {
          id: "aso",
          title: "Organic Discovery Through ASO",
          label: "Organic Reach",
          // The developer's own statement (2026-10-28). The period is not stated, so none is shown.
          paragraphs: [
            "I set up CourtRise's App Store Optimization (ASO) settings myself.",
            "Without any paid advertising, the app has reached about 30,000 impressions on the App Store.",
          ],
          note: "An impression means the listing was shown in the App Store, as reported by the developer. It is not a download, and no download, rating, subscriber or revenue figure is claimed.",
        },
        {
          id: "release",
          title: "From Development to the App Store",
          label: "App Store Release",
          badges: ["Available on the App Store"],
          paragraphs: [
            "CourtRise is a published iOS application available through the Apple App Store.",
            "Bringing the application to a public release required moving beyond feature development and preparing the product for distribution through Apple's ecosystem.",
            "The published version represents an important milestone in the project's development.",
            "The listing opens from the App Store button at the top of this page.",
          ],
        },
      ],
    },
  },

  {
    projectId: "geoattend",
    // Written from the developer's statements and a read-only review of the iOS app, the Android app and the Firebase
    // backend (2026-10-27, see docs/GEOATTEND_CASE_STUDY.md). The organization the project serves is intentionally never
    // named, described or hinted at. No release, users, attendance data or production readiness is claimed.
    tagline:
      "An independently developed native iOS and Android system for event management, organization workflows, secure attendance verification, and administrative reporting.",
    overview:
      "A native iOS and Android application for event management, membership workflows, location-verified attendance, and administrative reporting.\n\nAdministrators create and manage events and the organization's membership. Members see the events relevant to them and check in on site, and the backend decides whether the check-in is valid.",
    features: [
      { id: "events", title: "Event management", description: "Create, edit, publish, and review events.", icon: "calendar" },
      { id: "organization", title: "Organization management", description: "Manage organization membership and access.", icon: "users" },
      { id: "attendance", title: "Attendance verification", description: "Verify event participation through server-side checks.", icon: "map-pin" },
      { id: "members", title: "Member management", description: "Review membership requests and assign member titles where supported.", icon: "shield" },
      { id: "reporting", title: "Reporting", description: "Review attendance information and export workbook reports (verified in both apps' source).", icon: "layout" },
    ],
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "SwiftUI", category: "mobile" },
      { name: "Kotlin", category: "mobile" },
      { name: "Jetpack Compose", category: "mobile" },
      { name: "Material 3", category: "mobile" },
      { name: "Firebase Authentication", category: "backend" },
      { name: "Cloud Firestore", category: "backend" },
      { name: "Cloud Functions", category: "backend" },
      { name: "Firestore Security Rules", category: "backend" },
      { name: "Google Maps", category: "infrastructure" },
      { name: "Places SDK", category: "infrastructure" },
    ],
    developmentStatus: "in-development",
    caseStudy: {
      summary: [
        { label: "Role", value: "Solo Full-Stack Mobile Developer" },
        { label: "Scope", value: "End-to-End Mobile & Backend Development" },
        { label: "Focus", value: "Cross-Platform Event & Attendance Management" },
        { label: "Platforms", value: "iOS (SwiftUI) and Android (Kotlin, Jetpack Compose)" },
        { label: "Backend", value: "Firebase (currently)" },
        { label: "Status", value: "Active Development" },
      ],
      sections: [
        {
          id: "role",
          title: "My Role",
          label: "My Role",
          // The developer's own account (2026-10-27), verbatim.
          paragraphs: [
            "GeoAttend is a cross-platform mobile application that I developed independently.",
            "I was responsible for the complete technical implementation, including the native iOS application, native Android application, Firebase backend, Cloud Functions, and database security rules.",
            "On iOS, I built the application using SwiftUI.",
            "On Android, I developed the native experience using Kotlin and Jetpack Compose.",
            "Both applications integrate with a shared backend responsible for authentication, event data, organization management, and attendance verification.",
            "Working across both platforms and the backend gave me the opportunity to make architectural decisions across the entire system rather than focusing on a single application layer.",
          ],
        },
        {
          id: "requirements",
          title: "Built Around Real Operational Requirements",
          label: "Real Requirements",
          paragraphs: [
            "Unlike a purely experimental application, GeoAttend is being developed in response to a real organization's operational needs.",
            "The project requires thinking about how administrators manage events, how members access relevant information, and how attendance can be verified consistently.",
            "It also involves designing authorization boundaries, protecting user data, and connecting multiple native applications to the same backend.",
            "The application remains under active development as its architecture and functionality continue to evolve.",
          ],
        },
        {
          id: "architecture",
          title: "Architecture",
          paragraphs: [
            "The system has three primary components: a native iOS application, a native Android application and a shared Firebase backend. Both apps are clients of the same backend. They share authentication, event and membership data and the same server-side attendance check, but each is written natively and they do not have identical feature sets.",
          ],
          items: [
            { label: "Native iOS application", value: "Swift, SwiftUI, Firebase Authentication, Cloud Firestore, Cloud Functions, foreground location access, App Check integration." },
            { label: "Native Android application", value: "Kotlin, Jetpack Compose, Material 3, Firebase Authentication, Cloud Firestore, Cloud Functions, Google Maps, Places SDK, Google Play Services Location." },
            { label: "Shared backend", value: "Firebase Authentication, Cloud Firestore, callable Cloud Functions, server-side authorization, Firestore security rules, transactional attendance records." },
          ],
        },
        {
          id: "verification",
          title: "Attendance Verification and Trust Boundary",
          label: "Verification",
          paragraphs: [
            "The backend validates attendance rather than trusting a client-side location decision. The app asks for the device's location and sends it to a callable function. The server decides whether the check-in is valid.",
          ],
          bulletsIntro: "Confirmed in the source:",
          bullets: [
            "Explicit foreground location requests",
            "Server-side distance calculation using the Haversine formula, checked against the event's radius",
            "Event attendance windows: check-in is rejected before the event starts and after it ends",
            "Authenticated identity, and role-based permissions (an approved member, or an administrator of that organization)",
            "Transactional check-in that creates the attendance record once, which prevents duplicate attendance",
            "Firestore security rules that stop clients from writing attendance records directly",
          ],
          note: "This describes a design that keeps the decision on the server. It does not make the system fraud-proof, and operational configuration is not shown here.",
        },
        {
          id: "admin",
          title: "Administrative Functionality",
          label: "Administration",
          items: [
            { label: "Event management", value: "Create, edit, publish, and review events." },
            { label: "Organization management", value: "Manage organization membership and access." },
            { label: "Attendance verification", value: "Verify event participation through server-side checks." },
            { label: "Member management", value: "Review membership requests and assign member titles where supported." },
            { label: "Reporting", value: "Review attendance information and export workbook reports." },
          ],
          note: "The two apps are not identical: the feature lists above describe the system as a whole, and individual screens can differ between iOS and Android.",
        },
        {
          id: "two-apps",
          title: "One System, Two Native Applications",
          label: "Two Native Apps",
          paragraphs: ["Building two separate native clients for one backend means keeping the same rules working in two codebases. The areas that needed attention:"],
          bullets: [
            "Consistent domain behavior across both apps",
            "Platform-specific UI implementation (SwiftUI and Jetpack Compose)",
            "Shared data contracts with the backend",
            "Consistent authentication",
            "Clear authorization boundaries",
            "Attendance verification managed by the server",
            "Platform-specific location APIs",
          ],
        },
        {
          id: "evolution",
          title: "Planned Architecture Evolution",
          label: "Planned Evolution",
          badges: ["Planned, not completed"],
          paragraphs: [
            "GeoAttend currently uses Firebase for authentication, data storage, and server-side operations.",
            "As the project evolves, I am planning a transition toward a dedicated backend and database architecture.",
            "This next stage will involve reconsidering how application data, business logic, authentication, and administrative operations are managed across both mobile platforms.",
            "The migration is planned and has not yet been completed.",
          ],
        },
      ],
    },
  },

  {
    projectId: "linemaster",
    // Written from the developer's statements, the iOS project's README and code, and the Android project's build files
    // (2026-10-27, see docs/LINEMASTER_CASE_STUDY.md). It is a playable prototype: no release, store listing, downloads,
    // revenue or reviews are claimed, and nothing is said about Android features beyond what the build files show.
    tagline:
      "An independently developed mobile arcade game featuring physics-based swinging, procedural environments, adaptive gameplay mechanics, daily challenges, and progression systems.",
    overview:
      "Swing. Release. Fly Further.\n\nLineMaster is a physics-based endless arcade game where players swing between glowing anchor points above a procedurally generated city.\n\nBuilt around one-finger controls, the game challenges players to master momentum, timing, and launch angles to travel as far as possible.\n\nThe experience combines rope physics, procedural environments, dynamic obstacles, progression systems, and neon-inspired visuals.\n\nI independently developed LineMaster for both iOS and Android, with the iOS version built using Swift, SwiftUI, and SpriteKit.",
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "SwiftUI", category: "mobile" },
      { name: "SpriteKit", category: "mobile" },
      { name: "AVFoundation", category: "mobile" },
      { name: "UserDefaults", category: "mobile" },
      { name: "Kotlin", category: "mobile" },
      { name: "libGDX", category: "mobile" },
      { name: "Game Physics" },
      { name: "Procedural Generation" },
    ],
    developmentStatus: "prototype",
    caseStudy: {
      summary: [
        { label: "Role", value: "Solo Game Developer & Creator" },
        { label: "Type", value: "Physics-Based Endless Arcade Game" },
        { label: "Platforms", value: "iOS and Android" },
        { label: "iOS", value: "Swift, SwiftUI, SpriteKit" },
        { label: "Android", value: "Kotlin, libGDX" },
        { label: "Status", value: "Playable Prototype" },
      ],
      sections: [
        {
          id: "role",
          title: "My Role",
          label: "My Role",
          // The developer's own account (2026-10-27), verbatim.
          paragraphs: [
            "LineMaster is a game I developed entirely on my own.",
            "I was responsible for the gameplay concept, implementation, physics mechanics, progression systems, visual presentation, and overall development of both the iOS and Android versions.",
            "For the iOS version, I used Swift and SpriteKit to build the real-time gameplay systems, including swinging physics, momentum-based movement, procedural environments, and interactive obstacles.",
            "I also implemented the game's progression systems, customization options, daily challenges, power-ups, and procedurally generated visual and audio effects.",
            "Developing LineMaster independently gave me the opportunity to explore game programming challenges that differ significantly from traditional mobile application development.",
          ],
        },
        {
          id: "gameplay",
          title: "One-Finger Physics Gameplay",
          label: "Gameplay",
          bulletsIntro: "A run follows this loop:",
          bullets: [
            "The player launches from an initial anchor.",
            "The player grabs glowing anchor points.",
            "A rope connects the player to the selected anchor.",
            "Gravity and momentum drive the swinging motion.",
            "The player releases at the desired moment.",
            "The character flies forward.",
            "The environment generates new content.",
            "The player continues until the run ends.",
          ],
          paragraphs: ["The game rewards timing and momentum control. Nothing is automatic: the player chooses when to attach and when to release."],
        },
        {
          id: "swing",
          title: "Engineering the Swing",
          label: "The Swing",
          paragraphs: [
            "LineMaster uses physics-based swinging mechanics. The documented iOS implementation includes rope attachment, gravity-driven movement, momentum preservation, tangential release, directional flick input, velocity adjustments and spin tracking.",
            "The game samples finger movement to work out the intended launch direction. It uses atan2 to calculate the release angle, then redirects the velocity along that angle while preserving the momentum-based speed.",
            "This is technically interesting because it connects player input, physics simulation, velocity calculations and real-time feedback in a single interaction.",
          ],
          note: "This is a game physics model tuned for feel, not a physically perfect simulation, and no performance benchmarks are claimed.",
        },
        {
          id: "launch",
          title: "A Different Kind of Start",
          label: "The Launch",
          paragraphs: [
            "At the start of a run, the character hangs from a boost anchor. Holding the screen rotates the character around the anchor, and the longer the player holds, the more momentum builds. Releasing launches the character along the current tangent.",
            "This makes the opening interactive: timing determines the initial trajectory.",
          ],
        },
        {
          id: "anchors",
          title: "Anchor Mechanics",
          label: "Anchors",
          items: [
            { label: "Normal anchors", value: "Standard swing and release behavior." },
            { label: "Boost anchors", value: "Higher launch velocity and enhanced visual feedback." },
            { label: "Fragile anchors", value: "Break after extended attachment or release, which adds a timing constraint." },
          ],
          paragraphs: ["Spin-to-Boost: in the documented iOS implementation, a full rotation around a normal anchor can upgrade it into a boost anchor. Together, the anchor types add variety to every run."],
        },
        {
          id: "city",
          title: "An Endless Procedural City",
          label: "Procedural City",
          paragraphs: ["The iOS game generates its environment dynamically, creating new content as the player moves forward."],
          bulletsIntro: "The documented systems include:",
          bullets: ["City buildings", "Anchor points", "Hazards", "Bonus stars", "Theme transitions", "Day/night atmosphere"],
          note: "The difficulty lies in coordinating world generation, player movement, camera behavior, hazard placement and gameplay progression at the same time. The generation is rule-based; it does not use machine learning.",
        },
        {
          id: "daynight",
          title: "A Living Game World",
          label: "Day / Night",
          paragraphs: [
            "The environment moves through night, sunrise, day and sunset, and the system also manages sun and moon visibility. In the documented iOS implementation, one full cycle takes 1,500 meters of distance.",
            "The cycle is calculated from distance rather than from a continuously accumulated timer, so the environment's state always follows from where the player is, including across gameplay transitions.",
          ],
        },
        {
          id: "themes",
          title: "Dynamic Visual Themes",
          label: "Themes",
          items: [{ label: "City" }, { label: "Neon" }, { label: "Night" }, { label: "Futuristic" }],
          paragraphs: [
            "By default, the theme changes with distance. Players can also unlock a theme and select it as fixed. Theme selection and day/night lighting are separate systems that combine.",
          ],
        },
        {
          id: "combo",
          title: "Rewarding Precision",
          label: "Combo",
          paragraphs: [
            "A combo mechanic is based on release angles. Releasing within a target window of about 30°–37° contributes to a multiplier that starts at 1.5× and can rise to 3.0×. It encourages players to learn precise launch timing.",
          ],
        },
        {
          id: "bonus",
          title: "Bonus Mode",
          label: "Bonus Mode",
          paragraphs: ["Catching a bonus star starts a temporary, faster-paced sequence. In the documented iOS version it lasts 500 meters."],
          bullets: ["Anchors behave as boost anchors.", "Hazards are temporarily disabled.", "Visual effects intensify."],
        },
        {
          id: "hazards",
          title: "Risk and Reaction",
          label: "Hazards",
          items: [
            { label: "Electric cables", value: "Dangerous barriers requiring avoidance." },
            { label: "Billboards", value: "Additional environmental obstacles." },
            { label: "Warning indicators", value: "Visual warnings appear before approaching hazards." },
            { label: "Fragile anchors", value: "Time-sensitive attachment points." },
          ],
          paragraphs: ["Together they demand awareness and quick decisions instead of simple repetition."],
        },
        {
          id: "progression",
          title: "Progress Beyond a Single Run",
          label: "Progression",
          bullets: ["Distance-based scoring", "Best-score tracking", "Diamonds", "Customization unlocks", "Daily challenges", "Power-ups"],
          note: "Progress is stored locally on the device with UserDefaults. There is no cloud synchronization and no multiplayer.",
        },
        {
          id: "powerups",
          title: "Power-Ups and Strategy",
          label: "Power-Ups",
          items: [
            { label: "Shield", value: "Protects against one supported hazard collision." },
            { label: "Slow-Mo", value: "Temporarily reduces gameplay speed." },
            { label: "2× Diamonds", value: "Increases diamond earnings after activation." },
            { label: "Rocket Dash", value: "Applies a forward velocity boost." },
            { label: "Instant Bonus", value: "Activates Bonus Mode." },
          ],
          paragraphs: ["The player arms one power-up before a run and activates it during the run with a double tap."],
        },
        {
          id: "daily",
          title: "Daily Challenges",
          label: "Daily Challenges",
          paragraphs: [
            "The game generates three daily challenges of Easy, Medium and Hard difficulty, with a chance that the hardest slot becomes an Epic challenge.",
            "The documented iOS implementation selects them deterministically: a seeded random number generator, seeded by the calendar day, gives the same set all day. Progress and rewards are tracked locally on the device.",
          ],
          note: "Daily challenges are not synchronized with a server.",
        },
        {
          id: "customization",
          title: "Player Customization",
          label: "Customization",
          items: [
            { label: "Ball skins", value: "30 skins." },
            { label: "Trails", value: "30 visual trail styles." },
            { label: "Themes", value: "Dynamic or fixed city themes." },
          ],
          paragraphs: ["Items are unlocked with in-game diamonds earned by playing."],
          note: "The rewarded-ad option is a placeholder. No real advertising is implemented and no advertising revenue is claimed.",
        },
        {
          id: "visuals",
          title: "Visuals Generated in Code",
          label: "Visuals",
          paragraphs: [
            "On iOS, most of the visual presentation is built from SpriteKit nodes and actions rather than prepared artwork: shape-based graphics, neon effects, particle-like feedback, dynamic backgrounds, animated interface elements and gameplay effects.",
            "The project's README states that the game uses no external image assets, but its current code also loads PNG images for character skins and interface icons. The page therefore says \"most\", not \"all\".",
          ],
          note: "No claim is made about how the Android version renders its graphics.",
        },
        {
          id: "audio",
          title: "Sound Design Through Code",
          label: "Audio",
          paragraphs: [
            "The iOS version includes 11 synthesized sound effects. The audio files are generated programmatically, bundled with the app and played with AVAudioPlayer. This is an engineering approach to sound rather than studio audio production, and the game uses no licensed music.",
          ],
        },
        {
          id: "architecture",
          title: "Game Architecture",
          label: "Architecture",
          paragraphs: ["The documented iOS architecture separates responsibilities, which keeps a complex real-time game organized."],
          items: [
            { label: "SwiftUI", value: "Hosts the game experience." },
            { label: "SpriteKit", value: "Handles the real-time scene, physics, camera and gameplay rendering." },
            { label: "GameScene", value: "Coordinates the active game experience." },
            { label: "Gameplay components", value: "Dedicated classes for the player, rope mechanics, anchors, procedural maps, hazards, bonus stars, themes and day/night cycles." },
            { label: "Progression managers", value: "Scoring, currency, customization, power-ups and daily challenges." },
            { label: "Support systems", value: "Game tuning, sound, haptics and physics categories." },
          ],
          note: "The Android version is organized differently and is not claimed to be identical.",
        },
        {
          id: "android",
          title: "Cross-Platform Development",
          label: "Android",
          paragraphs: [
            "I independently developed an Android version of LineMaster as well. Its project uses Kotlin and the libGDX game framework.",
            "No claim of feature parity between the two versions is made, and there is no store listing for either.",
          ],
        },
        {
          id: "learned",
          title: "What LineMaster Taught Me",
          label: "What I Learned",
          paragraphs: [
            "LineMaster gave me the opportunity to explore a different side of mobile development.",
            "Unlike a traditional application, a physics-based game requires constant interaction between player input, movement, timing, rendering, and feedback.",
            "Developing the game independently allowed me to work on gameplay mechanics, procedural systems, progression, visual effects, and the overall player experience.",
            "Building both iOS and Android versions also expanded the project beyond a single platform.",
            "LineMaster represents my interest in creating interactive software where technical implementation directly shapes how the experience feels.",
          ],
        },
        {
          id: "status",
          title: "Current Status",
          label: "Status",
          badges: ["Playable Prototype"],
          paragraphs: ["LineMaster is functional and playable, and it remains in development. It has not been released publicly."],
        },
      ],
    },
  },

  // ── GitHub-backed projects. Keys are numeric repository ids, so renames never break them. ──
  // Written from each repository's README, structure and source code; see data/project-content/analysis.ts
  // for the evidence behind every entry and docs/GITHUB_PROJECT_ANALYSIS.md for the full audit.
  {
    projectId: "github:1229286523", // AI_DJ
    displayName: "GestureDeck",
    tagline:
      "A prototype that lets someone control music with hand gestures in front of a webcam. It recognises hand poses in real time and turns them into DJ-style actions such as play, pause, track changes, short loops, volume and a filter effect.",
    overview:
      "GestureDeck explores whether a webcam can replace a DJ controller. The program watches the user's hands through the computer's camera and turns simple hand shapes and movements into commands for a playlist of audio files stored on the computer.\n\nIt runs locally and works only with the user's own music files: no streaming service or internet connection is involved.",
    features: [
      { id: "playback", title: "Playback by gesture", description: "An open palm toggles play and pause, and a two-handed swipe moves to the next or previous track." },
      { id: "loops", title: "Short loops", description: "Showing one or two fingers starts a half-second or one-second loop of the current moment in the track." },
      { id: "volume-filter", title: "Volume and filter control", description: "The height of the hands sets the volume, and a separate hand position controls a filter effect on the sound." },
      { id: "preview", title: "Live preview", description: "A camera window shows the detected hands, the current action and the track's waveform, and keyboard shortcuts offer a backup to the gestures." },
    ],
    technicalDetails: [
      {
        title: "How it works",
        body: "A hand-tracking library finds the landmarks of up to two hands in every camera frame. The program classifies each hand by how many fingers are extended and requires a gesture to be held briefly before it counts, which prevents accidental commands. Confirmed gestures are passed to an audio engine that plays the playlist and applies loops, volume and filtering.",
      },
    ],
    technologies: [
      { name: "Python" },
      { name: "OpenCV" },
      { name: "MediaPipe" },
      { name: "NumPy" },
      { name: "SciPy" },
      { name: "sounddevice" },
      { name: "SoundFile" },
    ],
    outcomes: [{ label: "Prototype", description: "An exploratory project. The repository's own notes describe it as a prototype and list further ideas as future work." }],
  },
  {
    projectId: "github:1178906645", // TaskFlow
    tagline:
      "A task management system built for a university course on distributed systems. Users register, log in and share tasks privately, publicly or with chosen colleagues, while separate services handle accounts, tasks, notifications and monitoring.",
    overview:
      "TaskFlow lets people keep track of tasks together. Each user has an account, and every task can be private, visible to everyone, or shared only with selected people. Tasks can be marked complete, given a progress level, or cancelled with a reason.\n\nThe project was built as a course assignment to show how a small system can be split into independent services that cooperate. It is a learning project rather than a production product.",
    features: [
      { id: "accounts", title: "Accounts and login", description: "Users register and log in with an email and password. Passwords are stored hashed and sessions use signed tokens.", icon: "lock" },
      { id: "visibility", title: "Private, public and shared tasks", description: "The creator decides who can see a task. Selected collaborators can update its status and progress, but only the creator can delete it.", icon: "users" },
      { id: "progress", title: "Progress tracking", description: "Tasks have a status and a progress percentage, and the dashboard shows task counts and a completion rate." },
      { id: "filters", title: "Filtering and search", description: "Tasks can be filtered by visibility and by creation date, and searched by title.", icon: "search" },
    ],
    technicalDetails: [
      {
        title: "Architecture",
        body: "A public API gateway forwards requests to an authentication service and a task service. When a task is created, the task service publishes an event through RabbitMQ, and a notification service receives it. At present that service only records the event in its log; it does not send emails or messages. Users and tasks are stored in SQLite files on Docker volumes.",
      },
      {
        title: "Operations and testing",
        body: "Every service reports its health and metrics, which Prometheus collects and Grafana displays. The gateway limits request rates and tags requests with a correlation id. The whole system starts with Docker Compose, and automated tests cover the authentication and task services.",
      },
    ],
    technologies: [
      { name: "JavaScript", category: "frontend" },
      { name: "HTML", category: "frontend" },
      { name: "CSS", category: "frontend" },
      { name: "Node.js", category: "backend" },
      { name: "Express", category: "backend" },
      { name: "JWT", category: "backend" },
      { name: "SQLite", category: "database" },
      { name: "RabbitMQ", category: "infrastructure" },
      { name: "Docker", category: "infrastructure" },
      { name: "Prometheus", category: "infrastructure" },
      { name: "Grafana", category: "infrastructure" },
      { name: "Jest", category: "tools" },
    ],
    outcomes: [{ label: "University team project", description: "Built by a team of four students for a distributed systems assignment. The repository does not say which parts each member wrote." }],
  },
  {
    projectId: "github:962026935", // InstaClone
    tagline:
      "An iPhone app modelled on Instagram. Users sign up, share photos with captions, like and comment on posts, edit their profile and exchange direct messages, with posts and chats stored in an online backend.",
    overview:
      "InstaClone recreates the core experience of a photo-sharing social network as a native iPhone app. People create an account, post pictures from their camera or photo library, browse a feed of posts, and talk to each other in private chats.\n\nIt appears to be a learning project: it follows an existing app's design rather than solving a new problem.",
    features: [
      { id: "accounts", title: "Sign-up and login", description: "Users create an account with an email and password and set up a profile." },
      { id: "posts", title: "Photo posts", description: "A photo from the camera or library is uploaded with a description and appears in a feed that updates as new posts arrive." },
      { id: "engagement", title: "Likes and comments", description: "Posts can be liked, and each post has its own comment thread." },
      { id: "messages", title: "Direct messages", description: "Users start a chat with another user and exchange messages." },
      { id: "profile", title: "Profile editing", description: "Users can update their profile details and picture." },
    ],
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "UIKit", category: "mobile" },
      { name: "Firebase Authentication", category: "backend" },
      { name: "Cloud Firestore", category: "database" },
      { name: "Firebase Storage", category: "backend" },
      { name: "SDWebImage", category: "mobile" },
    ],
    outcomes: [{ label: "Learning project", description: "A recreation of an existing app's features. The repository has no documentation or release information." }],
  },
  {
    projectId: "github:911678187", // MovieApp
    displayName: "Movie App",
    tagline:
      "An iPhone app for browsing movies. Users search for films by title, keep scrolling to load more results, and open a detail page with a poster and information for each movie, loaded from the OMDb online movie database.",
    overview:
      "Movie App is a movie browser. The home screen lists films and a search bar narrows them down by title. Choosing a film opens a page with its poster, description, cast and other details.\n\nThe film information is not stored in the app: it is requested from the public OMDb database whenever it is needed.",
    features: [
      { id: "search", title: "Search by title", description: "Results update as the user types in the search bar.", icon: "search" },
      { id: "paging", title: "Continuous loading", description: "More results are fetched as the user scrolls to the end of the list." },
      { id: "details", title: "Movie details", description: "A detail page shows the poster, description, cast and further information for the selected film." },
    ],
    technicalDetails: [
      { title: "Structure", body: "The project is organised with the Model-View-ViewModel pattern, separating the screens from the code that loads and prepares movie data. Network requests are made with Alamofire and decoded into Swift models, and the lists shown on screen are updated through RxSwift." },
    ],
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "UIKit", category: "mobile" },
      { name: "Alamofire", category: "mobile" },
      { name: "RxSwift", category: "mobile" },
      { name: "OMDb API", category: "backend" },
      { name: "CocoaPods", category: "tools" },
    ],
    outcomes: [{ label: "Learning project", description: "A small app built to practise networking and the MVVM pattern in iOS." }],
  },
  {
    projectId: "github:911681469", // Contact-App
    displayName: "Contact App",
    tagline:
      "A simple iPhone contact book. Users add people with a name, surname, phone number and gender, edit existing entries and delete them after a confirmation. Contacts are kept in memory while the app is open.",
    overview:
      "Contact App is a basic address book. The main screen lists the saved contacts, or shows a short message when the list is empty. A second screen is used to add a new contact or edit an existing one, and incomplete forms are rejected with a prompt.\n\nContacts are held in memory only, so the list starts empty each time the app is launched.",
    features: [
      { id: "add-edit", title: "Add and edit contacts", description: "A form collects the name, surname, phone number and gender, and checks that no field is left empty." },
      { id: "delete", title: "Delete with confirmation", description: "Swiping a contact asks for confirmation before it is removed.", icon: "trash-2" },
    ],
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "UIKit", category: "mobile" },
    ],
    outcomes: [{ label: "Learning project", description: "A small exercise in building list and form screens with UIKit." }],
  },
  {
    projectId: "github:911682415", // Tech-Category-App
    displayName: "Tech Category App",
    tagline:
      "A small iPhone product catalogue for technology items. Users browse four categories (computers, phones, watches and headphones) and open a product to see its photo, price, any previous price and a detailed description.",
    overview:
      "Tech Category App presents a simple shop-style catalogue. The first screen lists the product categories, each category lists its products, and each product has a detail page with an image, the current price, a crossed-out previous price when there is one, and a written description.\n\nThe catalogue is built into the app, with twelve sample products and no connection to a server or a shop.",
    features: [
      { id: "categories", title: "Category browsing", description: "Products are grouped into computers, phones, watches and headphones." },
      { id: "detail", title: "Product pages", description: "Each product shows its image, price, a struck-through old price where one exists, and a description." },
    ],
    technologies: [
      { name: "Swift", category: "mobile" },
      { name: "UIKit", category: "mobile" },
    ],
    outcomes: [{ label: "Learning project", description: "A small exercise in navigation between list and detail screens." }],
  },
  {
    projectId: "github:739096794", // Math-Exam
    displayName: "Math Exam",
    tagline:
      "An Android app with four math practice modes: arithmetic quizzes, powers, factorials and a quadratic-equation solver. The quiz modes ask randomly generated questions and keep a score.",
    overview:
      "Math Exam is a practice tool for basic mathematics. A start screen links to four activities. Three of them quiz the user with randomly generated questions about arithmetic, powers and factorials, while the fourth takes the three numbers of a quadratic equation and calculates its roots.\n\nThe app interface is in Turkish.",
    features: [
      { id: "arithmetic", title: "Arithmetic quiz", description: "Random addition, subtraction, multiplication and division questions." },
      { id: "powers-factorials", title: "Powers and factorials", description: "Quiz rounds on exponents and on factorial expressions." },
      { id: "roots", title: "Quadratic equation solver", description: "Enter the three coefficients to get the equation's roots, or a message when it has none." },
    ],
    technologies: [
      { name: "Java", category: "mobile" },
      { name: "Android", category: "mobile" },
      { name: "Gradle", category: "tools" },
    ],
    outcomes: [{ label: "Learning project", description: "A small Android app built with Android Studio. A packaged release build is included in the repository." }],
  },
  {
    projectId: "github:739478338", // Number-Guess
    displayName: "Number Guess",
    tagline:
      "A number-guessing game for Android. The player has five attempts to find a hidden number between 1 and 50, gets 'go up' or 'go down' hints, and loses points for every wrong guess.",
    overview:
      "Number Guess is a one-screen game. The app picks a random number from 1 to 50, and the player types guesses. After each wrong guess it says whether to go higher or lower and reduces the score, which starts at 100. When the player guesses correctly, the final score is shown, and after five attempts the game ends and reveals the number.",
    technologies: [
      { name: "Java", category: "mobile" },
      { name: "Android", category: "mobile" },
      { name: "Gradle", category: "tools" },
    ],
    outcomes: [{ label: "Learning project", description: "A first Android game exercise. A packaged release build is included in the repository." }],
  },
  {
    projectId: "github:998793837", // ImageProcessing
    displayName: "Image Processing Final Project",
    tagline:
      "A university image-processing assignment with six problems solved in Python. A notebook applies techniques such as grayscale conversion, intensity transformations, blurring, noise filtering, sharpening and contrast enhancement to sample images.",
    overview:
      "This repository holds the final project for an image-processing course (UYG332). It consists of a Jupyter notebook that works through six problems, together with the sample images the exercises use.\n\nThe notebook shows how common operations change an image, such as smoothing out noise, sharpening detail and improving contrast.",
    technologies: [
      { name: "Python" },
      { name: "OpenCV" },
      { name: "NumPy" },
      { name: "Matplotlib" },
      { name: "Jupyter Notebook", category: "tools" },
    ],
    outcomes: [{ label: "University course project", description: "Submitted as the final project of an image-processing course." }],
  },
  {
    projectId: "github:1432054028", // portfolio
    displayName: "CV Website",
    tagline:
      "A personal CV website published on GitHub Pages. It presents a short biography, experience, education, skills and contact links, and was created from a workshop template that builds the site with AI-assisted tooling.",
    overview:
      "This repository contains a one-page personal website for professional introductions. Its content, such as the biography, work experience, education and skills, is kept in a single data file and shown on a published page.\n\nThe repository started from a workshop template, so much of it is the template's own tooling and tests rather than custom code.",
    technologies: [
      { name: "HTML", category: "frontend" },
      { name: "JavaScript" },
      { name: "GitHub Pages", category: "infrastructure" },
    ],
    outcomes: [{ label: "Template-based project", description: "Created from a workshop template (a copy of an existing template repository), then filled with personal content." }],
  },
  {
    projectId: "github:1264257996", // SmartHat
    displayName: "SmartHat",
    tagline: "A repository created for a project called SmartHat. It does not contain any files yet, so there is no code or documentation to describe.",
    outcomes: [{ label: "No implementation yet", description: "The repository is empty." }],
  },
  {
    projectId: "github:601302440", // Programlamaya-Giris (fork)
    displayName: "Programlamaya Giriş (fork)",
    tagline:
      "A fork of an open-source Turkish collection of introductory programming exercises and solutions, such as printing text and dates and calculating factorials, written in many languages. The material comes from the original project.",
    overview:
      "This is a copy of another developer's open-source repository, which gathers beginner exercises like \"Hello World\", date printing, factorials and polynomial roots, each solved in languages such as C, C++, C#, Java, JavaScript, PHP, Python, Ruby, Shell and Swift.\n\nThe code belongs to the original project and its contributors. No changes by this account are visible in the repository.",
    outcomes: [{ label: "Fork of another project", description: "Original repository: BilgisayarKavramlari/Programlamaya-Giris." }],
  },
];
