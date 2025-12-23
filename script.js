// Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const dateDisplay = document.getElementById('date-display');
const jsonBtn = document.getElementById('json-btn');
const jsonModal = document.getElementById('json-modal');
const closeModal = document.getElementById('close-modal');
const jsonOutput = document.getElementById('json-output');
const copyBtn = document.getElementById('copy-btn');

// State
let tasks = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadDate();
    loadTasks();
});

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
jsonBtn.addEventListener('click', openJsonModal);
closeModal.addEventListener('click', closeJsonModal);
window.addEventListener('click', (e) => {
    if (e.target === jsonModal) closeJsonModal();
});
copyBtn.addEventListener('click', copyJsonToClipboard);

// Functions
function loadDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date().toLocaleDateString('es-ES', options);
    // Capitalize first letter
    dateDisplay.textContent = date.charAt(0).toUpperCase() + date.slice(1);
}

function loadTasks() {
    const storedTasks = localStorage.getItem('premiumTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    render();
}

function saveTasks() {
    localStorage.setItem('premiumTasks', JSON.stringify(tasks));
    render();
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.unshift(newTask); // Add to top
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
}

function render() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.classList.add('visible');
    } else {
        emptyState.classList.remove('visible');

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onclick="toggleTask(${task.id})">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})" aria-label="Eliminar tarea">
                    <span class="material-icons-round">delete_outline</span>
                </button>
            `;

            taskList.appendChild(li);
        });
    }
}

// Utility to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal Functions
function openJsonModal() {
    const jsonString = JSON.stringify(tasks, null, 4);
    jsonOutput.textContent = jsonString;
    jsonModal.classList.add('visible');
}

function closeJsonModal() {
    jsonModal.classList.remove('visible');
}

function copyJsonToClipboard() {
    const text = jsonOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '¡Copiado!';
        copyBtn.style.background = 'var(--success)';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

// Expose functions to global scope for inline onclick handlers
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
