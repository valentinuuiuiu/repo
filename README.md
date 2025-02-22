# Spocket.co Inspired Project

This project is inspired by the design and functionality of [Spocket.co](https://spocket.co). It aims to build a comprehensive marketplace/e-commerce solution with dropshipping features including supplier management, product management, order processing, and integrations with third-party services (e.g., Stripe, Prisma, Supabase).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Current Project Structure](#current-project-structure)
- [Setup and Installation](#setup-and-installation)
- [What Has Been Done](#what-has-been-done)
- [Known Issues](#known-issues)
- [Roadmap and To-Do](#roadmap-and-to-do)
- [Research and References](#research-and-references)

---

## Overview

This project is a modern web application developed on a React+TypeScript stack with additional integrations.

Key aspects include:

- A robust backend powered by Prisma with a PostgreSQL datasource.
- A modular frontend structured with components and pages (React, Vite).
- Integration with external services such as Stripe, Supabase, and Redis.

The project is inspired by Spocket.co in terms of design and business model. Spocket.co connects suppliers with retailers, making product sourcing streamlined. This project is a work in progress that aims to capture similar functionality.

---

## Features

### Implemented / In Progress:

- **User and Store Management:**
  - User creation and management
  - Store setup associated with users

- **Product & Order Management:**
  - Product and variant models defined in Prisma schema
  - Order and order item processing

- **Supplier Integration:**
  - Models for supplier and supplier integration
  - Department and agent management

- **Third-party Integrations:**
  - Stripe integration
  - Redis for caching
  - Supabase and Prisma for database interactions

- **UI Components:**
  - Components for dashboards, notifications, and checkout flows in the `src/components` directory
  - Storybook stories setup for UI components in the `src/stories` directory

---

## Current Project Structure

The workspace is organized as follows:

```
├── components.json
├── index.html
├── package.json
├── prisma/
│   └── schema.prisma
├── public/
│   └── vite.svg
├── scripts/
│   └── run_ai_examples.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ai/
│   │   ├── checkout/
│   │   ├── dashboard/
│   │   ├── DepartmentLayout.tsx
│   │   ├── home.tsx
│   │   ├── layout/
│   │   ├── notifications/
│   │   └── ui/
│   ├── lib/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── automation/
│   │   ├── i18n.ts
│   │   ├── mockData.ts
│   │   ├── notifications/
│   │   ├── platforms/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── stripe.ts
│   │   ├── supabase.ts
│   │   ├── suppliers/
│   │   ├── sync/
│   │   └── utils.ts
│   ├── index.css
│   ├── main.tsx
│   ├── pages/
│   │   ├── about/
│   │   ├── admin/
│   │   ├── ai/
│   │   ├── api/
│   │   ├── api.tsx
│   │   ├── auth/
│   │   ├── blog.tsx
│   │   ├── contact-us/
│   │   ├── dashboard/
│   │   ├── documentation.tsx
│   │   ├── features.tsx
│   │   ├── help-support/
│   │   ├── pricing.tsx
│   │   ├── privacy-policy/
│   │   ├── support.tsx
│   │   └── terms-of-service/
│   ├── providers/
│   │   └── StripeProvider.tsx
│   ├── routes.tsx
│   └── stories/
│       └── (various story files)
├── locales/
│   ├── en.json
│   └── ro.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── ...
```

---

## Setup and Installation

1. Ensure you have Node.js installed. (Recommended version >= 16).
2. Install dependencies using PNPM:

   ```bash
   pnpm install
   ```

3. Setup environment variables (create a `.env` file) with:
   - DATABASE_URL (for PostgreSQL)
   - Other secrets as needed (Stripe keys, Supabase keys, etc.)

4. Generate Prisma client and run migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

---

## What Has Been Done

- [x] Prisma schema and basic database models (User, Store, Product, etc.)
- [x] Basic React application setup with Vite
- [x] Initial UI components and pages (Dashboard, Home, Department Layout, etc.)
- [x] Third-party integrations installed (Stripe, Redis, etc.)
- [x] Storybook stories for component documentation
- [x] **AI Engine and Agent Modules:**
  - Basic implementations exist in `src/lib/ai` for AI-driven insights and recommendations.
  - Initial groundwork for agent functionalities are present, leveraging the Agent model from Prisma.
  - Preliminary integration samples in components such as `DepartmentLayout.tsx` hint at how AI modules could be embedded in departmental views.

---

## Known Issues

- **Missing/Incomplete Modules:**
  - Some modules under `src/lib` (e.g. `i18n.ts`, `mockData.ts`, `prisma.ts`, `redis.ts`, `stripe.ts`, `supabase.ts`, `sync/`) may need further implementation or configuration.
  - **AI and Agent Functionalities:** The AI modules in `src/lib/ai` and agent-related logic need further refinement and better integration into departmental layouts. Specific issues include:
    - Lack of comprehensive error handling and data validation in AI modules.
    - Incomplete UI integration of agent functionalities in layouts (e.g., dynamic agent assignment in `DepartmentLayout.tsx`).

- **TypeScript Errors:**
  - There are unresolved type declaration issues such as missing types for some modules (e.g., ReactFlow). This has been addressed by installing the package, but further adjustments might be needed.

- **Peer Dependency Warnings:**
  - There are warnings related to peer dependencies, particularly with React and React-Dom versions expected by some libraries (e.g., react-stripe-js).

- **UI/UX Improvements:**
  - The design is in early stages. Further work is required to polish the user interface, especially for responsive design and accessibility.

---

## Roadmap and To-Do

### Short Term

- [ ] Resolve remaining TypeScript errors and missing type declarations.
- [ ] Complete and refine the backend modules (especially for AI integrations, including data processing in `src/lib/ai` and agent-specific functions).
- [ ] Improve integration of AI results and agent interactions within the Department Layout and other critical UI components.

### Mid Term

- [ ] Enhance UI components with responsive design improvements, focusing on how agents and AI analytics are presented to end-users.
- [ ] Build comprehensive unit and integration tests for the AI modules and agent functionalities.
- [ ] Address peer dependency warnings and potential version conflicts, especially concerning third-party integrations.

### Long Term

- [ ] Complete end-to-end implementation for the full supply chain management workflow, incorporating advanced AI-driven decision support.
- [ ] Integrate further AI features such as automated recommendations, predictive analytics, and dynamic agent routing based on performance metrics.
- [ ] Deploy a staging environment and perform thorough user testing especially focusing on dynamic AI and agent integrations.

---

## Research and References

- [Spocket.co](https://spocket.co): Idea inspiration with features such as supplier and product management.
- [Prisma Documentation](https://www.prisma.io/docs): For detailed schema and client generation customization.
- [Next.js and Vite Integration](https://vitejs.dev/): Guidance for using Vite with React and TypeScript.
- [Stripe Integration Guides](https://stripe.com/docs): For payment integration specifics.
- [Redis and Supabase Docs](https://redis.io/documentation) & (https://supabase.com/docs): For further backend integrations.

---

## Conclusion

This README outlines the current state of the project, highlighting completed work, known issues, and the future roadmap. Your feedback and contributions are welcome to help shape the direction of this project as we move toward a robust, production-ready solution.
