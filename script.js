let ALL_SUBJECTS = [];
let ALL_NOTES = [];
let activeSubject = "all";

const tabsEl = document.getElementById("tabs");
const listEl = document.getElementById("notesList");
const titleEl = document.getElementById("boardTitle");
const countEl = document.getElementById("boardCount");
const emptyEl = document.getElementById("emptyState");
const searchEl = document.getElementById("searchInput");

init();

async function init() {
  try {
    const res = await fetch("notes.json");
    const data = await res.json();
    ALL_SUBJECTS = data.subjects || [];
    ALL_NOTES = data.notes || [];
  } catch (err) {
    listEl.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.textContent = "Couldn't load notes.json. Make sure the file exists next to index.html.";
    console.error(err);
    return;
  }
  renderTabs();
  render();
  searchEl.addEventListener("input", render);
}

function renderTabs() {
  const items = [{ id: "all", label: "All subjects" }, ...ALL_SUBJECTS];
  tabsEl.innerHTML = "";
  items.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.textContent = s.label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(s.id === activeSubject));
    btn.addEventListener("click", () => {
      activeSubject = s.id;
      renderTabs();
      render();
    });
    tabsEl.appendChild(btn);
  });
}

function render() {
  const query = searchEl.value.trim().toLowerCase();

  let notes = ALL_NOTES.filter((n) => activeSubject === "all" || n.subject === activeSubject);
  if (query) {
    notes = notes.filter((n) => n.title.toLowerCase().includes(query));
  }
  notes = notes.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

  const subjectLabel =
    activeSubject === "all"
      ? "All subjects"
      : (ALL_SUBJECTS.find((s) => s.id === activeSubject) || {}).label || activeSubject;
  titleEl.textContent = subjectLabel;
  countEl.textContent = notes.length === 1 ? "1 note" : `${notes.length} notes`;

  listEl.innerHTML = "";
  emptyEl.hidden = notes.length !== 0;

  // While searching, or across all subjects, show a flat list so nothing
  // is ever hidden behind a collapsed topic/subtopic group.
  const useGroups = activeSubject !== "all" && !query;

  if (!useGroups) {
    notes.forEach((note) => listEl.appendChild(renderNoteRow(note)));
    return;
  }

  const { direct, topics } = groupByTopic(notes);

  direct.forEach((note) => listEl.appendChild(renderNoteRow(note)));

  topics.forEach(({ topic, direct: topicDirect, subtopics }) => {
    const details = document.createElement("details");
    details.className = "topic";
    details.open = true;

    const summary = document.createElement("summary");
    summary.className = "topic__summary";
    const topicNoteCount = topicDirect.length + subtopics.reduce((n, s) => n + s.notes.length, 0);
    summary.innerHTML = `<span class="topic__label">${escapeHtml(topic)}</span><span class="topic__count">${topicNoteCount}</span>`;
    details.appendChild(summary);

    const topicList = document.createElement("ul");
    topicList.className = "notes notes--nested";
    topicDirect.forEach((note) => topicList.appendChild(renderNoteRow(note)));
    if (topicDirect.length) details.appendChild(topicList);

    subtopics.forEach(({ subtopic, notes: subNotes }) => {
      const subDetails = document.createElement("details");
      subDetails.className = "subtopic";
      subDetails.open = true;

      const subSummary = document.createElement("summary");
      subSummary.className = "subtopic__summary";
      subSummary.innerHTML = `<span class="topic__label">${escapeHtml(subtopic)}</span><span class="topic__count">${subNotes.length}</span>`;
      subDetails.appendChild(subSummary);

      const subList = document.createElement("ul");
      subList.className = "notes notes--nested";
      subNotes.forEach((note) => subList.appendChild(renderNoteRow(note)));
      subDetails.appendChild(subList);

      details.appendChild(subDetails);
    });

    listEl.appendChild(details);
  });
}

// Splits notes into: those with no `topic` (shown flat), and a list of
// topic groups, each optionally split further into subtopic groups.
function groupByTopic(notes) {
  const direct = [];
  const topicOrder = [];
  const topicMap = new Map();

  notes.forEach((note) => {
    if (!note.topic) {
      direct.push(note);
      return;
    }
    if (!topicMap.has(note.topic)) {
      topicMap.set(note.topic, { topic: note.topic, direct: [], subtopicOrder: [], subtopicMap: new Map() });
      topicOrder.push(note.topic);
    }
    const group = topicMap.get(note.topic);
    if (!note.subtopic) {
      group.direct.push(note);
      return;
    }
    if (!group.subtopicMap.has(note.subtopic)) {
      group.subtopicMap.set(note.subtopic, { subtopic: note.subtopic, notes: [] });
      group.subtopicOrder.push(note.subtopic);
    }
    group.subtopicMap.get(note.subtopic).notes.push(note);
  });

  const topics = topicOrder.map((t) => {
    const group = topicMap.get(t);
    return {
      topic: group.topic,
      direct: group.direct,
      subtopics: group.subtopicOrder.map((s) => group.subtopicMap.get(s)),
    };
  });

  return { direct, topics };
}

function renderNoteRow(note) {
  const li = document.createElement("li");
  li.className = "note";

  const title = document.createElement("span");
  title.className = "note__title";
  title.textContent = note.title;

  const subject = document.createElement("span");
  subject.className = "note__subject";
  subject.textContent = subjectLabelFor(note.subject);

  const date = document.createElement("span");
  date.className = "note__date";
  date.textContent = formatDate(note.date);

  const link = document.createElement("a");
  link.className = "note__link";
  link.href = note.file;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open PDF";

  li.append(title, subject, date, link);
  return li;
}

function subjectLabelFor(id) {
  return (ALL_SUBJECTS.find((s) => s.id === id) || {}).label || id;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
