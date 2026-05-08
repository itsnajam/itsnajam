# Requirements Document

## Introduction

A stunning, futuristic portfolio website for Muhammad Najam Ul Hassan — a Senior Software Engineer with 5+ years of experience. The site features a space-technology-inspired aesthetic with liquid glass UI elements, GSAP-powered animations, and a fully responsive layout. It showcases professional background, six portfolio projects, and contact information across four core sections: Hero, Who Am I, Portfolio Projects, and Footer/Contact.

## Glossary

- **Website**: The complete portfolio web application delivered as a set of HTML, CSS, and JavaScript files
- **Hero_Section**: The full-viewport landing area displayed when the page first loads
- **About_Section**: The "Who Am I" section presenting the owner's professional background
- **Portfolio_Section**: The interactive grid or carousel showcasing the six portfolio projects
- **Footer_Section**: The bottom section containing contact information, social links, and a call-to-action
- **Project_Card**: An individual interactive UI element representing one portfolio project
- **GSAP**: GreenSock Animation Platform — the JavaScript library used for all timeline-based animations
- **Liquid_Glass_Effect**: A visual style combining frosted-glass transparency, blur, and subtle reflections on UI surfaces
- **Navbar**: The fixed navigation bar providing links to each section of the page
- **Logo**: The custom branded mark displayed in the Navbar and optionally in the Hero_Section
- **Viewport**: The visible area of the browser window at any given time
- **Breakpoint**: A CSS media-query threshold at which the layout adapts (mobile ≤ 768 px, tablet 769–1024 px, desktop > 1024 px)
- **CTA**: Call-to-action — a prominent button or link prompting the visitor to make contact

---

## Requirements

### Requirement 1: Hero Section

**User Story:** As a visitor, I want to see a visually striking landing screen, so that I immediately understand who Muhammad Najam Ul Hassan is and feel engaged with the site.

#### Acceptance Criteria

1. THE Hero_Section SHALL occupy 100% of the Viewport height on initial page load.
2. THE Hero_Section SHALL display the owner's full name "Muhammad Najam Ul Hassan" and the title "Senior Software Engineer" as the primary headline content.
3. WHEN the page finishes loading, THE GSAP SHALL animate the headline text and subtitle into view using a staggered fade-and-slide entrance within 1.2 seconds.
4. THE Hero_Section SHALL include a CTA button labelled "View My Work" that scrolls the user smoothly to the Portfolio_Section when activated.
5. THE Hero_Section SHALL render a space-technology-inspired background (e.g., animated star field or nebula gradient) that does not obstruct the headline text.
6. WHEN the user moves the cursor over the Hero_Section on a pointer device, THE Hero_Section SHALL apply a subtle parallax shift to the background layer of no more than 20 px in any direction.
7. IF the device does not support pointer events, THEN THE Hero_Section SHALL display the static background without parallax movement.

---

### Requirement 2: Navigation Bar

**User Story:** As a visitor, I want a persistent navigation bar, so that I can jump to any section of the page at any time without scrolling manually.

#### Acceptance Criteria

1. THE Navbar SHALL remain fixed at the top of the Viewport during scrolling.
2. THE Navbar SHALL display the Logo on the left side and section links ("Home", "About", "Projects", "Contact") on the right side.
3. WHEN a visitor clicks a Navbar link, THE Website SHALL scroll smoothly to the corresponding section within 600 ms.
4. WHEN the page scroll position passes 80 px from the top, THE Navbar SHALL apply the Liquid_Glass_Effect (backdrop blur ≥ 12 px, background opacity ≤ 0.6) to its background.
5. WHEN the Viewport width is at or below the mobile Breakpoint, THE Navbar SHALL collapse the section links into a hamburger menu icon.
6. WHEN the hamburger menu icon is activated, THE Navbar SHALL expand a full-width dropdown panel displaying all section links.

---

### Requirement 3: Logo and Branding

**User Story:** As a visitor, I want to see a distinctive, professional logo, so that the site feels polished and memorable.

#### Acceptance Criteria

1. THE Logo SHALL be a custom SVG or image asset that is modern, sleek, and tech-forward in style.
2. THE Logo SHALL display at a minimum height of 32 px and a maximum height of 48 px within the Navbar.
3. WHEN the Logo is activated (clicked or tapped), THE Website SHALL scroll smoothly back to the top of the Hero_Section.
4. THE Logo SHALL remain legible against both dark and light Navbar background states.

---

### Requirement 4: Who Am I Section

**User Story:** As a visitor, I want to read a concise professional biography, so that I understand Muhammad Najam Ul Hassan's background, expertise, and value proposition.

#### Acceptance Criteria

1. THE About_Section SHALL display the owner's name, title ("Senior Software Engineer"), and a biography paragraph describing 5+ years of experience building scalable solutions and automating workflows.
2. THE About_Section SHALL present at least three highlighted skill or expertise tags (e.g., "Workflow Automation", "Scalable Systems", "No-Code / Low-Code") as visually distinct badges.
3. WHEN the About_Section enters the Viewport during scrolling, THE GSAP SHALL animate the biography content into view using a fade-in transition of no more than 800 ms.
4. THE About_Section SHALL apply the Liquid_Glass_Effect to its primary content card, with a border radius of at least 12 px.
5. THE About_Section SHALL include a professional photo placeholder or avatar element that is at least 120 × 120 px.

---

### Requirement 5: Portfolio Projects Section

**User Story:** As a visitor, I want to browse Muhammad Najam Ul Hassan's projects interactively, so that I can evaluate the quality and breadth of his work.

#### Acceptance Criteria

1. THE Portfolio_Section SHALL display all six projects — Mobile Monster Australia, My First Nest Egg, Bountisphere AI, Clicked, Fronthouz, and Sentre — each as a separate Project_Card.
2. EACH Project_Card SHALL display the project name, a short description (≤ 60 words), and the technology stack as a list of tags.
3. WHEN a visitor hovers over a Project_Card on a pointer device, THE GSAP SHALL animate a lift effect (translateY of −8 px, box-shadow increase) within 300 ms.
4. WHEN the Portfolio_Section enters the Viewport during scrolling, THE GSAP SHALL stagger-animate each Project_Card into view with a delay of 100 ms between cards.
5. THE Portfolio_Section SHALL arrange Project_Cards in a responsive grid: three columns on desktop, two columns on tablet, one column on mobile Breakpoints.
6. EACH Project_Card SHALL apply the Liquid_Glass_Effect to its surface.
7. WHERE a project has an associated external URL, THE Project_Card SHALL include a "View Project" link that opens the URL in a new browser tab.

---

### Requirement 6: Footer and Contact Section

**User Story:** As a visitor, I want easy access to contact information and social media links, so that I can reach out to Muhammad Najam Ul Hassan directly.

#### Acceptance Criteria

1. THE Footer_Section SHALL display an email address, at least two social media profile links (e.g., LinkedIn, GitHub), and a CTA button labelled "Get In Touch".
2. WHEN the "Get In Touch" CTA is activated, THE Website SHALL open the visitor's default email client pre-addressed to the owner's email address.
3. THE Footer_Section SHALL display a copyright notice in the format "© [current year] Muhammad Najam Ul Hassan. All rights reserved."
4. WHEN the Footer_Section enters the Viewport during scrolling, THE GSAP SHALL animate the footer content into view using a fade-up transition of no more than 600 ms.
5. THE Footer_Section SHALL apply the Liquid_Glass_Effect to its background surface.
6. WHEN a social media link is activated, THE Website SHALL open the corresponding profile URL in a new browser tab.

---

### Requirement 7: Responsive Design

**User Story:** As a visitor using any device, I want the website to display correctly and remain fully usable, so that I have a consistent experience regardless of screen size.

#### Acceptance Criteria

1. THE Website SHALL render without horizontal scrollbars at Viewport widths of 320 px, 768 px, and 1440 px.
2. THE Website SHALL maintain legible body text at a minimum font size of 14 px across all Breakpoints.
3. WHEN the Viewport width is at or below the mobile Breakpoint, THE Portfolio_Section SHALL display Project_Cards in a single-column layout.
4. WHEN the Viewport width is at or below the mobile Breakpoint, THE Hero_Section SHALL scale the headline font size to remain within the Viewport width without overflow.
5. THE Website SHALL pass a Lighthouse mobile performance score of at least 80 on a standard test run.

---

### Requirement 8: Performance and Accessibility

**User Story:** As a visitor, I want the website to load quickly and be accessible, so that I can use it regardless of my connection speed or assistive technology.

#### Acceptance Criteria

1. THE Website SHALL achieve a Lighthouse desktop performance score of at least 90 on a standard test run.
2. THE Website SHALL provide descriptive `alt` text for all images and SVG assets.
3. THE Website SHALL ensure all interactive elements (links, buttons, hamburger menu) are keyboard-navigable and have a visible focus indicator.
4. THE Website SHALL maintain a color contrast ratio of at least 4.5:1 between body text and its background, as defined by WCAG 2.1 AA.
5. WHEN GSAP animations are running, THE Website SHALL respect the `prefers-reduced-motion` media query by disabling or minimizing motion for users who have enabled that system preference.
6. THE Website SHALL load all above-the-fold content within 3 seconds on a simulated 4G connection (10 Mbps download).

---

### Requirement 9: Animations and Visual Effects

**User Story:** As a visitor, I want smooth, cohesive animations throughout the site, so that the experience feels premium and engaging without being distracting.

#### Acceptance Criteria

1. THE Website SHALL use GSAP as the sole animation library for all entrance, hover, and scroll-triggered effects.
2. WHEN the page first loads, THE GSAP SHALL execute a coordinated entrance sequence covering the Navbar, Hero_Section headline, and CTA button, completing within 2 seconds.
3. THE Website SHALL apply consistent easing (e.g., `power2.out` or equivalent) across all GSAP transitions to maintain a unified motion language.
4. THE Liquid_Glass_Effect SHALL be implemented using CSS `backdrop-filter: blur()` with a blur radius between 10 px and 20 px, combined with a semi-transparent background.
5. WHEN any animated element is not yet in the Viewport, THE GSAP ScrollTrigger SHALL keep that element in its pre-animation state to prevent layout shifts.
