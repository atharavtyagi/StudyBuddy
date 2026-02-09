# StudyBuddy - Smart Study Planner

Deployed Link: https://github.com/atharavtyagi/StudyBuddy

## 📌 Project Overview
StudyBuddy is a Smart Study Planner web application designed to help students organize their academic life efficiently. Built using **HTML5, CSS3, and Vanilla JavaScript**, it features a comprehensive suite of tools including subject management, schedule planning, task tracking, and progress analytics. All data is persisted locally using browser **LocalStorage**, ensuring your information is saved even after refreshing the page or restarting the browser.

## 🚀 Key Features

### 1. 📊 Dashboard
- Real-time overview of your study stats (Total Subjects, Upcoming Deadlines, Tasks Completed, Study Progress).
- "Today's Schedule" view for quick access to classes.
- "Upcoming Deadlines" list to keep track of urgent tasks.

### 2. 📚 Subject Management
- Add, edit, and delete subjects.
- Assign priorities (Low, Medium, High) and custom colors for easy identification.

### 3. 🗓️ Schedule Planner
- Create daily schedules for your classes/study sessions.
- **Daily View:** Focus on today's agenda.
- **Weekly View:** Visual timetable for the entire week.
- Conflict detection alerts you if you try to schedule overlapping sessions.

### 4. ✅ Task Manager
- Track assignments, exams, and projects.
- Categorize tasks by type (Assignment, Exam, Project, Other).
- Filter tasks by "All", "Pending", or "Completed".
- Mark tasks as complete to update your progress analytics.

### 5. 📈 Progress Analytics
- Visual charts showing completion rates by subject.
- Summary statistics including total study hours (calculated from completed schedules) and task completion percentage.

### 6. ⚙️ Settings & Data Management
- **Theme Toggle:** Switch between Light and Dark modes (or auto-detect system preference).
- **Reminders:** Enable/disable browser notifications (simulated).
- **Data Export/Import:** Backup your data to a JSON file and restore it on another device.
- **Reset Data:** Clear all local storage data to start fresh.

## 🛠️ Technical Implementation
- **Data Persistence:** Uses `localStorage` to save all user data (`subjects`, `schedules`, `tasks`, `settings`).
- **Architecture:** 
  - `index.html`: Structure and layout.
  - `styles.css`: Custom CSS for responsive design, theming, and animations.
  - `app.js`: Core logic handling data manipulation (`DataManager` class) and UI interactions (`App` class).
- **No Frameworks:** Pure Vanilla JavaScript without any external libraries like React, jQuery, or Bootstrap.

## 📦 File Structure
```
smart-study-planner/
├── index.html       # Main application structure
├── styles.css       # All styles and themes
├── app.js           # Application logic and local storage handling
└── README.md        # Project documentation
```

## 🚀 How to Run Locally
1. **Download** or **Clone** the repository.
2. Open the folder in your file explorer.
3. Double-click `index.html` to open it in your default web browser.
   - Alternatively, use a local server (e.g., VS Code "Live Server" extension) for a better development experience.



