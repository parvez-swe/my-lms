// data/courses.ts

export interface Course {
  slug: string;
  title: string;
  price: string;
  pricingType?: "free" | "paid";
  image: string;
  tutor: string;
  tutorImage: string;
  lessons: number; // Total number of lessons
  students: number;
  description: string; // This will be used for the "About" section

  // --- New Fields ---
  tutorBio?: string;
  tutorSocials?: {
    platform: "linkedin" | "twitter" | "github";
    url: string;
  }[];

  modules: {
    title: string;
    lessons: {
      title: string;
      duration: string; // e.g., "15 min"
      videoType?: "youtube" | "cloudinary" | "url"; // Video source type
      videoUrl?: string; // YouTube URL or Cloudinary URL or direct video URL
      cloudinaryPublicId?: string; // Cloudinary public ID if using Cloudinary
      isPublic?: boolean; // Whether lesson is public or private (default: false)
      resources?: {
        name: string;
        url: string;
      }[];
    }[];
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];

  testimonials?: {
    studentName: string;
    studentImage: string;
    rating: number; // 1-5
    comment: string;
  }[];

  successStories?: {
    studentName: string;
    studentImage: string;
    story: string;
    projectUrl?: string;
  }[];
  ratingAverage?: number;
  ratingCount?: number;
}

export const courses: Course[] = [
  {
    slug: "frontend-development",
    title: "Frontend Development Mastery",
    price: "$199",
    pricingType: "paid",
    image: "/images/courses/course1.jpg",
    tutor: "John Doe",
    tutorImage: "/images/users/user1.jpg",
    lessons: 48,
    students: 120,
    description:
      "Learn the fundamentals of frontend web development with HTML, CSS, and JavaScript. This course will take you from a complete beginner to building modern, responsive websites and applications. We will cover ES6+, React, and how to deploy your projects to the web.",
    tutorBio:
      "John Doe is a Senior Frontend Engineer with 10+ years of experience building scalable web applications for tech giants. He's passionate about teaching the next generation of developers.",
    tutorSocials: [
      { platform: "linkedin", url: "#" },
      { platform: "twitter", url: "#" },
      { platform: "github", url: "#" },
    ],
    modules: [
      {
        title: "Module 1: Getting Started (HTML & CSS)",
        lessons: [
          {
            title: "Introduction to Web Development",
            duration: "10 min",
            resources: [
              {
                name: "HTML5 Semantic Tags Cheatsheet.pdf",
                url: "/resources/html5-cheatsheet.pdf",
              },
              {
                name: "Course Slide Deck (Module 1).ppt",
                url: "/resources/module-1-slides.ppt",
              },
            ],
          },
          { title: "HTML5 Structure and Semantics", duration: "45 min" },
          {
            title: "CSS Fundamentals: Selectors and Box Model",
            duration: "1 hr",
          },
          {
            title: "Building Your First Layout with Flexbox",
            duration: "1 hr 15 min",
          },
        ],
      },
      {
        title: "Module 2: JavaScript Fundamentals",
        lessons: [
          { title: "Variables, Data Types, and Operators", duration: "1 hr" },
          { title: "Functions and Control Flow", duration: "1 hr 30 min" },
          { title: "DOM Manipulation", duration: "1 hr 15 min" },
          {
            title: "ES6+ Features: Arrow Functions, Promises",
            duration: "1 hr",
          },
        ],
      },
      {
        title: "Module 3: Advanced React",
        lessons: [
          { title: "React Components and Props", duration: "1 hr 20 min" },
          {
            title: "State Management with Hooks (useState, useEffect)",
            duration: "1 hr 45 min",
          },
          { title: "Routing with React Router", duration: "1 hr" },
          { title: "Final Project: Building a Portfolio", duration: "3 hr" },
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need prior coding experience?",
        answer:
          "No. We start from the absolute basics and gradually build up to advanced topics with plenty of practice.",
      },
      {
        question: "Will I get lifetime access?",
        answer:
          "Yes, once you enroll you can revisit all lessons, resources, and updates whenever you like.",
      },
    ],
    testimonials: [
      {
        studentName: "Alice Martin",
        studentImage: "/images/users/user5.jpg",
        rating: 5,
        comment:
          "This course was amazing! John is a fantastic teacher. I finally understand React Hooks.",
      },
      {
        studentName: "Bob Lee",
        studentImage: "/images/users/user6.jpg",
        rating: 5,
        comment:
          "I landed my first developer job after taking this course. The modules are well-structured and easy to follow.",
      },
    ],
    ratingAverage: 4.8,
    ratingCount: 128,
    successStories: [
      {
        studentName: "Sarah Chen",
        studentImage: "/images/users/user7.jpg",
        story:
          "Before this course, I was working in customer support and had zero coding experience. Six months after enrolling, I built a full-stack application for a local non-profit and just accepted an offer as a Junior Frontend Developer at a local startup. This course truly changed my career path.",
        projectUrl: "#",
      },
    ],
  },
  // --- Completed Data for Other Courses ---
  {
    slug: "backend-development",
    title: "Backend Development",
    price: "$249",
    pricingType: "paid",
    image: "/images/courses/course2.jpg",
    tutor: "Jane Smith",
    tutorImage: "/images/users/user2.jpg",
    lessons: 52, // Updated lesson count
    students: 150,
    description:
      "Master server-side programming with Node.js, Express, and databases. Learn to build robust and scalable APIs, manage databases with MongoDB, and handle authentication.",
    tutorBio:
      "Jane Smith is a Staff Engineer specializing in distributed systems and cloud infrastructure. With 12 years at top-tier companies, she excels at building high-availability services.",
    tutorSocials: [
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ],
    modules: [
      {
        title: "Module 1: Introduction to Node.js",
        lessons: [
          { title: "What is Node.js and the Event Loop?", duration: "30 min" },
          { title: "Setting up your Environment", duration: "20 min" },
          { title: "Working with Modules and NPM", duration: "45 min" },
        ],
      },
      {
        title: "Module 2: Express.js Fundamentals",
        lessons: [
          { title: "Building your first Express Server", duration: "40 min" },
          { title: "Routing and Middleware", duration: "1 hr 10 min" },
          {
            title: "Handling Requests (GET, POST, PUT, DELETE)",
            duration: "1 hr 30 min",
          },
        ],
      },
      {
        title: "Module 3: Database Integration with MongoDB",
        lessons: [
          { title: "Introduction to NoSQL and MongoDB", duration: "45 min" },
          { title: "Connecting to MongoDB with Mongoose", duration: "1 hr" },
          { title: "CRUD Operations", duration: "2 hr" },
        ],
      },
      {
        title: "Module 4: Authentication & Security",
        lessons: [
          { title: "Password Hashing with Bcrypt", duration: "1 hr" },
          {
            title: "Implementing JSON Web Tokens (JWT)",
            duration: "1 hr 45 min",
          },
          { title: "Protecting Routes", duration: "1 hr" },
        ],
      },
    ],
    testimonials: [
      {
        studentName: "Mike Johnson",
        studentImage: "/images/users/user8.jpg",
        rating: 5,
        comment:
          "Jane explains complex backend concepts in a way that's easy to understand. The module on authentication was a game-changer for my project.",
      },
      {
        studentName: "Emily White",
        studentImage: "/images/users/user9.jpg",
        rating: 4,
        comment:
          "Great course! Very practical and hands-on. I wish there was one more module on deployment, but overall fantastic value.",
      },
    ],
    ratingAverage: 4.6,
    ratingCount: 94,
    successStories: [
      {
        studentName: "David Kim",
        studentImage: "/images/users/user10.jpg",
        story:
          "I was a frontend developer who was always intimidated by the backend. Jane's course gave me the confidence to build full-stack applications. I just launched my first SaaS product, and the entire backend is built on the principles I learned here.",
        projectUrl: "#",
      },
    ],
  },
  {
    slug: "full-stack-development",
    title: "Full Stack Development",
    price: "$399",
    image: "/images/courses/course3.jpg",
    tutor: "Peter Jones",
    tutorImage: "/images/users/user3.jpg",
    lessons: 96, // Updated lesson count
    students: 200,
    description:
      "Become a full-stack developer by learning both frontend and backend technologies. This comprehensive course covers everything you need to know, from React and Node.js to database design and deployment.",
    tutorBio:
      "Peter Jones is a serial entrepreneur and full-stack developer who has built and sold two SaaS companies. He has a passion for building real-world products from scratch.",
    tutorSocials: [
      { platform: "github", url: "#" },
      { platform: "twitter", url: "#" },
    ],
    modules: [
      {
        title: "Module 1: The MERN Stack",
        lessons: [
          { title: "Full Stack Architecture Overview", duration: "30 min" },
          {
            title: "Setting up the Project (React & Express)",
            duration: "1 hr",
          },
          { title: "Connecting React to a Node API", duration: "1 hr 30 min" },
        ],
      },
      {
        title: "Module 2: Full Stack CRUD",
        lessons: [
          { title: "Designing your Data Model (MongoDB)", duration: "1 hr" },
          { title: "Building a RESTful API", duration: "2 hr" },
          {
            title: "Fetching and Displaying Data in React",
            duration: "1 hr 45 min",
          },
          { title: "Creating and Updating Data from the UI", duration: "2 hr" },
        ],
      },
      {
        title: "Module 3: Advanced Full Stack",
        lessons: [
          {
            title: "User Authentication (Frontend & Backend)",
            duration: "3 hr",
          },
          {
            title: "State Management with Redux/Zustand",
            duration: "2 hr 30 min",
          },
          { title: "Image Uploads", duration: "1 hr 30 min" },
        ],
      },
      {
        title: "Module 4: Deployment",
        lessons: [
          { title: "Preparing for Production", duration: "1 hr" },
          {
            title: "Deploying a Node.js API (e.g., Vercel)",
            duration: "1 hr 15 min",
          },
          {
            title: "Deploying a React App (e.g., Netlify/Vercel)",
            duration: "1 hr 15 min",
          },
        ],
      },
    ],
    testimonials: [
      {
        studentName: "Carlos Gomez",
        studentImage: "/images/users/user11.jpg",
        rating: 5,
        comment:
          "This is the most comprehensive course I've ever taken. Peter doesn't skip any steps. I went from knowing bits and pieces to confidently building a complete application.",
      },
    ],
    successStories: [
      {
        studentName: "Aisha Ahmed",
        studentImage: "/images/users/user12.jpg",
        story:
          "I had some experience with HTML and CSS but wanted to become a 'real' developer. This course was intense, but it paid off. I just built a complete social media app for my final project and am now freelancing as a full-stack developer.",
        projectUrl: "#",
      },
    ],
  },
  {
    slug: "github-version-control",
    title: "GitHub Version Control",
    price: "$99",
    image: "/images/courses/course2.jpg",
    tutor: "Olivia John",
    tutorImage: "/images/users/user2.jpg",
    lessons: 25, // Updated lesson count
    students: 80,
    description:
      "Learn how to use Git and GitHub for version control. A crucial skill for any developer to collaborate on projects, manage code history, and contribute to open source.",
    tutorBio:
      "Olivia John is a Developer Advocate at GitHub, where she helps developers be more productive. She is a core contributor to several popular open-source projects.",
    tutorSocials: [
      { platform: "linkedin", url: "#" },
      { platform: "twitter", url: "#" },
    ],
    modules: [
      {
        title: "Module 1: Git Fundamentals",
        lessons: [
          { title: "What is Version Control?", duration: "15 min" },
          { title: "Installing and Configuring Git", duration: "20 min" },
          { title: "Your First Commit", duration: "30 min" },
          { title: "Viewing History (git log)", duration: "25 min" },
        ],
      },
      {
        title: "Module 2: Branching and Merging",
        lessons: [
          { title: "The Power of Branching (git branch)", duration: "30 min" },
          { title: "Checking out and Switching Branches", duration: "20 min" },
          { title: "Merging Branches (git merge)", duration: "45 min" },
          { title: "Handling Merge Conflicts", duration: "1 hr" },
        ],
      },
      {
        title: "Module 3: Working with GitHub",
        lessons: [
          { title: "Introduction to GitHub", duration: "20 min" },
          { title: "Cloning a Remote Repository", duration: "25 min" },
          { title: "Pushing Changes (git push)", duration: "30 min" },
          { title: "Pulling Changes (git pull)", duration: "30 min" },
        ],
      },
      {
        title: "Module 4: Collaboration",
        lessons: [
          { title: "The Forking Workflow", duration: "30 min" },
          { title: "Creating Pull Requests", duration: "45 min" },
          { title: "Reviewing and Merging Pull Requests", duration: "40 min" },
          { title: "Introduction to GitHub Issues", duration: "20 min" },
        ],
      },
    ],
    testimonials: [
      {
        studentName: "Kenji Tanaka",
        studentImage: "/images/users/user13.jpg",
        rating: 5,
        comment:
          "I've been 'using' Git for years by just copying and pasting commands. This course finally made me understand *why* I'm doing what I'm doing. Highly recommended!",
      },
      {
        studentName: "Fatima Al-Sayed",
        studentImage: "/images/users/user14.jpg",
        rating: 5,
        comment:
          "Clear, concise, and practical. The module on merge conflicts was worth the price alone. I feel so much more confident contributing to my team's projects.",
      },
    ],
    successStories: [], // This course might not have "career-changing" stories, so leaving it empty is reasonable.
  },
];
