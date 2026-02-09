class DataManager {
    constructor() {
        this.key = 'studybuddy_data';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.key)) {
            localStorage.setItem(this.key, JSON.stringify({
                subjects: [],
                schedules: [],
                tasks: [],
                settings: { theme: 'light', remindersEnabled: true, reminderTime: '09:00' }
            }));
        }
    }

    get() {
        return JSON.parse(localStorage.getItem(this.key));
    }

    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    getSubjects() {
        return this.get().subjects;
    }

    addSubject(s) {
        const data = this.get();
        s.id = Date.now();
        data.subjects.push(s);
        this.save(data);
    }

    updateSubject(id, updates) {
        const data = this.get();
        const idx = data.subjects.findIndex(s => s.id === id);
        if (idx !== -1) {
            data.subjects[idx] = { ...data.subjects[idx], ...updates };
            this.save(data);
        }
    }

    deleteSubject(id) {
        const data = this.get();
        data.subjects = data.subjects.filter(s => s.id !== id);
        this.save(data);
    }

    getSchedules() {
        return this.get().schedules;
    }

    addSchedule(s) {
        const data = this.get();
        s.id = Date.now();
        data.schedules.push(s);
        this.save(data);
    }

    updateSchedule(id, updates) {
        const data = this.get();
        const idx = data.schedules.findIndex(s => s.id === id);
        if (idx !== -1) {
            data.schedules[idx] = { ...data.schedules[idx], ...updates };
            this.save(data);
        }
    }

    deleteSchedule(id) {
        const data = this.get();
        data.schedules = data.schedules.filter(s => s.id !== id);
        this.save(data);
    }

    getTasks() {
        return this.get().tasks;
    }

    addTask(t) {
        const data = this.get();
        t.id = Date.now();
        t.completed = false;
        data.tasks.push(t);
        this.save(data);
    }

    updateTask(id, updates) {
        const data = this.get();
        const idx = data.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            data.tasks[idx] = { ...data.tasks[idx], ...updates };
            this.save(data);
        }
    }

    deleteTask(id) {
        const data = this.get();
        data.tasks = data.tasks.filter(t => t.id !== id);
        this.save(data);
    }

    toggleTask(id) {
        const data = this.get();
        const task = data.tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
        this.save(data);
    }

    getSettings() {
        return this.get().settings;
    }

    updateSettings(s) {
        const data = this.get();
        data.settings = { ...data.settings, ...s };
        this.save(data);
    }

    export() {
        return JSON.stringify(this.get(), null, 2);
    }

    import(json) {
        try {
            const data = JSON.parse(json);
            this.save(data);
            return true;
        } catch (e) {
            return false;
        }
    }

    reset() {
        localStorage.removeItem(this.key);
        this.init();
    }
}

class App {
    constructor() {
        this.db = new DataManager();
        this.editId = null;
        this.filter = 'all';
        this.init();
    }

    init() {
        this.setupListeners();
        this.loadSettings();
        this.renderDash();
    }

    setupListeners() {
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', (e) => this.goTo(e.target.dataset.section));
        });

        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('themeSelect').addEventListener('change', (e) => this.setTheme(e.target.value));

        document.getElementById('addSubjectBtn').addEventListener('click', () => this.newSubject());
        document.getElementById('subjectForm').addEventListener('submit', (e) => this.saveSubject(e));

        document.getElementById('addScheduleBtn').addEventListener('click', () => this.newSchedule());
        document.getElementById('scheduleForm').addEventListener('submit', (e) => this.saveSchedule(e));
        document.getElementById('scheduleDate').addEventListener('change', () => this.renderSchedules());

        document.getElementById('addTaskBtn').addEventListener('click', () => this.newTask());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.saveTask(e));

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.filter));
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleView(e.target.dataset.view));
        });

        document.querySelectorAll('.close, .close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            if (confirm('This will delete all data. Continue?')) {
                this.db.reset();
                location.reload();
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) this.closeModal(e.target);
        });

        // Request notification permission if enabled
        if (this.db.getSettings().remindersEnabled && 'Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }

        // Check for reminders every minute
        setInterval(() => this.checkReminders(), 60000);
    }

    loadSettings() {
        const s = this.db.getSettings();
        document.getElementById('themeSelect').value = s.theme;
        document.getElementById('reminderToggle').checked = s.remindersEnabled;
        document.getElementById('reminderTime').value = s.reminderTime;
        if (s.theme !== 'auto') this.setTheme(s.theme);
    }

    toggleTheme() {
        const dark = document.body.classList.toggle('dark-theme');
        this.db.updateSettings({ theme: dark ? 'dark' : 'light' });
        document.getElementById('themeSelect').value = dark ? 'dark' : 'light';
    }

    setTheme(t) {
        if (t === 'auto') {
            document.body.classList.toggle('dark-theme', window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
            document.body.classList.toggle('dark-theme', t === 'dark');
        }
        this.db.updateSettings({ theme: t });
    }

    goTo(name) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(name).classList.add('active');

        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-section="${name}"]`).classList.add('active');

        if (name === 'dashboard') this.renderDash();
        else if (name === 'subjects') this.renderSubjects();
        else if (name === 'schedule') { this.renderSchedules(); this.renderWeekly(); }
        else if (name === 'tasks') this.renderTasks();
        else if (name === 'analytics') this.renderAnalytics();
    }

    renderDash() {
        const subs = this.db.getSubjects();
        const tasks = this.db.getTasks();
        const scheds = this.db.getSchedules();
        const today = new Date().toISOString().split('T')[0];

        document.getElementById('totalSubjects').textContent = subs.length;
        const upDue = tasks.filter(t => t.deadline >= today && !t.completed).length;
        document.getElementById('upcomingDeadlines').textContent = upDue;
        const done = tasks.filter(t => t.completed).length;
        document.getElementById('tasksCompleted').textContent = done;
        const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
        document.getElementById('studyProgress').textContent = pct + '%';

        const todayScheds = scheds.filter(s => s.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const schedCont = document.getElementById('todaySchedule');

        if (todayScheds.length === 0) {
            schedCont.innerHTML = '<p class="empty-message">No classes scheduled for today</p>';
        } else {
            schedCont.innerHTML = todayScheds.map(s => `
                <div class="schedule-item">
                    <div class="schedule-item-header">
                        <div>
                            <div class="schedule-item-title">${this.getSubName(s.subjectId)}</div>
                            <div class="schedule-item-time">⏰ ${s.startTime} - ${s.endTime}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        const upTasks = tasks.filter(t => t.deadline >= today && !t.completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);
        const tasksCont = document.getElementById('upcomingTasks');
        if (upTasks.length === 0) {
            tasksCont.innerHTML = '<p class="empty-message">No upcoming deadlines</p>';
        } else {
            tasksCont.innerHTML = upTasks.map(t => `
                <div class="task-item">
                    <div class="task-item-header">
                        <div>
                            <div class="task-item-title">${t.title}</div>
                            <div class="schedule-item-time">📚 ${this.getSubName(t.subjectId)} • 📅 ${this.fmtDate(t.deadline)}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    newSubject(id = null) {
        this.editId = id;
        const form = document.getElementById('subjectForm');

        if (id) {
            const s = this.db.getSubjects().find(x => x.id === id);
            document.getElementById('subjectName').value = s.name;
            document.getElementById('subjectColor').value = s.color;
            document.getElementById('subjectPriority').value = s.priority;
            document.querySelector('#subjectForm button[type="submit"]').textContent = 'Update';
        } else {
            form.reset();
            document.getElementById('subjectColor').value = '#4CAF50';
            document.querySelector('#subjectForm button[type="submit"]').textContent = 'Save';
        }
        this.openModal('subjectModal');
    }

    saveSubject(e) {
        e.preventDefault();
        const s = {
            name: document.getElementById('subjectName').value,
            color: document.getElementById('subjectColor').value,
            priority: document.getElementById('subjectPriority').value
        };

        if (this.editId) this.db.updateSubject(this.editId, s);
        else this.db.addSubject(s);

        this.closeModal(document.getElementById('subjectModal'));
        this.renderSubjects();
        this.updateSubSelects();
        this.renderDash();
    }

    deleteSubject(id) {
        if (confirm('Delete this subject?')) {
            this.db.deleteSubject(id);
            this.renderSubjects();
            this.updateSubSelects();
        }
    }

    renderSubjects() {
        const subs = this.db.getSubjects();
        const cont = document.getElementById('subjectsContainer');

        if (subs.length === 0) {
            cont.innerHTML = '<p class="empty-message">No subjects yet. Add one to start!</p>';
            return;
        }

        cont.innerHTML = subs.map(s => `
            <div class="subject-card">
                <div class="subject-color-bar" style="background-color: ${s.color};"></div>
                <div class="subject-name">${s.name}</div>
                <span class="subject-priority priority-${s.priority}">${s.priority}</span>
                <div class="subject-actions">
                    <button class="edit-subject-btn" onclick="app.newSubject(${s.id})">Edit</button>
                    <button class="delete-subject-btn" onclick="app.deleteSubject(${s.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    newSchedule(id = null) {
        this.editId = id;
        const form = document.getElementById('scheduleForm');

        if (id) {
            const s = this.db.getSchedules().find(x => x.id === id);
            document.getElementById('scheduleSubject').value = s.subjectId;
            document.getElementById('scheduleDate2').value = s.date;
            document.getElementById('scheduleStartTime').value = s.startTime;
            document.getElementById('scheduleEndTime').value = s.endTime;
            document.querySelector('#scheduleForm button[type="submit"]').textContent = 'Update';
        } else {
            form.reset();
            document.getElementById('scheduleDate2').valueAsDate = new Date();
            document.querySelector('#scheduleForm button[type="submit"]').textContent = 'Save';
        }

        this.updateSubSelects();
        this.openModal('scheduleModal');
    }

    saveSchedule(e) {
        e.preventDefault();
        const s = {
            subjectId: parseInt(document.getElementById('scheduleSubject').value),
            date: document.getElementById('scheduleDate2').value,
            startTime: document.getElementById('scheduleStartTime').value,
            endTime: document.getElementById('scheduleEndTime').value
        };

        const other = this.db.getSchedules().filter(x => x.date === s.date && x.id !== this.editId);
        const conflict = other.some(x => s.startTime < x.endTime && s.endTime > x.startTime);

        if (conflict && !confirm('This conflicts with another class. Continue?')) return;

        if (this.editId) this.db.updateSchedule(this.editId, s);
        else this.db.addSchedule(s);

        this.closeModal(document.getElementById('scheduleModal'));
        this.renderSchedules();
        this.renderWeekly();
        this.renderDash();
    }

    deleteSchedule(id) {
        if (confirm('Delete this schedule?')) {
            this.db.deleteSchedule(id);
            this.renderSchedules();
            this.renderWeekly();
        }
    }

    renderSchedules() {
        const scheds = this.db.getSchedules();
        const sel = document.getElementById('scheduleDate').value || new Date().toISOString().split('T')[0];
        const day = scheds.filter(s => s.date === sel).sort((a, b) => a.startTime.localeCompare(b.startTime));

        const cont = document.getElementById('scheduleList');

        if (day.length === 0) {
            cont.innerHTML = '<p class="empty-message">No schedule for this date</p>';
            return;
        }

        cont.innerHTML = day.map(s => `
            <div class="schedule-item">
                <div class="schedule-item-header">
                    <div>
                        <div class="schedule-item-title">${this.getSubName(s.subjectId)}</div>
                        <div class="schedule-item-time">⏰ ${s.startTime} - ${s.endTime}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="task-btn" onclick="app.newSchedule(${s.id})" title="Edit">✏️</button>
                        <button class="task-btn" onclick="app.deleteSchedule(${s.id})" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderWeekly() {
        const scheds = this.db.getSchedules();
        const today = new Date();
        const start = new Date(today.setDate(today.getDate() - today.getDay()));
        const days = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(d);
        }

        const cont = document.getElementById('weeklySchedule');
        const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        cont.innerHTML = days.map((d, idx) => {
            const ds = d.toISOString().split('T')[0];
            const day = scheds.filter(s => s.date === ds);

            return `
                <div class="weekly-day">
                    <div class="weekly-day-name">${names[idx]}</div>
                    <div class="weekly-day-date">${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem;">
                        ${day.length === 0 ? '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center;">No classes</p>' : ''}
                        ${day.map(s => `
                            <div style="padding: 0.5rem; background-color: var(--bg-secondary); border-radius: 0.375rem; font-size: 0.8rem; border-left: 3px solid var(--primary);">
                                <strong>${this.getSubName(s.subjectId)}</strong>
                                <div style="color: var(--text-secondary); font-size: 0.75rem;">${s.startTime} - ${s.endTime}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    newTask(id = null) {
        this.editId = id;
        const form = document.getElementById('taskForm');

        if (id) {
            const t = this.db.getTasks().find(x => x.id === id);
            document.getElementById('taskTitle').value = t.title;
            document.getElementById('taskSubject').value = t.subjectId;
            document.getElementById('taskType').value = t.type;
            document.getElementById('taskDeadline').value = t.deadline;
            document.querySelector('#taskForm button[type="submit"]').textContent = 'Update';
        } else {
            form.reset();
            document.getElementById('taskDeadline').valueAsDate = new Date();
            document.querySelector('#taskForm button[type="submit"]').textContent = 'Save';
        }

        this.updateSubSelects();
        this.openModal('taskModal');
    }

    saveTask(e) {
        e.preventDefault();
        const t = {
            title: document.getElementById('taskTitle').value,
            subjectId: parseInt(document.getElementById('taskSubject').value),
            type: document.getElementById('taskType').value,
            deadline: document.getElementById('taskDeadline').value
        };

        if (this.editId) this.db.updateTask(this.editId, t);
        else this.db.addTask(t);

        this.closeModal(document.getElementById('taskModal'));
        this.renderTasks();
        this.renderAnalytics();
        this.renderDash();
    }

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            this.db.deleteTask(id);
            this.renderTasks();
            this.renderAnalytics();
        }
    }

    toggleTaskComplete(id) {
        this.db.toggleTask(id);
        this.renderTasks();
        this.renderAnalytics();
        this.renderDash();
    }

    filterTasks(f) {
        this.filter = f;
        this.renderTasks();

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-filter="${f}"]`).classList.add('active');
    }

    renderTasks() {
        const tasks = this.db.getTasks();
        const cont = document.getElementById('tasksList');

        let filtered = tasks;
        if (this.filter === 'pending') filtered = tasks.filter(t => !t.completed);
        else if (this.filter === 'completed') filtered = tasks.filter(t => t.completed);

        if (filtered.length === 0) {
            cont.innerHTML = '<p class="empty-message">No tasks</p>';
            return;
        }

        cont.innerHTML = filtered.map(t => `
            <div class="task-item" style="opacity: ${t.completed ? '0.7' : '1'}; border-left-color: ${t.completed ? 'var(--success)' : 'var(--primary)'}">
                <div class="task-item-header">
                    <div style="display: flex; align-items: start; gap: 1rem; flex: 1;">
                        <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} onchange="app.toggleTaskComplete(${t.id})" style="margin-top: 0.25rem;">
                        <div style="flex: 1;">
                            <div class="task-item-title" style="text-decoration: ${t.completed ? 'line-through' : 'none'}">${t.title}</div>
                            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; font-size: 0.85rem; color: var(--text-secondary);">
                                <span>📚 ${this.getSubName(t.subjectId)}</span>
                                <span style="text-transform: capitalize;">📝 ${t.type}</span>
                                <span>📅 ${this.fmtDate(t.deadline)}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="task-btn" onclick="app.newTask(${t.id})" title="Edit">✏️</button>
                        <button class="task-btn" onclick="app.deleteTask(${t.id})" title="Delete">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAnalytics() {
        const tasks = this.db.getTasks();
        const subs = this.db.getSubjects();

        const cont = document.getElementById('analyticsContainer');

        if (tasks.length === 0) {
            cont.innerHTML = '<p class="empty-message">No data yet</p>';
            return;
        }

        const done = tasks.filter(t => t.completed).length;
        const donetoPct = (done / tasks.length * 100).toFixed(1);
        const bySubject = {};

        subs.forEach(s => {
            const st = tasks.filter(t => t.subjectId === s.id);
            const c = st.filter(t => t.completed).length;
            bySubject[s.name] = { total: st.length, completed: c, pct: st.length > 0 ? (c / st.length * 100).toFixed(1) : 0 };
        });

        cont.innerHTML = `
            <div class="analytics-card">
                <h3>Overall Progress</h3>
                <div style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>${done} of ${tasks.length} completed</span>
                        <strong>${donetoPct}%</strong>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${donetoPct}%"></div>
                    </div>
                </div>
            </div>

            <div class="analytics-card">
                <h3>By Subject</h3>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                    ${Object.entries(bySubject).map(([name, data]) => `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span>${name}</span>
                                <strong>${data.completed}/${data.total}</strong>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${data.pct}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateSubSelects() {
        const subs = this.db.getSubjects();
        const opts = subs.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        document.getElementById('scheduleSubject').innerHTML = '<option value="">Select Subject</option>' + opts;
        document.getElementById('taskSubject').innerHTML = '<option value="">Select Subject</option>' + opts;
    }

    getSubName(id) {
        const s = this.db.getSubjects().find(x => x.id === id);
        return s ? s.name : 'Unknown';
    }

    fmtDate(d) {
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    toggleView(v) {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-view="${v}"]`).classList.add('active');

        document.getElementById('dailyView').style.display = v === 'daily' ? 'block' : 'none';
        document.getElementById('weeklyView').style.display = v === 'weekly' ? 'block' : 'none';

        if (v === 'weekly') this.renderWeekly();
        else this.renderSchedules();
    }

    openModal(id) {
        document.getElementById(id).style.display = 'block';
    }

    closeModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    exportData() {
        const data = this.db.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'studybuddy_export.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            if (this.db.import(evt.target.result)) {
                alert('Data imported!');
                location.reload();
            } else {
                alert('Invalid file');
            }
        };
        reader.readAsText(file);
    }

    checkReminders() {
        const settings = this.db.getSettings();
        if (!settings.remindersEnabled) return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        if (currentTime === settings.reminderTime) {
            const today = now.toISOString().split('T')[0];
            const tasks = this.db.getTasks();
            const dueToday = tasks.filter(t => t.deadline === today && !t.completed).length;

            if (dueToday > 0) {
                this.sendNotification(`StudyBuddy Reminder`, `You have ${dueToday} tasks due today! Stay focused! 🎯`);
            } else {
                this.sendNotification(`StudyBuddy Reminder`, `Time to study! Check your schedule for today.`);
            }
        }
    }

    sendNotification(title, body) {
        if (!('Notification' in window)) {
            alert(title + '\n' + body); // Fallback for browsers without notification support
            return;
        }

        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: 'favicon.ico' });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body, icon: 'favicon.ico' });
                }
            });
        }
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
