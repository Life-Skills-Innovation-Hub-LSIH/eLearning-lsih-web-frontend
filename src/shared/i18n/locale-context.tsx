"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "km" | "en";

type Dictionary = Record<string, { km: string; en: string }>;

const dict: Dictionary = {
  "nav.explore": { km: "ស្វែងរក", en: "Explore" },
  "nav.myCourses": { km: "វគ្គសិក្សារខ្ញុំ", en: "My courses" },
  "nav.login": { km: "ចូលគណនី", en: "Log in" },
  "nav.joinFree": { km: "រៀនឥតគិតថ្លៃ", en: "Start learning free" },
  "nav.logout": { km: "ចាកចេញ", en: "Log out" },
  "nav.help": { km: "ជំនួយ", en: "Help" },
  "nav.viewAllCourses": { km: "មើលវគ្គសិក្សាទាំងអស់ →", en: "View all courses →" },
  "search.placeholder": { km: "តើអ្នកចង់រៀនអ្វី?", en: "What do you want to learn?" },
  "hero.tagline": {
    km: "រៀនសម្រាប់សាលា។ លូតលាស់សម្រាប់ជីវិត។",
    en: "Learn for School. Grow for Life.",
  },
  "hero.subtitle": {
    km: "វគ្គសិក្សាជាក់ស្តែងសម្រាប់ថ្នាក់ទី១២ បំណិនជីវិត ភាពជាអ្នកដឹកនាំ និងត្រៀមចូលធ្វើការ។",
    en: "Practical courses for Grade 12 readiness, life skills, leadership, and job readiness.",
  },
  "hero.ctaStart": { km: "ចាប់ផ្តើមរៀនឥតគិតថ្លៃ", en: "Start learning free" },
  "hero.ctaGrade12": { km: "មើលវគ្គថ្នាក់ទី១២", en: "Browse Grade 12 courses" },
  "paths.title": { km: "ផ្លូវសិក្សាពេញនិយម", en: "Popular learning tracks" },
  "paths.subtitle": {
    km: "ការត្រៀមខ្លួនសម្រាប់ថ្នាក់ទី១២ · បំណិនជីវិត · ភាពជាអ្នកដឹកនាំ · ការត្រៀមខ្លួនចូលធ្វើការ",
    en: "Grade 12 Readiness · Life Skills · Leadership · Job Ready",
  },
  "paths.viewAll": { km: "មើលវគ្គទាំងអស់ →", en: "View all courses →" },
  "paths.grade12.sub": { km: "ការត្រៀមខ្លួនសម្រាប់ថ្នាក់ទី១២", en: "Grade 12 Readiness" },
  "paths.grade12.text": {
    km: "ការត្រៀមប្រឡងថ្នាក់ជាតិ · ការជ្រើសរើសជំនាញសាកលវិទ្យាល័យ · អាហារូបករណ៍ · ជីវិតនិស្សិត។",
    en: "National Exam Prep · University Major Selection · Scholarship & Admissions · Higher Education Transition.",
  },
  "paths.life.sub": { km: "បំណិនជីវិត", en: "Life Skills" },
  "paths.life.text": {
    km: "ចំណេះដឹងហិរញ្ញវត្ថុ · ការគិតបែបស៊ីជម្រៅ · ចំណេះដឹងឌីជីថល · សុខុមាលភាព។",
    en: "Financial Literacy · Critical Thinking · Digital Citizenship · Personal Well-being.",
  },
  "paths.lead.sub": { km: "ភាពជាអ្នកដឹកនាំ", en: "Leadership" },
  "paths.lead.text": {
    km: "ការនិយាយជាសាធារណៈ · សាមគ្គីភាព · គ្រប់គ្រងគម្រោង · ការគិតបែបយុទ្ធសាស្ត្រ។",
    en: "Public Speaking · Team Dynamics · Project Management · Strategic Thinking.",
  },
  "paths.job.sub": { km: "ការត្រៀមខ្លួនចូលធ្វើការ", en: "Job Ready" },
  "paths.job.text": {
    km: "ម៉ាកសញ្ញាផ្ទាល់ខ្លួន · សម្ភាសន៍ការងារ · ឧបករណ៍ឌីជីថល · ក្រមសីលធម៌ការងារ។",
    en: "Professional Branding · Interview Mastery · Workplace Productivity Tools · Workplace Etiquette.",
  },
  "catalog.title": { km: "រុករកវគ្គសិក្សា", en: "Explore courses" },
  "catalog.track": { km: "ផ្លូវសិក្សា", en: "Learning track" },
  "catalog.subtitle": {
    km: "រៀនតាមផ្លូវថ្នាក់ទី១២ · បំណិនជីវិត · ភាពជាអ្នកដឹកនាំ · ត្រៀមចូលធ្វើការ។",
    en: "Advance with practical courses across Grade 12, life skills, leadership, and job readiness.",
  },
  "catalog.all": { km: "ទាំងអស់", en: "All" },
  "catalog.level": { km: "កម្រិត", en: "Level" },
  "catalog.levelAll": { km: "គ្រប់កម្រិត", en: "All levels" },
  "catalog.levelBeginner": { km: "ដំបូង", en: "Beginner" },
  "catalog.levelIntermediate": { km: "មធ្យម", en: "Intermediate" },
  "catalog.levelAdvanced": { km: "ខ្ពស់", en: "Advanced" },
  "catalog.duration": { km: "រយៈពេល", en: "Duration" },
  "catalog.durationAll": { km: "គ្រប់រយៈពេល", en: "Any duration" },
  "catalog.durationShort": { km: "ក្រោម ១ ម៉ោង", en: "Under 1 hour" },
  "catalog.durationMedium": { km: "១–៣ ម៉ោង", en: "1–3 hours" },
  "catalog.durationLong": { km: "លើស ៣ ម៉ោង", en: "3+ hours" },
  "catalog.home": { km: "ទំព័រដើម", en: "Home" },
  "catalog.search": { km: "ស្វែងរក", en: "Search" },
  "catalog.searchPlaceholder": {
    km: "ស្វែងរកវគ្គសិក្សា…",
    en: "What do you want to learn?",
  },
  "catalog.ifYouLike": { km: "បើអ្នកចូលចិត្ត", en: "If you like" },
  "catalog.credentials": { km: "បង្រៀនដោយ", en: "Credentials" },
  "catalog.noCourses": { km: "រកមិនឃើញវគ្គ", en: "No courses found" },
  "catalog.noCoursesHint": {
    km: "សាកស្វែងរកផ្សេង ឬសម្អាតតម្រង។",
    en: "Try another search or clear the filters.",
  },
  "catalog.clearFilters": { km: "សម្អាតតម្រង", en: "Clear filters" },
  "catalog.view": { km: "មើល", en: "View" },
  "catalog.clearAll": { km: "សម្អាត", en: "Clear All" },
  "catalog.loading": { km: "កំពុងផ្ទុកវគ្គ…", en: "Loading courses…" },
  "catalog.loadingMore": { km: "កំពុងផ្ទុកបន្ថែម…", en: "Loading more…" },
  "catalog.levelBeginnerHint": {
    km: "សម្រាប់អ្នកទើបចាប់ផ្តើម គ្មានបទពិសោធន៍ជាមុន។",
    en: "For learners just getting started.",
  },
  "catalog.levelIntermediateHint": {
    km: "សម្រាប់អ្នកដែលមានមូលដ្ឋានខ្លះហើយ។",
    en: "For learners who already know the basics.",
  },
  "catalog.levelAdvancedHint": {
    km: "សម្រាប់អ្នកដែលចង់រៀនកាន់តែស៊ីជម្រៅ។",
    en: "For learners ready to go deeper.",
  },
  "catalog.durationShortHint": {
    km: "វគ្គខ្លី ក្រោម ១ ម៉ោង។",
    en: "Short courses under 1 hour.",
  },
  "catalog.durationMediumHint": {
    km: "វគ្គមធ្យម ១ ទៅ ៣ ម៉ោង។",
    en: "Courses between 1 and 3 hours.",
  },
  "catalog.durationLongHint": {
    km: "វគ្គវែង លើស ៣ ម៉ោង។",
    en: "Longer courses over 3 hours.",
  },
  "catalog.trackGrade12": { km: "ការត្រៀមខ្លួនសម្រាប់ថ្នាក់ទី១២", en: "Grade 12 Readiness" },
  "catalog.trackLife": { km: "បំណិនជីវិត", en: "Life Skills" },
  "catalog.trackLead": { km: "ភាពជាអ្នកដឹកនាំ", en: "Leadership" },
  "catalog.trackJob": { km: "ការត្រៀមខ្លួនចូលធ្វើការ", en: "Job Ready" },
  "onboarding.eyebrow": { km: "ស្វាគមន៍មកកាន់ LSIH", en: "Welcome to LSIH" },
  "onboarding.title": { km: "តើអ្នកកំពុងស្វែងរកអ្វី?", en: "What are you looking for?" },
  "onboarding.subtitle": {
    km: "ជ្រើសមួយ ដើម្បីឲ្យយើងណែនាំផ្លូវសិក្សា និងវគ្គសមស្រប។",
    en: "Pick one so we can recommend the right learning track and courses.",
  },
  "onboarding.grade12": {
    km: "ខ្ញុំកំពុងត្រៀមខ្លួនសម្រាប់ថ្នាក់ទី១២",
    en: "I’m preparing for Grade 12",
  },
  "onboarding.leadership": {
    km: "ខ្ញុំចង់ពង្រឹងភាពជាអ្នកដឹកនាំ",
    en: "I want to improve my leadership",
  },
  "onboarding.job": {
    km: "ខ្ញុំត្រូវការត្រៀមខ្លួនចូលធ្វើការ",
    en: "I need job readiness skills",
  },
  "onboarding.life": {
    km: "ខ្ញុំចង់រៀនបំណិនជីវិត",
    en: "I want to learn life skills",
  },
  "onboarding.continue": { km: "បន្តមើលវគ្គសិក្សា", en: "Continue to courses" },
  "onboarding.skip": { km: "រំលងសម្រាប់ពេលនេះ", en: "Skip for now" },

  "auth.loginWelcomeTitle": { km: "សូមស្វាគមន៍", en: "Welcome back" },
  "auth.loginWelcomeSubtitle": { km: "រីករាយដែលបានជួបម្តងទៀត", en: "Nice to see you again" },
  "auth.loginTitle": { km: "ចូលគណនី", en: "Login Account" },
  "auth.loginSubtitle": {
    km: "ចូលដោយឈ្មោះអ្នកប្រើ ឬអ៊ីមែល ដើម្បីបន្តរៀន។",
    en: "Sign in with your username or email to continue learning.",
  },
  "auth.usernameEmail": { km: "ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល", en: "Username or email" },
  "auth.usernameEmailPlaceholder": {
    km: "ឈ្មោះអ្នកប្រើ ឬអ៊ីមែល",
    en: "username or email",
  },
  "auth.password": { km: "ពាក្យសម្ងាត់", en: "Password" },
  "auth.login": { km: "ចូល", en: "Log in" },
  "auth.loggingIn": { km: "កំពុងចូល…", en: "Logging in…" },
  "auth.noAccount": { km: "មិនទាន់មានគណនី?", en: "Don't have an account?" },
  "auth.registerLink": { km: "ចុះឈ្មោះ", en: "Register" },
  "auth.registerTitle": { km: "បង្កើតគណនី", en: "Create account" },
  "auth.registerSubtitle": {
    km: "ចុះឈ្មោះជាសិស្ស ដើម្បីមើលវគ្គ និងចាប់ផ្តើមរៀន។",
    en: "Register as a student to browse courses and start learning.",
  },
  "auth.welcomeSubtitle": { km: "ចូលរួម LSIH", en: "Join LSIH" },
  "auth.welcomeTitle": { km: "ចាប់ផ្តើម", en: "Get started" },
  "auth.firstName": { km: "នាមខ្លួន", en: "First name" },
  "auth.lastName": { km: "នាមត្រកូល", en: "Last name" },
  "auth.username": { km: "ឈ្មោះអ្នកប្រើ", en: "Username" },
  "auth.confirmPassword": { km: "បញ្ជាក់ពាក្យសម្ងាត់", en: "Confirm password" },
  "auth.register": { km: "ចុះឈ្មោះ", en: "Register" },
  "auth.registering": { km: "កំពុងបង្កើតគណនី…", en: "Creating account…" },
  "auth.haveAccount": { km: "មានគណនីរួចហើយ?", en: "Already have an account?" },
  "auth.passwordMismatch": {
    km: "ពាក្យសម្ងាត់ និងការបញ្ជាក់មិនត្រូវគ្នា។",
    en: "Password and confirm password do not match.",
  },

  "course.notFound": { km: "រកមិនឃើញវគ្គ", en: "Course not found" },
  "course.unavailable": {
    km: "វគ្គនេះមិនមានទេ។",
    en: "This course is unavailable.",
  },
  "course.backCatalog": { km: "ត្រឡប់ទៅបញ្ជីវគ្គ", en: "Back to catalog" },
  "course.courses": { km: "វគ្គសិក្សា", en: "Courses" },
  "course.noDescription": { km: "មិនទាន់មានពិពណ៌នា។", en: "No description yet." },
  "course.instructorTba": { km: "គ្រូបង្រៀន TBA", en: "Instructor TBA" },
  "course.modulesLessons": {
    km: "{modules} ម៉ូឌុល · {lessons} មេរៀន",
    en: "{modules} modules · {lessons} lessons",
  },
  "course.accessSubscription": {
    km: "ចូលរៀនជាមួយការជាវ",
    en: "Access with subscription",
  },
  "course.included": { km: "រួមបញ្ចូល", en: "Included" },
  "course.learningModules": { km: "{n} ម៉ូឌុលសិក្សា", en: "{n} learning modules" },
  "course.videoPdfLessons": {
    km: "{n} មេរៀនវីដេអូ / PDF",
    en: "{n} video / PDF lessons",
  },
  "course.quizzesToPass": { km: "{n} សំណួរសាកល្បង", en: "{n} quizzes to pass" },
  "course.certificate": {
    km: "វិញ្ញាបនបត្រនៅពេលបញ្ចប់",
    en: "Certificate when you finish",
  },
  "course.needAccess": {
    km: "ត្រូវការចូលរៀន? ទាក់ទងអ្នកគ្រប់គ្រងបន្ទាប់ពីចុះឈ្មោះ។",
    en: "Need access? Contact admin after you register.",
  },
  "course.curriculum": { km: "កម្មវិធីសិក្សា", en: "Curriculum" },
  "course.curriculumHint": {
    km: "រៀនតាមម៉ូឌុល។ បំពេញមេរៀន រួចប្រឡងឲ្យជាប់។",
    en: "Follow modules in order. Complete lessons, then pass each quiz.",
  },
  "course.noModules": {
    km: "មិនទាន់មានម៉ូឌុលផ្សាយ។",
    en: "No published modules yet.",
  },
  "course.moduleLabel": { km: "ម៉ូឌុល {n}", en: "Module {n}" },
  "course.quizLabel": { km: "សំណួរ — {title}", en: "Quiz — {title}" },
  "course.passScore": { km: "ពិន្ទុជាប់ {n}%", en: "Pass score {n}%" },
  "course.loading": { km: "កំពុងផ្ទុកវគ្គ…", en: "Loading course…" },
  "course.durationHours": { km: "{n} ម៉ោង", en: "{n} hours" },
  "course.durationMinutes": { km: "{n} នាទី", en: "{n} min" },
  "course.approxDuration": { km: "ប្រហែល {n}", en: "Approx. {n}" },
  "course.totalTime": { km: "រយៈពេលសរុបនៃវគ្គ", en: "Total course time" },
  "course.free": { km: "ឥតគិតថ្លៃ", en: "Free" },
  "course.tabAbout": { km: "អំពីវគ្គ", en: "About" },
  "course.tabOutcomes": { km: "លទ្ធផល", en: "Outcomes" },
  "course.tabCourses": { km: "ម៉ូឌុល", en: "Courses" },
  "course.tabTestimonials": { km: "មតិសិស្ស", en: "Testimonials" },
  "course.tabReviews": { km: "ការវាយតម្លៃ", en: "Reviews" },
  "course.enrollFree": { km: "ចុះឈ្មោះឥតគិតថ្លៃ", en: "Enroll for free" },
  "course.enrollSub": { km: "ចាប់ផ្តើមរៀនឥតគិតថ្លៃ", en: "Start learning free" },
  "course.loginEnroll": { km: "ចូលដើម្បីចុះឈ្មោះ", en: "Log in to enroll" },
  "course.instructors": { km: "គ្រូបង្រៀន៖", en: "Instructors:" },
  "course.whatYouLearn": { km: "អ្វីដែលអ្នកនឹងរៀន", en: "What you'll learn" },
  "course.skillsGain": { km: "ជំនាញដែលអ្នកនឹងទទួលបាន", en: "Skills you'll gain" },
  "course.toolsLearn": { km: "ឧបករណ៍ដែលអ្នកនឹងរៀន", en: "Tools you'll learn" },
  "course.detailsKnow": { km: "ព័ត៌មានសំខាន់", en: "Details to know" },
  "course.shareableCert": { km: "វិញ្ញាបនបត្រអាចចែករំលែក", en: "Shareable certificate" },
  "course.shareableCertHint": {
    km: "បន្ថែមទៅប្រវត្តិរូប LinkedIn ឬ CV បន្ទាប់ពីបញ្ចប់។",
    en: "Add this credential to your LinkedIn profile or CV when you finish.",
  },
  "course.flexible": { km: "កាលវិភាគបត់បែន", en: "Flexible schedule" },
  "course.flexibleHint": {
    km: "រៀនតាមល្បឿនផ្ទាល់ខ្លួន។",
    en: "Learn at your own pace.",
  },
  "course.moduleSeries": { km: "{n} ម៉ូឌុល", en: "{n} module series" },
  "course.moduleSeriesHint": {
    km: "ទទួលវិញ្ញាបនបត្រដែលបង្ហាញជំនាញរបស់អ្នក។",
    en: "Earn a credential that demonstrates your expertise.",
  },
  "course.levelHint": { km: "កម្រិតដែលបានណែនាំ", en: "Recommended experience" },
  "course.statModules": { km: "ម៉ូឌុលសិក្សា", en: "Learning modules" },
  "course.statEnrolled": { km: "សិស្សបានចុះឈ្មោះ", en: "Enrolled learners" },
  "course.statReviews": {
    km: "ពី {n} ការវាយតម្លៃនៃវគ្គនេះ",
    en: "from {n} reviews of this course",
  },
  "course.partnersTitle": {
    km: "រៀនជំនាញដែលទីផ្សារការងារត្រូវការ",
    en: "Advance your career with in-demand skills",
  },
  "course.whyChoose": {
    km: "ហេតុអ្វីមនុស្សជ្រើស LSIH",
    en: "Why people choose LSIH for their career",
  },
  "course.earnCert": { km: "ទទួលវិញ្ញាបនបត្រ", en: "Earn a career certificate" },
  "course.earnCertHint": {
    km: "បន្ថែមវិញ្ញាបនបត្រទៅប្រវត្តិរូប បន្ទាប់ពីបញ្ចប់វគ្គនេះ។",
    en: "Add this credential to your LinkedIn profile, resume, or CV after you finish.",
  },
  "course.courseDetails": { km: "ព័ត៌មានម៉ូឌុល", en: "Course details" },
  "course.offeredBy": { km: "ផ្តល់ដោយ", en: "Offered by" },
  "course.showAll": { km: "មើលទាំងអស់", en: "Show all" },
  "course.lessonsCount": { km: "{n} មេរៀន", en: "{n} lessons" },
  "course.hoursWeek": { km: "{n} ម៉ោង", en: "{n} hours" },

  "reviews.title": { km: "មតិ និងវាយតម្លៃ", en: "Reviews & ratings" },
  "reviews.noRatings": { km: "មិនទាន់មានការវាយតម្លៃ", en: "No ratings yet" },
  "reviews.writeYours": { km: "សរសេរមតិរបស់អ្នក", en: "Write your review" },
  "reviews.updateYours": { km: "កែមតិរបស់អ្នក", en: "Update your review" },
  "reviews.commentPlaceholder": {
    km: "ចែករំលែកបទពិសោធន៍របស់អ្នក (ស្រេចចិត្ត)",
    en: "Share your experience (optional)",
  },
  "reviews.submit": { km: "បញ្ជូនមតិ", en: "Submit review" },
  "reviews.saving": { km: "កំពុងរក្សាទុក…", en: "Saving…" },
  "reviews.delete": { km: "លុបមតិ", en: "Delete review" },
  "reviews.empty": { km: "មិនទាន់មានមតិ។", en: "No reviews yet." },
  "reviews.loginRequired": {
    km: "សូមចូលគណនីដើម្បីសរសេរមតិ។",
    en: "Log in to leave a review.",
  },
  "reviews.enrollFirst": {
    km: "ចុះឈ្មោះរៀនវគ្គនេះជាមុន ទើបអាចវាយតម្លៃ។",
    en: "Enroll in this course first to leave a review.",
  },
  "reviews.saveFailed": { km: "រក្សាទុកមតិមិនបាន។", en: "Could not save review." },

  "help.badge": { km: "មជ្ឈមណ្ឌលជំនួយ", en: "Help center" },
  "help.title": { km: "ជំនួយអំពីវេទិកា LSIH", en: "Help with the LSIH platform" },
  "help.subtitle": {
    km: "រកចម្លើយអំពីរបៀបប្រើ Life Skills Innovation Hub — ចុះឈ្មោះ រៀនវគ្គ ប្រឡង និងទទួលវិញ្ញាបនបត្រ។",
    en: "Find answers about using Life Skills Innovation Hub — sign up, learn, take quizzes, and earn certificates.",
  },
  "help.s1.title": { km: "តើ Life Skills Innovation Hub ជាអ្វី?", en: "What is Life Skills Innovation Hub?" },
  "help.s1.body": {
    km: "Life Skills Innovation Hub (LSIH) គឺជាវេទិកាសិក្សាអនឡាញដែលជួយអ្នកសិក្សានៅកម្ពុជារៀនជំនាញជាក់ស្តែង តាមរយៈវគ្គសិក្សាមានរចនាសម្ព័ន្ធ — ម៉ូឌុល មេរៀន (វីដេអូ/PDF) សំណួរសាកល្បង និងវិញ្ញាបនបត្រនៅពេលបញ្ចប់។",
    en: "Life Skills Innovation Hub (LSIH) is an online learning platform that helps Cambodian learners build practical skills through structured courses — modules, lessons (video/PDF), quizzes, and a certificate when you finish.",
  },
  "help.s2.title": { km: "ចុះឈ្មោះ និងចូលគណនី", en: "Sign up and log in" },
  "help.s2.body": {
    km: "អ្នកអាចចុះឈ្មោះជាសិស្សដោយចុច «រៀនឥតគិតថ្លៃ» ឬ «ចុះឈ្មោះ»។ បន្ទាប់ពីមានគណនី ចូលតាម «ចូលគណនី» ដើម្បីមើលវគ្គសិក្សា រៀន និងតាមដានវឌ្ឍនភាព។",
    en: "Register as a student via “Start learning free” or “Register”. After you have an account, use “Log in” to browse courses, learn, and track progress.",
  },
  "help.s3.title": { km: "រក និងចុះឈ្មោះវគ្គសិក្សា", en: "Find and enroll in courses" },
  "help.s3.body": {
    km: "ប្រើ «ស្វែងរក» ឬរបារស្វែងរក «តើអ្នកចង់រៀនអ្វី?» ដើម្បីរកវគ្គ។ បើកទំព័រវគ្គដើម្បីមើលព័ត៌មាន ម៉ូឌុល និងចុះឈ្មោះរៀន។ វគ្គមួយចំនួនត្រូវការការជាវ ដែលអ្នកគ្រប់គ្រងអាចបើកឲ្យអ្នក។",
    en: "Use Explore or the “What do you want to learn?” search to find courses. Open a course page to see details, modules, and enroll. Some courses need a subscription that an admin can enable for you.",
  },
  "help.s4.title": { km: "របៀបរៀនលើវេទិកា", en: "How learning works" },
  "help.s4.body": {
    km: "វគ្គនីមួយៗមានម៉ូឌុល។ ក្នុងម៉ូឌុលមានមេរៀន (វីដេអូ ឬ PDF) និងសំណួរសាកល្បង។ រៀនតាមលំដាប់ បំពេញមេរៀន រួចប្រឡងឲ្យជាប់។ នៅពេលបញ្ចប់វគ្គ អ្នកអាចទទួលវិញ្ញាបនបត្រ។",
    en: "Each course has modules. Inside a module you will find lessons (video or PDF) and quizzes. Learn in order, complete lessons, then pass the quizzes. When you finish the course, you can earn a certificate.",
  },
  "help.s5.title": { km: "វគ្គសិក្សារបស់ខ្ញុំ និងគណនី", en: "My courses and account" },
  "help.s5.body": {
    km: "បន្ទាប់ពីចូលគណនី ចុច «វគ្គសិក្សារខ្ញុំ» ដើម្បីមើលវគ្គដែលអ្នកកំពុងរៀន។ អាចកែព័ត៌មានគណនីតាមម៉ឺនុយប្រវត្តិរូប (រូបតំណាង) នៅជ្រុងខាងស្តាំនៃបឋមកថា។",
    en: "After you log in, open “My courses” to see what you are learning. You can edit your account from the profile menu (avatar) on the right side of the header.",
  },
  "help.s6.title": { km: "ត្រូវការជំនួយបន្ថែម?", en: "Need more help?" },
  "help.s6.body": {
    km: "ប្រសិនបើមានសំណួរអំពីការជាវ គណនី ឬវគ្គសិក្សា សូមទាក់ទងក្រុម LSIH តាមទំព័រទំនាក់ទំនង ឬអ៊ីមែល lifeskillsinnovationhub@lsih.com។",
    en: "If you have questions about subscriptions, accounts, or courses, contact the LSIH team via the contact page or email lifeskillsinnovationhub@lsih.com.",
  },
  "help.contact": { km: "ទាក់ទងយើង", en: "Contact us" },
  "help.viewCourses": { km: "មើលវគ្គសិក្សា", en: "Browse courses" },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof dict) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "lsih-locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("km");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "km" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "km" ? "en" : "km");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: keyof typeof dict) => dict[key]?.[locale] ?? String(key),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
