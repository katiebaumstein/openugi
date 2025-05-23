let leaderboardData = [];
let filteredData = [];
let refreshInterval;
let refreshTimeRemaining = 3600; // seconds

async function fetchLeaderboardData() {
    try {
        const response = await fetch('leaderboard_data.json');
        const jsonData = await response.json();
        
        leaderboardData = jsonData.data;
        filteredData = [...leaderboardData];
        
        updateStats();
        populateIdeologyFilter();
        renderLeaderboard();
        
        // Format the date nicely
        const lastUpdated = new Date(jsonData.lastUpdated);
        document.getElementById('last-updated').textContent = lastUpdated.toLocaleDateString();
        
        showRefreshNotification();
        resetRefreshTimer();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('leaderboard-body').innerHTML = 
            '<tr><td colspan="5" class="loading">Error loading data. Please try again later.</td></tr>';
    }
}

function updateStats() {
    document.getElementById('total-models').textContent = leaderboardData.length;
    
    if (leaderboardData.length > 0) {
        const topUGI = Math.max(...leaderboardData.map(d => d.ugi));
        document.getElementById('top-ugi').textContent = topUGI.toFixed(2);
    }
}

function populateIdeologyFilter() {
    const ideologies = [...new Set(leaderboardData.map(d => d.ideology))];
    const select = document.getElementById('ideology-filter');
    
    ideologies.forEach(ideology => {
        const option = document.createElement('option');
        option.value = ideology;
        option.textContent = ideology;
        select.appendChild(option);
    });
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    
    filteredData.forEach((model, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="rank">${index + 1}</td>
            <td class="model-name">${escapeHtml(model.model)}</td>
            <td class="score ugi-score">${model.ugi.toFixed(2)}</td>
            <td class="score w10-score">${model.w10.toFixed(1)}</td>
            <td><span class="ideology ideology-${model.ideology.toLowerCase()}">${model.ideology}</span></td>
        `;
        tbody.appendChild(row);
    });
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No models found matching your criteria.</td></tr>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function filterAndSort() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const ideologyFilter = document.getElementById('ideology-filter').value;
    const sortBy = document.getElementById('sort-by').value;
    
    filteredData = leaderboardData.filter(model => {
        const matchesSearch = model.model.toLowerCase().includes(searchTerm);
        const matchesIdeology = !ideologyFilter || model.ideology === ideologyFilter;
        return matchesSearch && matchesIdeology;
    });
    
    switch(sortBy) {
        case 'ugi-desc':
            filteredData.sort((a, b) => b.ugi - a.ugi);
            break;
        case 'ugi-asc':
            filteredData.sort((a, b) => a.ugi - b.ugi);
            break;
        case 'w10-desc':
            filteredData.sort((a, b) => b.w10 - a.w10);
            break;
        case 'w10-asc':
            filteredData.sort((a, b) => a.w10 - b.w10);
            break;
    }
    
    renderLeaderboard();
}

document.getElementById('search').addEventListener('input', filterAndSort);
document.getElementById('ideology-filter').addEventListener('change', filterAndSort);
document.getElementById('sort-by').addEventListener('change', filterAndSort);

fetchLeaderboardData();

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle
document.getElementById('theme-button').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Manual refresh button
document.getElementById('manual-refresh').addEventListener('click', async () => {
    const button = document.getElementById('manual-refresh');
    button.disabled = true;
    button.innerHTML = '<span style="animation: spin 1s linear infinite;">↻</span> Refreshing...';
    
    await fetchLeaderboardData();
    
    button.disabled = false;
    button.innerHTML = '<span>↻</span> Refresh Now';
});

// Auto refresh every hour
setInterval(() => {
    console.log('Auto-refreshing leaderboard data...');
    fetchLeaderboardData();
}, 3600000);

// Refresh timer
function startRefreshTimer() {
    refreshInterval = setInterval(() => {
        refreshTimeRemaining--;
        updateRefreshDisplay();
        
        if (refreshTimeRemaining <= 0) {
            refreshTimeRemaining = 3600;
        }
    }, 1000);
}

function resetRefreshTimer() {
    refreshTimeRemaining = 3600;
    updateRefreshDisplay();
}

function updateRefreshDisplay() {
    const minutes = Math.floor(refreshTimeRemaining / 60);
    const seconds = refreshTimeRemaining % 60;
    document.getElementById('refresh-timer').textContent = 
        `Auto-refresh in ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Add visual feedback for refresh
function showRefreshNotification() {
    const notification = document.createElement('div');
    notification.className = 'refresh-notification';
    notification.textContent = '✅ Data refreshed';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Start the refresh timer
startRefreshTimer();

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);