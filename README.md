<<<<<<< HEAD
# AlignX

A self-contained goal setting and tracking portal prototype for the AtomQuest 1.0 problem statement.

## Run

Open `index.html` in a browser, or serve the folder with any static server.

Current local URL:

```text
http://localhost:8080/index.html
```

## Demo Roles

Start from the landing page, open the login page, and use the demo password:

```text
alignx
```

Quick-login buttons are available for Employee, Manager, and Admin. After login, the role and user selectors remain available in the sidebar for demo switching.

- Employee: create goals, submit for approval, update Q1 achievements.
- Manager: review team goals, edit targets/weightages during approval, approve or return, log check-in comments.
- Admin / HR: monitor completion, unlock goals, push shared departmental KPIs, export achievement CSV, view audit trail.

## Implemented Requirements

- Goal creation with thrust area, title, description, UoM, target, and weightage.
- Validation for total weightage = 100%, minimum 10% per goal, maximum 8 goals.
- L1 manager approval workflow with lock after approval.
- Shared goals pushed by admin to a department.
- Quarterly achievement entry with status and computed progress score.
- Manager check-in comments.
- Completion dashboard.
- CSV export for achievement report.
- Audit trail for governance events.

## Notes

This version uses browser localStorage for demo persistence and seeded sample data. For production, replace localStorage with a backend API and relational database.

