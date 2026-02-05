"use strict";

// === State === 
let todos = load();

// === DOM ===
const $input = document.getElementById("todoInput");
const $addBtn = document.getElementById("addBtn");
const $list = document.getElementById("todoList");
const $counts = document.getElementById("counts");

// === Init ===
render();

// === Create ===
$addBtn.addEventListener("click", () => {
  const text = $input.value.trim();
  if(!text) return;

  commit([
    ...todos,
    { id: Date.now(), text, done: false, editing: false }
  ]);
  $input.value = "";

});

$input.addEventListener("keydown", (e) => {
  if(e.key === "Enter") $addBtn.click();
});

// === Events (Read/Update/Delete/Toggle) ===
// li内のボタンやチェックを「イベント委譲」で拾う
$list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const li = btn.closest("li");
  const id = Number(li.dataset.id);
  const action = btn.dataset.action;

  if (action === "edit") {
    todos = todos.map((t) =>
    t.id === id ? { ...t, editing: true } : { ...t, editing: false}
  );
  render();

  // 編集inputにフォーカス
  const editInput = li.querySelector('input[type="text"]');
  if(editInput) editInput.focus();
    return;
  }

  if (action === "save") {
    const editInput = li.querySelector('input[type="text"]');
    const newText = editInput.value.trim();
    if(!newText) return;

    commit(
      todos.map((t) =>
        t.id === id ? { ...t, text: newText, editing: false } : t)
    );
    return;
  }


  if (action === "delete") {
    const ok = confirm("本当によろしいですか？");
    if (!ok) return;

    commit(
      todos.filter((t) => t.id !== id)
    );
    return;
  }

});

$list.addEventListener("change", (e) => {
  const checkbox = e.target.closest('input[type="checkbox"]');
  if(!checkbox) return;

  const li = e.target.closest("li");
  const id = Number(li.dataset.id);

  commit(
      todos.map((t) => 
        t.id === id ? { ...t, done: checkbox.checked } : t)
    );
});

// === Render ===
function render() {
  renderCounts();
  renderList();
}

function renderCounts() {
  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const open = total - done;

  $counts.textContent = `全てのタスク：${total}  完了済み：${done}  未完了：${open}`;
}

function renderList() {
  $list.innerHTML = "";

  for(const todo of todos) {
    const li = document.createElement("li");
    li.dataset.id = todo.id;

    if(todo.editing) {
      li.innerHTML = `
      <label class="row">
        <input type="checkbox" ${todo.done ? "checked" : ""} />
        <input class="edit" type="text" value="${escapeHtml(todo.text)}" />
        <button data-action="save">保存</button>
        <button data-action="delete">削除</button>
      </label>
      `;
    } else {
      li.innerHTML = `
      <label class="row">
        <input type="checkbox" ${todo.done ? "checked" : ""} />
        <span class="text ${todo.done ? "done" : ""}">${escapeHtml(todo.text)}</span>
        <button data-action="edit">編集</button>
        <button data-action="delete">削除</button>
      </label>
      `;
    }

    $list.appendChild(li);
  }
}

// === Commit ===
function commit(nextTodos) {
  todos = nextTodos;
  save();
  render();
}

// === Storage ===
function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem("todos");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// === Safety ===
function escapeHtml(str) {
  return str
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
}