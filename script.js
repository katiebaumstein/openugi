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
        
        // Just reset the timer, no notification
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

// Add smooth scroll for internal links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

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

function getModelUrl(modelName) {
    // Extract provider and model name
    const parts = modelName.split('/');
    if (parts.length < 2) return null;
    
    const provider = parts[0].toLowerCase();
    const model = parts.slice(1).join('/');
    
    // Remove "(no longer available)" suffix if present
    const cleanModel = model.replace(/\s*\(no longer available\)\s*$/i, '');
    
    // Map providers to their URLs
    const providerUrls = {
        'openai': `https://platform.openai.com/docs/models/${cleanModel}`,
        'anthropic': `https://www.anthropic.com/claude`,
        'google': `https://ai.google.dev/gemini-api/docs/models/gemini`,
        'meta-llama': `https://huggingface.co/${modelName}`,
        'mistralai': `https://huggingface.co/${modelName}`,
        'microsoft': `https://huggingface.co/${modelName}`,
        'nousresearch': `https://huggingface.co/${modelName}`,
        'xai': 'https://x.ai/blog',
        'cohere': `https://huggingface.co/${modelName}`,
        'allenai': `https://huggingface.co/${modelName}`,
        'databricks': `https://huggingface.co/${modelName}`,
        'deepseek-ai': `https://huggingface.co/${modelName}`,
        'qwen': `https://huggingface.co/${modelName}`,
        'tiiuae': `https://huggingface.co/${modelName}`,
        '01-ai': `https://huggingface.co/${modelName}`,
        'nicoboss': `https://huggingface.co/${modelName}`,
        'juvi21': `https://huggingface.co/${modelName}`,
        'concedo': `https://huggingface.co/${modelName}`,
        'nvidia': `https://huggingface.co/${modelName}`,
        'cognitivecomputations': `https://huggingface.co/${modelName}`,
        'trollek': `https://huggingface.co/${modelName}`,
        'berkeleygpt': `https://huggingface.co/${modelName}`,
        'togethercomputer': `https://huggingface.co/${modelName}`,
        'stabilityai': `https://huggingface.co/${modelName}`,
        'bigscience': `https://huggingface.co/${modelName}`,
        'eleutherai': `https://huggingface.co/${modelName}`,
        'facebook': `https://huggingface.co/${modelName}`,
        'gpt2': `https://huggingface.co/${modelName}`,
        'bert': `https://huggingface.co/${modelName}`,
        'roberta': `https://huggingface.co/${modelName}`,
        'xlnet': `https://huggingface.co/${modelName}`,
        'albert': `https://huggingface.co/${modelName}`,
        'electra': `https://huggingface.co/${modelName}`,
        'distilbert': `https://huggingface.co/${modelName}`,
        'mosaicml': `https://huggingface.co/${modelName}`,
        'salesforce': `https://huggingface.co/${modelName}`,
        'laion': `https://huggingface.co/${modelName}`,
        'writer': `https://huggingface.co/${modelName}`,
        'h2o': `https://huggingface.co/${modelName}`,
        'alephbeta': `https://huggingface.co/${modelName}`,
        'stanford': `https://huggingface.co/${modelName}`,
        'amazon': `https://huggingface.co/${modelName}`,
        'ai21labs': `https://huggingface.co/${modelName}`,
        'adept': `https://huggingface.co/${modelName}`,
        'inflection': `https://huggingface.co/${modelName}`,
        'baichuan': `https://huggingface.co/${modelName}`,
        'alibaba': `https://huggingface.co/${modelName}`,
        'zhipu': `https://huggingface.co/${modelName}`,
        'sensetime': `https://huggingface.co/${modelName}`,
        'baidu': `https://huggingface.co/${modelName}`,
        'iflytek': `https://huggingface.co/${modelName}`,
        'minimax': `https://huggingface.co/${modelName}`,
        'bytedance': `https://huggingface.co/${modelName}`,
        'moonshot': `https://huggingface.co/${modelName}`,
        'perplexity': 'https://www.perplexity.ai/',
        'reka': 'https://www.reka.ai/',
        'command-r': 'https://cohere.com/command',
        'claude': 'https://www.anthropic.com/claude',
        'gemini': 'https://ai.google.dev/gemini-api/docs/models/gemini',
        'gpt': 'https://platform.openai.com/docs/models'
    };
    
    // Check if provider has a custom URL
    if (providerUrls[provider]) {
        return providerUrls[provider];
    }
    
    // Default to HuggingFace for unknown providers
    return `https://huggingface.co/${modelName}`;
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    
    filteredData.forEach((model, index) => {
        const modelUrl = getModelUrl(model.model);
        const modelLink = modelUrl 
            ? `<a href="${modelUrl}" target="_blank" class="model-link">${escapeHtml(model.model)}</a>`
            : escapeHtml(model.model);
            
        const row = document.createElement('tr');
        
        // Add special decorations for top 3
        let rankDisplay = `<span class="rank-number">${index + 1}</span>`;
        if (index === 0) {
            rankDisplay += '<img src="ranking-crown.png" class="rank-decoration" alt="1st place">';
        } else if (index === 1) {
            rankDisplay += '<img src="star-medals.png" class="rank-decoration" alt="2nd place" style="filter: hue-rotate(0deg);">';
        } else if (index === 2) {
            rankDisplay += '<img src="star-medals.png" class="rank-decoration" alt="3rd place" style="filter: hue-rotate(30deg) brightness(0.8);">';
        }
        
        row.innerHTML = `
            <td class="rank">${rankDisplay}</td>
            <td class="model-name">${modelLink}</td>
            <td class="score ugi-score" title="UGI: ${model.ugi.toFixed(2)}/100">${model.ugi.toFixed(2)}</td>
            <td class="score w10-score" title="Willingness: ${model.w10.toFixed(1)}/10">${model.w10.toFixed(1)}</td>
            <td><span class="ideology ideology-${model.ideology.toLowerCase().replace(/\s+/g, '-')}">${model.ideology}</span></td>
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

// Removed intrusive notification - users can see the live indicator and last updated time instead

// Start the refresh timer
startRefreshTimer();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Back to top button functionality
const backToTopButton = document.getElementById('back-to-top');

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// Scroll to top when clicked
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});