import os
import glob

# 1. Append theme logic to config.js
config_path = 'frontend/js/config.js'
theme_logic = """
// Theme Initialization
(function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    }
})();

window.toggleTheme = function() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    const btns = document.querySelectorAll('#theme-toggle-btn');
    btns.forEach(btn => {
        btn.textContent = isLight ? '🌙' : '🌞';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const isLight = document.body.classList.contains('light-theme');
    const btns = document.querySelectorAll('#theme-toggle-btn');
    btns.forEach(btn => {
        btn.textContent = isLight ? '🌙' : '🌞';
    });
});
"""

with open(config_path, 'a', encoding='utf-8') as f:
    f.write(theme_logic)

# 2. Patch all HTML files in frontend/pages to add the toggle button before </nav>
html_files = glob.glob('frontend/pages/*.html')
button_html = '<button onclick="toggleTheme()" id="theme-toggle-btn" style="background: none; border: none; cursor: pointer; font-size: 1.5rem; margin-left: 0.5rem; transition: transform 0.2s;" onmouseover="this.style.transform=\\'scale(1.2)\\'" onmouseout="this.style.transform=\\'scale(1)\\'" title="Cambiar Tema">🌞</button>\n        </nav>'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '</nav>' in content and 'id="theme-toggle-btn"' not in content:
        content = content.replace('</nav>', button_html)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Patched {file}')
