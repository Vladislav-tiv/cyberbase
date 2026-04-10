function showFullArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    article.views++;
    saveUserHistory(article.id, article.title);
    
    const modal = document.getElementById('article-modal');
    const content = document.getElementById('full-article-content');
    
    let formattedContent = article.fullContent
        .replace(/^# (.*$)/gm, '<h1 style="color:#e94560; margin-top:20px">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 style="color:#0f3460; margin-top:20px">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 style="margin-top:15px">$1</h3>')
        .replace(/^\*\*(.*)\*\*$/gm, '<strong>$1</strong>')
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        .replace(/\[✓\]/g, '✅')
        .replace(/\[❌\]/g, '❌')
        .replace(/\n/g, '<br>');
    
    content.innerHTML = `
        <h1 class="full-article-title">${article.title}</h1>
        <div class="full-article-meta">
            <span>🏷️ ${article.categoryName}</span> | 
            <span>👁️ ${article.views} просмотров</span> | 
            <span>📅 ${article.date}</span>
        </div>
        <div class="full-article-content">${formattedContent}</div>
    `;
    
    modal.style.display = 'block';
    
    if (document.getElementById('popular-articles')) loadPopularArticles();
    if (document.getElementById('articles-container')) filterArticles();
}

function closeArticle() {
    document.getElementById('article-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('article-modal');
    if (event.target === modal) modal.style.display = 'none';
}

function loadPopularArticles() {
    const container = document.getElementById('popular-articles');
    if (!container) return;
    const sorted = [...articles].sort((a, b) => b.views - a.views);
    const top3 = sorted.slice(0, 3);
    container.innerHTML = top3.map(a => `
        <div class="article-item" onclick="showFullArticle(${a.id})">
            <h4>📌 ${a.title}</h4>
            <p>${a.summary}</p>
            <small>👁️ ${a.views} просмотров | 🏷️ ${a.categoryName}</small>
        </div>
    `).join('');
}

let currentFilter = 'all';
let currentSearch = '';

function filterArticles() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) currentSearch = searchInput.value.toLowerCase();
    let filtered = articles.filter(a => currentFilter === 'all' || a.category === currentFilter);
    if (currentSearch) filtered = filtered.filter(a => a.title.toLowerCase().includes(currentSearch) || a.summary.toLowerCase().includes(currentSearch));
    displayArticles(filtered);
}

function displayArticles(arr) {
    const container = document.getElementById('articles-container');
    if (!container) return;
    if (arr.length === 0) {
        container.innerHTML = '<p style="text-align:center">❌ Ничего не найдено.</p>';
        return;
    }
    container.innerHTML = arr.map(a => `
        <div class="article-item" onclick="showFullArticle(${a.id})">
            <h4>📌 ${a.title}</h4>
            <p>${a.summary}</p>
            <small>👁️ ${a.views} просмотров | 🏷️ ${a.categoryName}</small>
        </div>
    `).join('');
}

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-cat');
        filterArticles();
    }));
}

let currentTest = null;
let currentQuestionIndex = 0;
let score = 0;

function startTest(level) {
    currentTest = tests[level];
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('levels-container').style.display = 'none';
    document.getElementById('test-container').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const container = document.getElementById('test-container');
    if (!currentTest || currentQuestionIndex >= currentTest.questions.length) {
        finishTest();
        return;
    }
    const q = currentTest.questions[currentQuestionIndex];
    container.innerHTML = `
        <div class="card">
            <h3>${currentTest.name} | Вопрос ${currentQuestionIndex+1} из ${currentTest.questions.length}</h3>
            <p style="font-size:1.2rem; margin:20px 0">${q.text}</p>
            ${q.options.map((opt, idx) => `
                <button class="question-btn" onclick="checkAnswer(${idx})">
                    ${String.fromCharCode(65+idx)}. ${opt}
                </button>
            `).join('')}
        </div>
    `;
}

function checkAnswer(selected) {
    const q = currentTest.questions[currentQuestionIndex];
    const isCorrect = (selected === q.correct);
    if (isCorrect) {
        score++;
        alert('✅ Правильно!');
    } else {
        alert(`❌ Неправильно. Правильный ответ: ${String.fromCharCode(65+q.correct)}. ${q.options[q.correct]}`);
    }
    currentQuestionIndex++;
    showQuestion();
}

function finishTest() {
    const total = currentTest.questions.length;
    const percent = Math.round(score / total * 100);
    let msg = '';
    if (percent === 100) msg = '🎉 Идеально! Вы настоящий эксперт!';
    else if (percent >= 80) msg = '👍 Отлично! Но есть куда расти.';
    else if (percent >= 60) msg = '📚 Хорошо, но стоит повторить материалы.';
    else msg = '📖 Попробуйте почитать статьи в базе знаний и пройти тест заново.';
    
    saveTestResult(currentTest.name, score, total, percent);
    
    document.getElementById('test-container').innerHTML = `
        <div class="card" style="text-align:center">
            <h3>🎯 Результат теста "${currentTest.name}"</h3>
            <p style="font-size:2rem; margin:20px">${score} / ${total}</p>
            <p>${percent}% правильных ответов</p>
            <p>${msg}</p>
            <button onclick="restartTest()" style="background:#e94560;color:white;padding:12px 24px;border:none;border-radius:8px;margin-top:20px;cursor:pointer">🔄 Пройти другой тест</button>
        </div>
    `;
}

function restartTest() {
    document.getElementById('levels-container').style.display = 'grid';
    document.getElementById('test-container').style.display = 'none';
    currentTest = null;
}

function getUsers() {
    const users = localStorage.getItem('cyberbase_users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('cyberbase_users', JSON.stringify(users));
}

function getCurrentUser() {
    const userJson = localStorage.getItem('cyberbase_current_user');
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('cyberbase_current_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('cyberbase_current_user');
    window.location.href = 'index.html';
}

// ========== РЕГИСТРАЦИЯ С ПОЛНОЙ ПРОВЕРКОЙ ==========
function doRegister() {
    // Получаем значения полей
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const errorDiv = document.getElementById('reg-error');
    
    // Очищаем предыдущую ошибку
    errorDiv.innerText = '';
    
    // ========== ПРОВЕРКА ИМЕНИ ПОЛЬЗОВАТЕЛЯ ==========
    if (!username) {
        errorDiv.innerText = '❌ Введите имя пользователя';
        return;
    }
    
    if (username.length < 3) {
        errorDiv.innerText = '❌ Имя пользователя должно быть не менее 3 символов';
        return;
    }
    
    if (username.length > 20) {
        errorDiv.innerText = '❌ Имя пользователя не должно превышать 20 символов';
        return;
    }
    
    // Разрешаем только буквы (русские и английские), цифры, подчеркивание и точку
    const usernameRegex = /^[a-zA-Zа-яА-Я0-9_.]+$/;
    if (!usernameRegex.test(username)) {
        errorDiv.innerText = '❌ Имя пользователя может содержать только буквы, цифры, _ и .';
        return;
    }
    
    // ========== ПРОВЕРКА EMAIL ==========
    if (!email) {
        errorDiv.innerText = '❌ Введите email';
        return;
    }
    
    // Стандартная проверка email формата
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDiv.innerText = '❌ Введите корректный email (например: user@example.com)';
        return;
    }
    
    // ========== ПРОВЕРКА ПАРОЛЯ ==========
    if (!password) {
        errorDiv.innerText = '❌ Введите пароль';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.innerText = '❌ Пароль должен быть не менее 6 символов';
        return;
    }
    
    if (password.length > 50) {
        errorDiv.innerText = '❌ Пароль не должен превышать 50 символов';
        return;
    }
    
    // Проверка сложности пароля (хотя бы одна цифра и одна буква)
    const hasLetter = /[a-zA-Zа-яА-Я]/.test(password);
    const hasDigit = /\d/.test(password);
    
    if (!hasLetter || !hasDigit) {
        errorDiv.innerText = '❌ Пароль должен содержать хотя бы одну букву и одну цифру';
        return;
    }
    
    // ========== ПРОВЕРКА ПОВТОРА ПАРОЛЯ ==========
    if (password !== password2) {
        errorDiv.innerText = '❌ Пароли не совпадают';
        return;
    }
    
    // ========== ПРОВЕРКА НА СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ ==========
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
        errorDiv.innerText = '❌ Пользователь с таким именем уже существует';
        return;
    }
    
    if (users.find(u => u.email === email)) {
        errorDiv.innerText = '❌ Пользователь с таким email уже существует';
        return;
    }
    
    // ========== ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ - СОЗДАЕМ ПОЛЬЗОВАТЕЛЯ ==========
    const newUser = {
        username: username,
        email: email,
        password: password,
        registerDate: new Date().toLocaleDateString(),
        history: [],
        testResults: []
    };
    
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ username: username, email: email });
    
    // Показываем сообщение об успехе и перенаправляем
    alert('✅ Регистрация успешна! Добро пожаловать, ' + username + '!');
    window.location.href = 'profile.html';
}

function doLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    // Очищаем предыдущую ошибку
    errorDiv.innerText = '';
    
    // Проверка на пустые поля
    if (!username) {
        errorDiv.innerText = '❌ Введите имя пользователя';
        return;
    }
    
    if (!password) {
        errorDiv.innerText = '❌ Введите пароль';
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        setCurrentUser({ username: user.username, email: user.email });
        window.location.href = 'profile.html';
    } else {
        errorDiv.innerText = '❌ Неверное имя пользователя или пароль';
    }
}

function saveUserHistory(articleId, articleTitle) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex === -1) return;
    
    if (!users[userIndex].history) users[userIndex].history = [];
    users[userIndex].history.unshift({
        id: articleId,
        title: articleTitle,
        date: new Date().toLocaleString()
    });
    users[userIndex].history = users[userIndex].history.slice(0, 20);
    
    saveUsers(users);
}

function saveTestResult(testName, score, total, percent) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex === -1) return;
    
    if (!users[userIndex].testResults) users[userIndex].testResults = [];
    users[userIndex].testResults.unshift({
        testName: testName,
        score: score,
        total: total,
        percent: percent,
        date: new Date().toLocaleString()
    });
    users[userIndex].testResults = users[userIndex].testResults.slice(0, 20);
    
    saveUsers(users);
}

function loadProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        document.getElementById('profile-loggedin').style.display = 'none';
        document.getElementById('profile-guest').style.display = 'block';
        return;
    }
    
    document.getElementById('profile-loggedin').style.display = 'block';
    document.getElementById('profile-guest').style.display = 'none';
    
    const users = getUsers();
    const user = users.find(u => u.username === currentUser.username);
    if (!user) return;
    
    document.getElementById('profile-username').innerText = user.username;
    document.getElementById('profile-email').innerText = user.email;
    document.getElementById('profile-date').innerText = user.registerDate || 'Не указана';
    
    const readCount = user.history ? user.history.length : 0;
    document.getElementById('profile-read-count').innerText = readCount;
    
    const testCount = user.testResults ? user.testResults.length : 0;
    document.getElementById('profile-test-count').innerText = testCount;
    
    if (user.testResults && user.testResults.length > 0) {
        const avgPercent = user.testResults.reduce((sum, t) => sum + t.percent, 0) / user.testResults.length;
        document.getElementById('profile-avg-score').innerText = Math.round(avgPercent);
    } else {
        document.getElementById('profile-avg-score').innerText = '0';
    }
    
    const historyContainer = document.getElementById('history-list');
    if (historyContainer) {
        if (user.history && user.history.length > 0) {
            historyContainer.innerHTML = user.history.map(h => `
                <div class="history-item" onclick="showFullArticle(${h.id})" style="cursor:pointer">
                    📖 ${h.title}<br>
                    <small>${h.date}</small>
                </div>
            `).join('');
        } else {
            historyContainer.innerHTML = '<p>Вы ещё не читали статьи</p>';
        }
    }
    
    const testResultsContainer = document.getElementById('test-results-list');
    if (testResultsContainer) {
        if (user.testResults && user.testResults.length > 0) {
            testResultsContainer.innerHTML = user.testResults.map(t => `
                <div class="history-item">
                    🎯 ${t.testName}: ${t.score}/${t.total} (${t.percent}%)<br>
                    <small>${t.date}</small>
                </div>
            `).join('');
        } else {
            testResultsContainer.innerHTML = '<p>Вы ещё не проходили тесты</p>';
        }
    }
}

function updateNavForUser() {
    const currentUser = getCurrentUser();
    const profileLinkHeader = document.getElementById('profile-link-header');
    
    if (profileLinkHeader) {
        if (currentUser) {
            profileLinkHeader.innerHTML = `👤 ${currentUser.username}`;
            profileLinkHeader.href = 'profile.html';
        } else {
            profileLinkHeader.innerHTML = '👤 Войти';
            profileLinkHeader.href = 'login.html';
        }
    }
    
    const welcomeDiv = document.getElementById('welcome-message');
    if (welcomeDiv && currentUser) {
        welcomeDiv.innerHTML = `👋 Добро пожаловать, ${currentUser.username}!`;
    }
}

function handleUrlParams() {
    const cat = new URLSearchParams(window.location.search).get('cat');
    if (cat && ['threats', 'protection', 'news'].includes(cat)) {
        currentFilter = cat;
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            if (btn.getAttribute('data-cat') === cat) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        filterArticles();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPopularArticles();
    updateNavForUser();
    
    if (document.getElementById('articles-container')) {
        displayArticles(articles);
        setupFilters();
        handleUrlParams();
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => setTimeout(filterArticles, 100));
    }
    
    if (document.getElementById('profile-username')) {
        loadProfile();
    }
});
