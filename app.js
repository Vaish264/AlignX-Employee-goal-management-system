const STORAGE_KEY = "alignx-goal-portal-v1";
const THEME_KEY = "alignx-theme";

const seed = {
  cycle: { year: "2026-27", activeWindow: "Phase 1 - Goal Setting opens 1 May" },
  users: [
    { id: "e1", name: "Anaya Sharma", role: "employee", managerId: "m1", department: "Sales" },
    { id: "e2", name: "Rohan Mehta", role: "employee", managerId: "m1", department: "Sales" },
    { id: "e3", name: "Isha Rao", role: "employee", managerId: "m2", department: "Operations" },
    { id: "m1", name: "Meera Nair", role: "manager", managerId: "a1", department: "Sales" },
    { id: "m2", name: "Kabir Sethi", role: "manager", managerId: "a1", department: "Operations" },
    { id: "a1", name: "Priya HR", role: "admin", managerId: null, department: "HR" }
  ],
  goalSheets: [
    {
      employeeId: "e1",
      status: "pending",
      locked: false,
      goals: [
        goal("g1", "Revenue Growth", "Enterprise revenue", "Close priority pipeline worth INR 80L", "min", "8000000", 40),
        goal("g2", "Customer Experience", "Renewal health", "Maintain renewal risk below 8%", "max", "8", 25),
        goal("g3", "People Development", "Mentor new hires", "Complete onboarding plan for 2 associates", "min", "2", 20),
        goal("g4", "Innovation", "CRM automation", "Launch lead scoring pilot by 2026-10-15", "timeline", "2026-10-15", 15)
      ]
    },
    {
      employeeId: "e2",
      status: "draft",
      locked: false,
      goals: [
        goal("g5", "Revenue Growth", "SMB revenue", "Close INR 45L in SMB accounts", "min", "4500000", 50),
        goal("g6", "Operational Excellence", "Forecast discipline", "Submit weekly forecast before Friday noon", "zero", "0", 20),
        goal("g7", "Customer Experience", "Customer calls", "Complete 60 discovery calls", "min", "60", 30)
      ]
    },
    {
      employeeId: "e3",
      status: "approved",
      locked: true,
      goals: [
        goal("g8", "Operational Excellence", "Reduce TAT", "Reduce support TAT to 18 hours", "max", "18", 40),
        goal("g9", "Safety & Compliance", "Safety incidents", "Maintain zero safety incidents", "zero", "0", 30),
        goal("g10", "Innovation", "Automation", "Deploy ticket routing automation by 2026-09-30", "timeline", "2026-09-30", 30)
      ]
    }
  ],
  checkins: [
    { id: "c1", employeeId: "e3", quarter: "Q1", managerId: "m2", comment: "Good early progress. Automation pilot needs vendor closure.", completedAt: "2026-07-18" }
  ],
  audit: [
    { at: "2026-05-12 10:20", actor: "Priya HR", action: "Cycle configured", detail: "FY 2026-27 goal cycle opened" }
  ]
};

function goal(id, thrustArea, title, description, uom, target, weightage, sharedGroupId = null) {
  return {
    id,
    thrustArea,
    title,
    description,
    uom,
    target,
    weightage,
    sharedGroupId,
    actuals: {
      Q1: { actual: "", status: "Not Started" },
      Q2: { actual: "", status: "Not Started" },
      Q3: { actual: "", status: "Not Started" },
      Q4: { actual: "", status: "Not Started" }
    }
  };
}

let state = loadState();
let screen = "landing";
let currentRole = "employee";
let currentUserId = "e1";
let currentView = "dashboard";

const landingPage = document.querySelector("#landingPage");
const loginPage = document.querySelector("#loginPage");
const portalPage = document.querySelector("#portalPage");
const loginRole = document.querySelector("#loginRole");
const loginUser = document.querySelector("#loginUser");
const loginPassword = document.querySelector("#loginPassword");
const roleSelect = document.querySelector("#roleSelect");
const userSelect = document.querySelector("#userSelect");
const nav = document.querySelector("#nav");
const content = document.querySelector("#content");
const pageTitle = document.querySelector("#pageTitle");
const roleEyebrow = document.querySelector("#roleEyebrow");
const activeWindow = document.querySelector("#activeWindow");
const themeToggleBtn = document.querySelector("#themeToggleBtn");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(seed);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || "light");
  document.querySelector("#openLoginTopBtn").addEventListener("click", showLogin);
  document.querySelector("#openLoginHeroBtn").addEventListener("click", showLogin);
  document.querySelector("#startDemoBtn").addEventListener("click", showLogin);
  document.querySelector("#backToLandingBtn").addEventListener("click", showLanding);
  document.querySelector("#viewFeaturesBtn").addEventListener("click", () => {
    document.querySelector("#featureBand").scrollIntoView({ behavior: "smooth" });
  });
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    screen = "landing";
    render();
  });
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
  loginRole.addEventListener("change", renderLoginUsers);
  document.querySelector("#loginForm").addEventListener("submit", event => {
    event.preventDefault();
    if (loginPassword.value !== "alignx") {
      toast("Use the demo password: alignx");
      return;
    }
    signIn(loginUser.value);
  });
  document.querySelectorAll("[data-demo-login]").forEach(button => {
    button.addEventListener("click", () => signIn(button.dataset.demoLogin));
  });

  roleSelect.innerHTML = ["employee", "manager", "admin"].map(role => `<option value="${role}">${label(role)}</option>`).join("");
  roleSelect.value = currentRole;
  roleSelect.addEventListener("change", () => {
    currentRole = roleSelect.value;
    const firstUser = state.users.find(user => user.role === currentRole);
    currentUserId = firstUser.id;
    currentView = "dashboard";
    render();
  });

  userSelect.addEventListener("change", () => {
    currentUserId = userSelect.value;
    render();
  });

  document.querySelector("#resetDataBtn").addEventListener("click", () => {
    state = structuredClone(seed);
    saveState();
    toast("Demo data reset");
    render();
  });

  renderLoginUsers();
  render();
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggleBtn.textContent = isDark ? "Light mode" : "Dark mode";
}

function render() {
  landingPage.hidden = screen !== "landing";
  loginPage.hidden = screen !== "login";
  portalPage.hidden = screen !== "portal";
  if (screen !== "portal") return;

  const usersForRole = state.users.filter(user => user.role === currentRole);
  if (!usersForRole.some(user => user.id === currentUserId)) currentUserId = usersForRole[0].id;
  userSelect.innerHTML = usersForRole.map(user => `<option value="${user.id}">${user.name}</option>`).join("");
  userSelect.value = currentUserId;
  activeWindow.textContent = `${state.cycle.year} • ${state.cycle.activeWindow}`;
  roleEyebrow.textContent = `${label(currentRole)} workspace`;

  const items = navItems();
  if (!items.some(item => item.id === currentView)) currentView = items[0].id;
  nav.innerHTML = items.map(item => `<button class="${item.id === currentView ? "active" : ""}" data-view="${item.id}">${item.title}</button>`).join("");
  nav.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view;
      render();
    });
  });

  const item = items.find(entry => entry.id === currentView);
  pageTitle.textContent = item.title;
  content.innerHTML = "";
  item.render();
  saveState();
}

function showLanding() {
  screen = "landing";
  render();
}

function showLogin() {
  screen = "login";
  renderLoginUsers();
  render();
}

function renderLoginUsers() {
  const role = loginRole.value;
  const users = state.users.filter(user => user.role === role);
  loginUser.innerHTML = users.map(user => `<option value="${user.id}">${user.name} - ${user.department}</option>`).join("");
}

function signIn(userId) {
  const user = state.users.find(item => item.id === userId);
  currentRole = user.role;
  currentUserId = user.id;
  currentView = "dashboard";
  roleSelect.value = currentRole;
  screen = "portal";
  toast(`Welcome, ${user.name}`);
  render();
}

function navItems() {
  if (currentRole === "employee") {
    return [
      { id: "dashboard", title: "My Goals", render: renderEmployeeDashboard },
      { id: "checkins", title: "Quarterly Updates", render: renderEmployeeCheckins }
    ];
  }
  if (currentRole === "manager") {
    return [
      { id: "dashboard", title: "Team Dashboard", render: renderManagerDashboard },
      { id: "approvals", title: "Approvals", render: renderApprovals },
      { id: "checkins", title: "Manager Check-ins", render: renderManagerCheckins }
    ];
  }
  return [
    { id: "dashboard", title: "HR Overview", render: renderAdminDashboard },
    { id: "shared", title: "Shared Goals", render: renderSharedGoals },
    { id: "reports", title: "Reports & Audit", render: renderReports }
  ];
}

function renderEmployeeDashboard() {
  const user = currentUser();
  const sheet = getSheet(user.id);
  renderMetrics([
    ["Goal sheet status", statusText(sheet.status)],
    ["Total weightage", `${totalWeight(sheet.goals)}%`],
    ["Goal count", sheet.goals.length],
    ["Locked", sheet.locked ? "Yes" : "No"]
  ]);

  const canEdit = !sheet.locked && sheet.status !== "pending";
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Goal Sheet</h3>
        <p class="hint">${canEdit ? "Create up to 8 goals. Total weightage must equal 100%." : "This goal sheet is awaiting review or locked after approval."}</p>
      </div>
      <span class="status ${sheet.status}">${statusText(sheet.status)}</span>
    </div>
    <div class="section-body">
      <div class="table-wrap">
        <table class="goal-sheet-table">
          <thead><tr><th>Goal</th><th>Thrust Area</th><th>UoM</th><th>Target</th><th>Weightage</th><th></th></tr></thead>
          <tbody id="goalRows"></tbody>
        </table>
      </div>
      <div class="actions" style="margin-top:16px">
        <button class="secondary-button" id="addGoalBtn">Add goal</button>
        <button class="button" id="submitGoalsBtn">Submit for approval</button>
      </div>
    </div>`;
  content.append(section);

  const tbody = section.querySelector("#goalRows");
  sheet.goals.forEach(goalItem => addGoalRow(tbody, goalItem, canEdit, sheet));
  section.querySelector("#addGoalBtn").disabled = !canEdit || sheet.goals.length >= 8;
  section.querySelector("#submitGoalsBtn").disabled = !canEdit;
  section.querySelector("#addGoalBtn").addEventListener("click", () => {
    sheet.goals.push(goal(`g${Date.now()}`, "Revenue Growth", "", "", "min", "", 10));
    render();
  });
  section.querySelector("#submitGoalsBtn").addEventListener("click", () => submitGoals(sheet));
}

function addGoalRow(tbody, goalItem, canEdit, sheet, managerEdit = false) {
  const row = document.querySelector("#goalRowTemplate").content.firstElementChild.cloneNode(true);
  row.querySelectorAll("[data-field]").forEach(input => {
    const field = input.dataset.field;
    input.value = goalItem[field];
    const sharedReadOnly = goalItem.sharedGroupId && ["title", "description", "thrustArea", "uom", "target"].includes(field);
    input.disabled = !canEdit || sharedReadOnly || (managerEdit && !["target", "weightage"].includes(field));
    input.addEventListener("input", () => {
      goalItem[field] = field === "weightage" ? Number(input.value) : input.value;
      if (goalItem.sharedGroupId && field === "weightage") audit("Shared goal weightage adjusted", `${currentUser().name} changed weightage for ${goalItem.title}`);
    });
  });
  const remove = row.querySelector("[data-action='remove']");
  remove.disabled = !canEdit || goalItem.sharedGroupId;
  remove.addEventListener("click", () => {
    sheet.goals = sheet.goals.filter(item => item.id !== goalItem.id);
    render();
  });
  tbody.append(row);
}

function submitGoals(sheet) {
  const errors = validateSheet(sheet);
  if (errors.length) {
    toast(errors.join(" "));
    return;
  }
  sheet.status = "pending";
  audit("Goal sheet submitted", `${currentUser().name} submitted goals for L1 approval`);
  toast("Submitted to manager");
  render();
}

function renderEmployeeCheckins() {
  const sheet = getSheet(currentUserId);
  const approved = sheet.status === "approved";
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Achievement Capture</h3>
        <p class="hint">Log planned vs actual progress for each quarterly window.</p>
      </div>
    </div>
    <div class="section-body">
      ${approved ? quarterTabs(sheet, true) : `<p class="empty">Quarterly updates open after manager approval.</p>`}
    </div>`;
  content.append(section);
  bindQuarterSave(section, sheet);
}

function quarterTabs(sheet, editable) {
  const quarter = "Q1";
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Goal</th><th>Target</th><th>${quarter} Actual</th><th>Status</th><th>Progress</th></tr></thead>
        <tbody>
          ${sheet.goals.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.title)}</strong><p class="small">${escapeHtml(item.description)}</p></td>
              <td>${escapeHtml(item.target)}</td>
              <td><input class="input compact" data-actual="${item.id}" value="${escapeHtml(item.actuals[quarter].actual)}" ${editable ? "" : "disabled"} /></td>
              <td>
                <select class="select compact" data-status="${item.id}" ${editable ? "" : "disabled"}>
                  ${["Not Started", "On Track", "Completed"].map(status => `<option ${item.actuals[quarter].status === status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </td>
              <td>${progressCell(item, quarter)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
    ${editable ? `<div class="actions" style="margin-top:16px">
      <button class="button" id="saveActualsBtn">Save Q1 updates</button>
    </div>` : ""}`;
}

function bindQuarterSave(container, sheet) {
  const save = container.querySelector("#saveActualsBtn");
  if (save) {
    save.addEventListener("click", () => {
      syncSharedAchievements(sheet);
      audit("Quarterly achievement updated", `${currentUser().name} saved Q1 actuals`);
      toast("Q1 updates saved");
      render();
    });
  }
}

function renderManagerDashboard() {
  const team = teamMembers();
  const pending = team.filter(user => getSheet(user.id).status === "pending").length;
  const approved = team.filter(user => getSheet(user.id).status === "approved").length;
  const completed = state.checkins.filter(checkin => checkin.managerId === currentUserId).length;
  renderMetrics([
    ["Team members", team.length],
    ["Pending approvals", pending],
    ["Approved sheets", approved],
    ["Check-ins logged", completed]
  ]);
  renderTeamTable(team);
}

function renderApprovals() {
  const team = teamMembers();
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header"><h3>Goal Approval Queue</h3></div>
    <div class="section-body" id="approvalBody"></div>`;
  content.append(section);
  const body = section.querySelector("#approvalBody");
  team.forEach(user => {
    const sheet = getSheet(user.id);
    const block = el("div", "section");
    block.style.marginBottom = "16px";
    block.innerHTML = `
      <div class="section-header">
        <div><h3>${user.name}</h3><p class="hint">${user.department} • ${statusText(sheet.status)}</p></div>
        <span class="status ${sheet.status}">${statusText(sheet.status)}</span>
      </div>
      <div class="section-body">
        <div class="table-wrap"><table><thead><tr><th>Goal</th><th>Thrust Area</th><th>UoM</th><th>Target</th><th>Weightage</th><th></th></tr></thead><tbody></tbody></table></div>
        <div class="actions" style="margin-top:16px">
          <button class="button" data-approve="${user.id}">Approve</button>
          <button class="secondary-button" data-return="${user.id}">Return for rework</button>
        </div>
      </div>`;
    body.append(block);
    const canEdit = sheet.status === "pending";
    sheet.goals.forEach(goalItem => addGoalRow(block.querySelector("tbody"), goalItem, canEdit, sheet, true));
  });
  body.querySelectorAll("[data-approve]").forEach(button => button.addEventListener("click", () => approveSheet(button.dataset.approve)));
  body.querySelectorAll("[data-return]").forEach(button => button.addEventListener("click", () => returnSheet(button.dataset.return)));
}

function renderManagerCheckins() {
  const team = teamMembers();
  renderTeamTable(team, true);
}

function renderTeamTable(team, withCheckins = false) {
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header"><h3>Team Members</h3></div>
    <div class="section-body table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Status</th><th>Weightage</th><th>Average progress</th>${withCheckins ? "<th>Check-in</th>" : ""}</tr></thead>
        <tbody>
          ${team.map(user => {
            const sheet = getSheet(user.id);
            return `<tr>
              <td><strong>${user.name}</strong><p class="small">${user.department}</p></td>
              <td><span class="status ${sheet.status}">${statusText(sheet.status)}</span></td>
              <td>${totalWeight(sheet.goals)}%</td>
              <td>${averageProgress(sheet)}%</td>
              ${withCheckins ? `<td><button class="button" data-log-checkin="${user.id}">Log discussion</button></td>` : ""}
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
  content.append(section);
  section.querySelectorAll("[data-log-checkin]").forEach(button => {
    button.addEventListener("click", () => openCheckinForm(button.dataset.logCheckin));
  });
}

function openCheckinForm(employeeId) {
  const employee = state.users.find(user => user.id === employeeId);
  const sheet = getSheet(employeeId);
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header"><h3>Q1 Check-in • ${employee.name}</h3></div>
    <div class="section-body">
      ${quarterTabs(sheet, false)}
      <label class="form-field" style="margin-top:16px">
        <span class="field-label">Structured check-in comment</span>
        <textarea id="managerComment" class="textarea" rows="4" placeholder="Discussion notes, blockers, next steps"></textarea>
      </label>
      <div class="actions" style="margin-top:16px"><button class="button" id="saveCheckinBtn">Complete check-in</button></div>
    </div>`;
  content.append(section);
  section.querySelector("#saveCheckinBtn").addEventListener("click", () => {
    state.checkins.push({ id: `c${Date.now()}`, employeeId, quarter: "Q1", managerId: currentUserId, comment: section.querySelector("#managerComment").value, completedAt: today() });
    audit("Manager check-in completed", `${currentUser().name} logged Q1 check-in for ${employee.name}`);
    toast("Check-in completed");
    render();
  });
}

function renderAdminDashboard() {
  const employees = state.users.filter(user => user.role === "employee");
  renderMetrics([
    ["Employees", employees.length],
    ["Approved sheets", employees.filter(user => getSheet(user.id).status === "approved").length],
    ["Q1 check-ins", state.checkins.filter(item => item.quarter === "Q1").length],
    ["Audit events", state.audit.length]
  ]);
  renderCompletionDashboard();
}

function renderCompletionDashboard() {
  const employees = state.users.filter(user => user.role === "employee");
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header"><h3>Completion Dashboard</h3></div>
    <div class="section-body table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Manager</th><th>Goal Sheet</th><th>Q1 Check-in</th><th>Admin</th></tr></thead>
        <tbody>
          ${employees.map(user => {
            const manager = state.users.find(item => item.id === user.managerId);
            const sheet = getSheet(user.id);
            const checkin = state.checkins.find(item => item.employeeId === user.id && item.quarter === "Q1");
            return `<tr>
              <td>${user.name}</td>
              <td>${manager.name}</td>
              <td><span class="status ${sheet.status}">${statusText(sheet.status)}</span></td>
              <td>${checkin ? `<span class="status completed">Completed</span>` : `<span class="status pending">Pending</span>`}</td>
              <td><button class="secondary-button" data-unlock="${user.id}">Unlock goals</button></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
  content.append(section);
  section.querySelectorAll("[data-unlock]").forEach(button => button.addEventListener("click", () => {
    const sheet = getSheet(button.dataset.unlock);
    sheet.locked = false;
    sheet.status = "returned";
    audit("Goal sheet unlocked", `${currentUser().name} unlocked goals for ${employeeName(button.dataset.unlock)}`);
    toast("Goal sheet unlocked");
    render();
  }));
}

function renderSharedGoals() {
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header">
      <div><h3>Push Department KPI</h3><p class="hint">Recipients can only adjust weightage. Title and target stay read-only.</p></div>
    </div>
    <div class="section-body">
      <div class="form-grid">
        <label class="form-field"><span class="field-label">Department</span><select id="sharedDepartment" class="select"><option>Sales</option><option>Operations</option></select></label>
        <label class="form-field"><span class="field-label">Thrust area</span><select id="sharedThrust" class="select"><option>Revenue Growth</option><option>Operational Excellence</option><option>Safety & Compliance</option></select></label>
        <label class="form-field"><span class="field-label">Goal title</span><input id="sharedTitle" class="input" value="Department KPI" /></label>
        <label class="form-field"><span class="field-label">Target</span><input id="sharedTarget" class="input" value="100" /></label>
        <label class="form-field"><span class="field-label">UoM</span><select id="sharedUom" class="select"><option value="min">Numeric / % - Higher better</option><option value="max">Numeric / % - Lower better</option><option value="zero">Zero-based</option></select></label>
        <label class="form-field"><span class="field-label">Default weightage</span><input id="sharedWeight" class="input" type="number" value="10" min="10" /></label>
      </div>
      <div class="actions" style="margin-top:16px"><button class="button" id="pushSharedBtn">Push shared goal</button></div>
    </div>`;
  content.append(section);
  section.querySelector("#pushSharedBtn").addEventListener("click", () => {
    const group = `sg${Date.now()}`;
    const department = section.querySelector("#sharedDepartment").value;
    const employees = state.users.filter(user => user.role === "employee" && user.department === department);
    employees.forEach(user => {
      const sheet = getSheet(user.id);
      if (sheet.goals.length < 8) {
        sheet.goals.push(goal(`g${Date.now()}${user.id}`, section.querySelector("#sharedThrust").value, section.querySelector("#sharedTitle").value, "Shared departmental KPI", section.querySelector("#sharedUom").value, section.querySelector("#sharedTarget").value, Number(section.querySelector("#sharedWeight").value), group));
      }
    });
    audit("Shared goal pushed", `${currentUser().name} pushed KPI to ${department}`);
    toast(`Shared goal pushed to ${employees.length} employees`);
    render();
  });
}

function renderReports() {
  const section = el("section", "section");
  section.innerHTML = `
    <div class="section-header">
      <h3>Achievement Report</h3>
      <button class="button" id="exportCsvBtn">Export CSV</button>
    </div>
    <div class="section-body table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Goal</th><th>Target</th><th>Q1 Actual</th><th>Status</th><th>Score</th></tr></thead>
        <tbody>${reportRows().map(row => `<tr><td>${row.employee}</td><td>${row.goal}</td><td>${row.target}</td><td>${row.actual}</td><td>${row.status}</td><td>${row.score}%</td></tr>`).join("")}</tbody>
      </table>
    </div>`;
  content.append(section);
  section.querySelector("#exportCsvBtn").addEventListener("click", exportCsv);

  const auditSection = el("section", "section");
  auditSection.innerHTML = `
    <div class="section-header"><h3>Audit Trail</h3></div>
    <div class="section-body table-wrap">
      <table><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead>
      <tbody>${state.audit.map(item => `<tr><td>${item.at}</td><td>${item.actor}</td><td>${item.action}</td><td>${item.detail}</td></tr>`).join("")}</tbody></table>
    </div>`;
  content.append(auditSection);
}

function renderMetrics(metrics) {
  const grid = el("div", "grid");
  grid.innerHTML = metrics.map(([name, value]) => `<div class="metric"><span>${name}</span><strong>${value}</strong></div>`).join("");
  content.append(grid);
}

function approveSheet(employeeId) {
  const sheet = getSheet(employeeId);
  const errors = validateSheet(sheet);
  if (errors.length) return toast(errors.join(" "));
  sheet.status = "approved";
  sheet.locked = true;
  audit("Goal sheet approved", `${currentUser().name} approved goals for ${employeeName(employeeId)}`);
  toast("Goals approved and locked");
  render();
}

function returnSheet(employeeId) {
  const sheet = getSheet(employeeId);
  sheet.status = "returned";
  sheet.locked = false;
  audit("Goal sheet returned", `${currentUser().name} returned goals for ${employeeName(employeeId)}`);
  toast("Returned for rework");
  render();
}

function validateSheet(sheet) {
  const errors = [];
  if (sheet.goals.length > 8) errors.push("Maximum 8 goals allowed.");
  if (sheet.goals.some(item => Number(item.weightage) < 10)) errors.push("Each goal needs at least 10% weightage.");
  if (totalWeight(sheet.goals) !== 100) errors.push("Total weightage must equal 100%.");
  if (sheet.goals.some(item => !item.title || !item.target)) errors.push("Every goal needs a title and target.");
  return errors;
}

function score(goalItem, quarter) {
  const actual = Number(goalItem.actuals[quarter].actual);
  const target = Number(goalItem.target);
  if (goalItem.uom === "timeline") {
    if (!goalItem.actuals[quarter].actual) return 0;
    return new Date(goalItem.actuals[quarter].actual) <= new Date(goalItem.target) ? 100 : 75;
  }
  if (goalItem.uom === "zero") return actual === 0 && goalItem.actuals[quarter].actual !== "" ? 100 : 0;
  if (!actual || !target) return 0;
  const ratio = goalItem.uom === "max" ? target / actual : actual / target;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function progressCell(goalItem, quarter) {
  const value = score(goalItem, quarter);
  return `<div class="progress-bar"><span style="width:${value}%"></span></div><p class="small">${value}%</p>`;
}

function averageProgress(sheet) {
  if (!sheet.goals.length) return 0;
  return Math.round(sheet.goals.reduce((sum, item) => sum + score(item, "Q1"), 0) / sheet.goals.length);
}

function syncSharedAchievements(sheet) {
  sheet.goals.filter(item => item.sharedGroupId).forEach(source => {
    state.goalSheets.forEach(otherSheet => {
      otherSheet.goals.filter(item => item.sharedGroupId === source.sharedGroupId).forEach(target => {
        target.actuals = structuredClone(source.actuals);
      });
    });
  });
}

function exportCsv() {
  const csv = [
    ["Employee", "Goal", "Target", "Q1 Actual", "Status", "Score"],
    ...reportRows().map(row => [row.employee, row.goal, row.target, row.actual, row.status, row.score])
  ].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "alignx-achievement-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function reportRows() {
  return state.goalSheets.flatMap(sheet => sheet.goals.map(goalItem => ({
    employee: employeeName(sheet.employeeId),
    goal: goalItem.title,
    target: goalItem.target,
    actual: goalItem.actuals.Q1.actual,
    status: goalItem.actuals.Q1.status,
    score: score(goalItem, "Q1")
  })));
}

function getSheet(employeeId) {
  let sheet = state.goalSheets.find(item => item.employeeId === employeeId);
  if (!sheet) {
    sheet = { employeeId, status: "draft", locked: false, goals: [] };
    state.goalSheets.push(sheet);
  }
  return sheet;
}

function findGoal(sheet, id) {
  return sheet.goals.find(item => item.id === id);
}

function teamMembers() {
  return state.users.filter(user => user.role === "employee" && user.managerId === currentUserId);
}

function totalWeight(goals) {
  return goals.reduce((sum, item) => sum + Number(item.weightage || 0), 0);
}

function currentUser() {
  return state.users.find(user => user.id === currentUserId);
}

function employeeName(id) {
  return state.users.find(user => user.id === id)?.name || "Unknown";
}

function label(role) {
  return role[0].toUpperCase() + role.slice(1);
}

function statusText(status) {
  return status.replace("-", " ").replace(/\b\w/g, char => char.toUpperCase());
}

function audit(action, detail) {
  state.audit.unshift({ at: new Date().toLocaleString(), actor: currentUser().name, action, detail });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

document.addEventListener("click", event => {
  if (event.target.id === "saveActualsBtn") {
    event.preventDefault();
  }
});

document.addEventListener("input", event => {
  const actualId = event.target.dataset.actual;
  if (actualId) findGoal(getSheet(currentUserId), actualId).actuals.Q1.actual = event.target.value;
});

document.addEventListener("change", event => {
  const statusId = event.target.dataset.status;
  if (statusId) findGoal(getSheet(currentUserId), statusId).actuals.Q1.status = event.target.value;
});

init();
