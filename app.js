/* === GLOBAL VARIABLES === */
// Task management array - stores all tasks in memory
let tasks = [];

// Current chart instance for statistics
let currentChart = null;

// Theme state management
let currentTheme = 'dark';

// Profile data storage
let profileData = {
  name: 'John Doe',
  picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
};

// Analytics data
let analytics = {
  completionRate: 0,
  productivityScore: 0,
  currentStreak: 0
};

/* === INITIALIZATION === */
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Schedulr initialized successfully!');
  loadSampleData(); // Load some sample tasks for demonstration
  updateDashboard(); // Update dashboard statistics
  updateTasksList(); // Render tasks list
  initializeChart(); // Initialize statistics chart
  loadProfileData(); // Load profile information
  updateAnalytics(); // Update analytics data
  
  // Set minimum date to today for new tasks
  document.getElementById('taskDate').min = new Date().toISOString().split('T')[0];
  
  // Set RGB values for bg-primary
  document.documentElement.style.setProperty('--bg-primary-rgb', currentTheme === 'dark' ? '18, 18, 18' : '255, 255, 255');
});

/* === THEME MANAGEMENT === */
// Toggle between light and dark themes with smooth animation
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  
  // Add loading animation to theme toggle button
  themeToggle.innerHTML = '<div class="loading"></div>';
  
  setTimeout(() => {
      if (currentTheme === 'light') {
          body.setAttribute('data-theme', 'dark');
          themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
          currentTheme = 'dark';
          document.documentElement.style.setProperty('--bg-primary-rgb', '18, 18, 18');
          showNotification('Dark mode activated', 'info', 'far fa-moon');
      } else {
          body.setAttribute('data-theme', 'light');
          themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
          currentTheme = 'light';
          document.documentElement.style.setProperty('--bg-primary-rgb', '255, 255, 255');
          showNotification('Light mode activated', 'info', 'far fa-sun');
      }
  }, 500);
}

/* === NAVIGATION MANAGEMENT === */
// Show specific section and update navigation state
function showSection(sectionName) {
  console.log(`📱 Navigating to section: ${sectionName}`);
  
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
      section.classList.remove('active');
  });
  
  // Remove active state from all navigation buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
      btn.classList.remove('active');
  });
  
  // Show selected section with animation
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
      targetSection.classList.add('active');
      
      // Add active state to corresponding navigation button
      event.target.classList.add('active');
      
      // Update chart if statistics section is shown
      if (sectionName === 'statistics') {
          updateChart();
          updateAnalytics();
      }
  }
}

/* === TASK MANAGEMENT === */
// Handle task form submission
document.getElementById('taskForm').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log('📝 Adding new task...');
  
  // Get form values
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const dueDate = document.getElementById('taskDate').value;
  
  // Validate required fields
  if (!title || !dueDate) {
      showNotification('Please fill in all required fields', 'error', 'fas fa-exclamation-circle');
      return;
  }
  
  // Create new task object
  const newTask = {
      id: Date.now(), // Simple ID generation using timestamp
      title: title,
      description: description,
      dueDate: dueDate,
      status: 'pending', // Default status
      createdAt: new Date().toISOString()
  };
  
  // Add task to array
  tasks.push(newTask);
  console.log('✅ Task added successfully:', newTask);
  
  // Reset form
  this.reset();
  document.getElementById('taskDate').min = new Date().toISOString().split('T')[0];
  
  // Update UI
  updateDashboard();
  updateTasksList();
  updateAnalytics();
  
  // Show success notification
  showNotification('Task added successfully', 'success', 'fas fa-check-circle');
  
  // Trigger confetti animation
  createConfetti();
});

// Update dashboard statistics
function updateDashboard() {
  console.log('📊 Updating dashboard statistics...');
  
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const pending = tasks.filter(task => task.status === 'pending').length;
  
  // Animate number changes
  animateNumber('totalTasks', total);
  animateNumber('completedTasks', completed);
  animateNumber('pendingTasks', pending);
  
  console.log(`📈 Stats updated - Total: ${total}, Completed: ${completed}, Pending: ${pending}`);
}

// Update analytics data
function updateAnalytics() {
  console.log('📈 Updating analytics...');
  
  // Calculate completion rate (percentage of completed tasks)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  analytics.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate productivity score (0-100)
  const completedOnTime = tasks.filter(task => 
      task.status === 'completed' && 
      new Date(task.createdAt) <= new Date(task.dueDate)
  ).length;
  analytics.productivityScore = totalTasks > 0 ? Math.min(Math.round((completedOnTime / totalTasks) * 100), 100) : 0;
  
  // Calculate current streak (consecutive days with completed tasks)
  // This is a simplified version - in a real app you'd track actual completion dates
  const recentCompleted = tasks.filter(task => 
      task.status === 'completed' && 
      isWithinLastWeek(task.createdAt)
  ).length;
  analytics.currentStreak = Math.min(Math.floor(recentCompleted / 2), 30); // Max 30 days
  
  // Update UI
  animateNumber('completionRate', analytics.completionRate, '%');
  animateNumber('productivityScore', analytics.productivityScore);
  animateNumber('currentStreak', analytics.currentStreak, ' days');
  
  // Animate progress bars
  animateProgressBar('completionBar', analytics.completionRate);
  animateProgressBar('productivityBar', analytics.productivityScore);
  animateProgressBar('streakBar', (analytics.currentStreak / 30) * 100);
}

// Helper function to check if date is within last week
function isWithinLastWeek(dateString) {
  const date = new Date(dateString);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return date >= oneWeekAgo;
}

// Animate progress bar
function animateProgressBar(elementId, percentage) {
  const bar = document.getElementById(elementId);
  if (bar) {
      bar.style.width = '0';
      setTimeout(() => {
          bar.style.width = `${percentage}%`;
      }, 100);
  }
}

// Animate number counting effect
function animateNumber(elementId, targetNumber, suffix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startNumber = parseInt(element.textContent) || 0;
  const duration = 1000; // Animation duration in milliseconds
  const steps = 30; // Number of animation steps
  const increment = (targetNumber - startNumber) / steps;
  
  let currentNumber = startNumber;
  let step = 0;
  
  const timer = setInterval(() => {
      step++;
      currentNumber += increment;
      
      if (step >= steps) {
          currentNumber = targetNumber;
          clearInterval(timer);
      }
      
      element.textContent = Math.round(currentNumber) + suffix;
  }, duration / steps);
}

// Update tasks list display
function updateTasksList() {
  console.log('📋 Updating tasks list...');
  
  const tasksList = document.getElementById('tasksList');
  
  // Clear existing tasks
  tasksList.innerHTML = '';
  
  // Check if no tasks exist
  if (tasks.length === 0) {
      tasksList.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
              <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
              <h3>No tasks yet!</h3>
              <p>Add your first task above to get started.</p>
          </div>
      `;
      return;
  }
  
  // Sort tasks by due date (earliest first)
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  // Render each task
  sortedTasks.forEach((task, index) => {
      const taskElement = createTaskElement(task, index);
      tasksList.appendChild(taskElement);
  });
}

// Create individual task element
function createTaskElement(task, index) {
  const taskDiv = document.createElement('div');
  taskDiv.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
  taskDiv.style.animationDelay = `${index * 0.1}s`;
  
  // Format due date for display
  const dueDate = new Date(task.dueDate);
  const formattedDate = dueDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
  });
  
  // Check if task is overdue
  const today = new Date();
  const isOverdue = dueDate < today && task.status !== 'completed';
  
  taskDiv.innerHTML = `
      <div class="task-header">
          <div>
              <div class="task-title">${task.title}</div>
              ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
          </div>
          <div class="task-actions">
              ${task.status === 'pending' ? 
                  `<button class="task-btn complete-btn" onclick="toggleTaskStatus(${task.id})" title="Mark as Complete">
                      <i class="fas fa-check"></i>
                  </button>` : 
                  `<button class="task-btn complete-btn" onclick="toggleTaskStatus(${task.id})" title="Mark as Pending">
                      <i class="fas fa-undo"></i>
                  </button>`
              }
              <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                  <i class="fas fa-trash"></i>
              </button>
          </div>
      </div>
      <div class="task-meta">
          <div class="task-date ${isOverdue ? 'overdue' : ''}">
              <i class="far fa-calendar"></i> 
              Due: ${formattedDate}
              ${isOverdue ? ' <span style="color: var(--danger); font-weight: bold;">(Overdue)</span>' : ''}
          </div>
          <div class="task-status status-${task.status}">
              ${task.status === 'completed' ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-clock"></i>'}
              ${task.status}
          </div>
      </div>
  `;
  
  return taskDiv;
}

// Toggle task completion status
function toggleTaskStatus(taskId) {
  console.log(`🔄 Toggling status for task ID: ${taskId}`);
  
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
      console.error('❌ Task not found!');
      return;
  }
  
  const task = tasks[taskIndex];
  const wasCompleted = task.status === 'completed';
  
  // Toggle status
  task.status = wasCompleted ? 'pending' : 'completed';
  task.updatedAt = new Date().toISOString();
  
  console.log(`✅ Task status updated:`, task);
  
  // Update UI
  updateDashboard();
  updateTasksList();
  updateAnalytics();
  
  // Show appropriate notification and animation
  if (task.status === 'completed') {
      showNotification('Task completed! Great job!', 'success', 'fas fa-check-circle');
      showSuccessBadge();
      createConfetti();
  } else {
      showNotification('Task marked as pending', 'info', 'far fa-clock');
  }
}

// Delete task with confirmation
function deleteTask(taskId) {
  console.log(`🗑️ Attempting to delete task ID: ${taskId}`);
  
  // Find task for confirmation message
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
      console.error('❌ Task not found!');
      return;
  }
  
  // Confirm deletion
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      // Remove task from array
      tasks = tasks.filter(t => t.id !== taskId);
      console.log('✅ Task deleted successfully');
      
      // Update UI
      updateDashboard();
      updateTasksList();
      updateAnalytics();
      
      // Show notification
      showNotification('Task deleted', 'info', 'fas fa-trash-alt');
  }
}

/* === STATISTICS CHART MANAGEMENT === */
// Initialize chart
function initializeChart() {
  console.log('📊 Initializing statistics chart...');
  
  const ctx = document.getElementById('statsChart').getContext('2d');
  
  // Initial chart configuration for pie chart
  currentChart = new Chart(ctx, {
      type: 'pie',
      data: getChartData(),
      options: getChartOptions('pie')
  });
}

// Get chart data based on current tasks
function getChartData() {
  const completed = tasks.filter(task => task.status === 'completed').length;
  const pending = tasks.filter(task => task.status === 'pending').length;
  
  return {
      labels: ['Completed Tasks', 'Pending Tasks'],
      datasets: [{
          data: [completed, pending],
          backgroundColor: [
              'rgba(40, 167, 69, 0.7)',
              'rgba(255, 193, 7, 0.7)'
          ],
          borderColor: [
              'rgba(40, 167, 69, 1)',
              'rgba(255, 193, 7, 1)'
          ],
          borderWidth: 1
      }]
  };
}

// Get chart options based on chart type
function getChartOptions(type) {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
  
  const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: {
              position: 'bottom',
              labels: {
                  padding: 20,
                  usePointStyle: true,
                  color: textColor,
                  font: {
                      family: 'Inter, sans-serif'
                  }
              }
          },
          tooltip: {
              backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim(),
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: gridColor,
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              usePointStyle: true,
              callbacks: {
                  label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} (${percentage}%)`;
                  }
              }
          }
      }
  };
  
  if (type === 'pie') {
      return {
          ...baseOptions,
          plugins: {
              ...baseOptions.plugins,
              title: {
                  display: true,
                  text: 'Task Completion Overview',
                  color: textColor,
                  font: {
                      size: 16,
                      weight: '600',
                      family: 'Inter, sans-serif'
                  },
                  padding: {
                      top: 10,
                      bottom: 20
                  }
              }
          }
      };
  } else if (type === 'bar' || type === 'line') {
      return {
          ...baseOptions,
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: {
                      color: textColor,
                      font: {
                          family: 'Inter, sans-serif'
                      }
                  },
                  grid: {
                      color: gridColor,
                      drawBorder: false
                  }
              },
              x: {
                  ticks: {
                      color: textColor,
                      font: {
                          family: 'Inter, sans-serif'
                      }
                  },
                  grid: {
                      color: 'transparent',
                      drawBorder: false
                  }
              }
          },
          plugins: {
              ...baseOptions.plugins,
              title: {
                  display: true,
                  text: 'Task Statistics',
                  color: textColor,
                  font: {
                      size: 16,
                      weight: '600',
                      family: 'Inter, sans-serif'
                  },
                  padding: {
                      top: 10,
                      bottom: 20
                  }
              }
          }
      };
  }
  
  return baseOptions;
}

// Change chart type (pie, bar, line)
function changeChartType(type) {
  console.log(`📊 Changing chart type to: ${type}`);
  
  // Update active button state
  document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Destroy existing chart
  if (currentChart) {
      currentChart.destroy();
  }
  
  // Create new chart with selected type
  const ctx = document.getElementById('statsChart').getContext('2d');
  currentChart = new Chart(ctx, {
      type: type,
      data: getChartData(),
      options: getChartOptions(type)
  });
  
  showNotification(`Switched to ${type} chart view`, 'info', 'fas fa-chart-bar');
}

// Update chart data
function updateChart() {
  if (currentChart) {
      currentChart.data = getChartData();
      currentChart.update('active'); // Smooth animation
      console.log('📊 Chart data updated');
  }
}

/* === NOTIFICATION SYSTEM === */
// Show notification with type and auto-dismiss
function showNotification(message, type = 'info', icon = 'fas fa-info-circle') {
  console.log(`🔔 Showing notification: ${message} (${type})`);
  
  const container = document.getElementById('notificationContainer');
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Current time for notification
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  notification.innerHTML = `
      <i class="${icon} notification-icon"></i>
      <div class="notification-content">
          <div class="notification-message">${message}</div>
          <div class="notification-time">${timeString}</div>
      </div>
  `;
  
  // Add click to dismiss functionality
  notification.addEventListener('click', function() {
      dismissNotification(notification);
  });
  
  // Add to container
  container.appendChild(notification);
  
  // Trigger show animation
  setTimeout(() => {
      notification.classList.add('show');
  }, 100);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
      dismissNotification(notification);
  }, 5000);
}

// Dismiss notification with animation
function dismissNotification(notification) {
  if (!notification) return;
  
  // Add fade out animation
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(100px)';
  
  // Remove from DOM after animation
  setTimeout(() => {
      if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
      }
  }, 300);
}

/* === ANIMATION EFFECTS === */
// Create confetti animation
function createConfetti() {
  console.log('🎉 Creating confetti animation...');
  
  for (let i = 0; i < 50; i++) {
      setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.width = Math.random() * 10 + 5 + 'px';
          confetti.style.height = Math.random() * 10 + 5 + 'px';
          confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
          confetti.style.animationDelay = (Math.random() * 0.5) + 's';
          
          // Random shape
          confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
          
          document.body.appendChild(confetti);
          
          // Remove confetti after animation
          setTimeout(() => {
              if (confetti.parentNode) {
                  confetti.parentNode.removeChild(confetti);
              }
          }, 3000);
      }, i * 50);
  }
}

// Show success badge animation
function showSuccessBadge() {
  const badge = document.getElementById('successBadge');
  badge.classList.add('show');
  
  setTimeout(() => {
      badge.classList.remove('show');
  }, 2000);
}

/* === PROFILE MANAGEMENT === */
// Open profile modal
function openProfileModal() {
  console.log('👤 Opening profile modal...');
  
  const modal = document.getElementById('profileModal');
  const nameInput = document.getElementById('profileNameInput');
  const picInput = document.getElementById('profilePicInput');
  
  // Pre-fill current profile data
  nameInput.value = profileData.name;
  picInput.value = profileData.picture;
  
  modal.classList.add('show');
}

// Close profile modal
function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.classList.remove('show');
}

// Handle profile form submission
document.getElementById('profileForm').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log('💾 Saving profile data...');
  
  const name = document.getElementById('profileNameInput').value.trim();
  const picture = document.getElementById('profilePicInput').value.trim();
  
  if (!name) {
      showNotification('Please enter your name', 'error', 'fas fa-exclamation-circle');
      return;
  }
  
  // Update profile data
  profileData.name = name;
  if (picture) {
      profileData.picture = picture;
  }
  
  // Update UI
  updateProfileDisplay();
  
  // Close modal
  closeProfileModal();
  
  // Show success notification
  showNotification('Profile updated successfully', 'success', 'fas fa-check-circle');
});

// Update profile display in header
function updateProfileDisplay() {
  document.getElementById('profileName').textContent = profileData.name;
  document.getElementById('profilePic').src = profileData.picture;
}

// Load profile data on initialization
function loadProfileData() {
  updateProfileDisplay();
  console.log('👤 Profile data loaded:', profileData);
}

// Close modal when clicking outside
document.getElementById('profileModal').addEventListener('click', function(e) {
  if (e.target === this) {
      closeProfileModal();
  }
});

/* === SAMPLE DATA === */
// Load sample tasks for demonstration
function loadSampleData() {
  console.log('📝 Loading sample data...');
  
  const sampleTasks = [
      {
          id: 1,
          title: 'Complete Software Engineering Assignment',
          description: 'Finish the web development project for CS 461',
          dueDate: '2025-06-25',
          status: 'pending',
          createdAt: new Date('2025-06-20').toISOString()
      },
      {
          id: 2,
          title: 'Study for Computer Science Exam',
          description: 'Review data structures and algorithms for the midterm',
          dueDate: '2025-06-30',
          status: 'pending',
          createdAt: new Date('2025-06-21').toISOString()
      },
      {
          id: 3,
          title: 'Submit Research Proposal',
          description: 'Complete and submit the research proposal for AI project',
          dueDate: '2025-06-20',
          status: 'completed',
          createdAt: new Date('2025-06-18').toISOString()
      },
      {
          id: 4,
          title: 'Prepare Project Presentation',
          description: 'Create slides for the upcoming team presentation',
          dueDate: '2025-06-22',
          status: 'completed',
          createdAt: new Date('2025-06-15').toISOString()
      },
      {
          id: 5,
          title: 'Review Team Code',
          description: 'Provide feedback on pull requests from team members',
          dueDate: '2025-06-23',
          status: 'pending',
          createdAt: new Date('2025-06-21').toISOString()
      }
  ];
  
  tasks = sampleTasks;
  console.log('✅ Sample data loaded:', tasks);
}

/* === UTILITY FUNCTIONS === */
// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
  });
}

// Check if date is today
function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
}

// Check if date is overdue
function isOverdue(dateString, status) {
  if (status === 'completed') return false;
  const today = new Date();
  const date = new Date(dateString);
  return date < today;
}

/* === KEYBOARD SHORTCUTS === */
// Add keyboard shortcuts for better UX
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + N: Add new task
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      showSection('tasks');
      document.getElementById('taskTitle').focus();
      showNotification('Quick add task mode activated', 'info', 'fas fa-bolt');
  }
  
  // Escape: Close modals
  if (e.key === 'Escape') {
      closeProfileModal();
  }
  
  // Ctrl/Cmd + D: Go to dashboard
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      showSection('dashboard');
  }
  
  // Ctrl/Cmd + T: Toggle theme
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      toggleTheme();
  }
});

console.log('✨ Schedulr is ready! Keyboard shortcuts: Ctrl+N (New Task), Ctrl+D (Dashboard), Ctrl+T (Toggle Theme)');