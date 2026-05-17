# Architecture

## Prototype

```text
Browser
  |
  |-- index.html
  |-- styles.css
  |-- app.js
        |
        |-- Role-based screens
        |-- Goal workflow state machine
        |-- Progress score formulas
        |-- CSV export
        |-- Audit log
        |
        `-- localStorage
```

## Production Direction

```text
React / Next.js frontend
  |
REST or GraphQL API
  |
Application services
  |-- Goal lifecycle service
  |-- Approval workflow service
  |-- Check-in service
  |-- Notification / escalation service
  |-- Audit service
  |
PostgreSQL
  |-- users
  |-- org_hierarchy
  |-- cycles
  |-- goal_sheets
  |-- goals
  |-- checkins
  |-- audit_events
```

Recommended hosting for cost optimization: static frontend on Azure Static Web Apps or Vercel, API on Azure App Service or serverless functions, PostgreSQL on a managed low-tier database during pilot.
