// カレンダー機能のJavaScript

let currentDate = new Date();
let selectedDate = null;
let editingTodoId = null;
let calendarTodos = {};

// 月の名前（日本語）
const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // モーダルの外側クリックで閉じる
    document.getElementById('add-todo-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddModal();
        }
    });
    
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
    
    // Enterキーでの追加
    document.getElementById('quick-todo-title').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addQuickTodo();
        }
    });
}

// カレンダーの初期化
function initializeCalendar() {
    updateCalendarHeader();
    loadCalendarData();
}

// カレンダーヘッダーの更新
function updateCalendarHeader() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('current-month-year').textContent = `${year}年${monthNames[month]}`;
}

// カレンダーデータの読み込み
async function loadCalendarData() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // JavaScriptの月は0から始まるため+1
    
    try {
        console.log(`Loading calendar data for ${year}/${month}`);
        const response = await fetch(`/api/calendar/${year}/${month}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Calendar data loaded:', data);
            calendarTodos = data;
            renderCalendar();
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Calendar API error:', response.status, errorData);
            showNotification(`カレンダーデータの読み込みに失敗しました (${response.status})`, 'error');
            calendarTodos = {}; // 空のデータで初期化
            renderCalendar();
        }
    } catch (error) {
        console.error('Error loading calendar data:', error);
        showNotification('カレンダーデータの読み込み中にエラーが発生しました', 'error');
        calendarTodos = {}; // 空のデータで初期化
        renderCalendar();
    }
}

// カレンダーの描画
function renderCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 日曜日から開始
    
    const today = new Date();
    calendarBody.innerHTML = '';
    
    // 6週間分の日付を生成（42日）
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        
        const dayElement = createDayElement(cellDate, month, today);
        calendarBody.appendChild(dayElement);
    }
}

// 日付セルの作成
function createDayElement(date, currentMonth, today) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    // 日付の分類
    const isToday = date.toDateString() === today.toDateString();
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    
    if (isToday) dayDiv.classList.add('today');
    if (!isCurrentMonth) dayDiv.classList.add('other-month');
    if (isSelected) dayDiv.classList.add('selected');
    
    // 日付番号
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayDiv.appendChild(dayNumber);
    
    // その日のTODOを表示
    const dateString = formatDateString(date);
    const dayTodos = calendarTodos[dateString] || [];
    
    if (dayTodos.length > 0) {
        const todosContainer = document.createElement('div');
        todosContainer.className = 'day-todos';
        
        // 最大3個のTODOを表示
        const displayTodos = dayTodos.slice(0, 3);
        displayTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = `day-todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.textContent = todo.title;
            todosContainer.appendChild(todoItem);
        });
        
        dayDiv.appendChild(todosContainer);
        
        // TODOが3個以上ある場合は数を表示
        if (dayTodos.length > 3) {
            const countBadge = document.createElement('div');
            countBadge.className = 'todo-count';
            countBadge.textContent = dayTodos.length;
            dayDiv.appendChild(countBadge);
        }
    }
    
    // クリックイベント
    dayDiv.addEventListener('click', () => selectDate(date));
    
    return dayDiv;
}

// 日付選択
function selectDate(date) {
    selectedDate = new Date(date);
    renderCalendar(); // カレンダーを再描画して選択状態を更新
    showSelectedDateTodos(date);
}

// 選択された日付のTODO表示
function showSelectedDateTodos(date) {
    const dateString = formatDateString(date);
    const dayTodos = calendarTodos[dateString] || [];
    
    // タイトル更新
    const title = document.getElementById('selected-date-title');
    title.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日のTODO`;
    
    // TODOリスト更新
    const todosList = document.getElementById('selected-todos-list');
    todosList.innerHTML = '';
    
    if (dayTodos.length === 0) {
        todosList.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">この日のTODOはありません</p>';
    } else {
        dayTodos.forEach(todo => {
            const todoElement = createSelectedTodoElement(todo);
            todosList.appendChild(todoElement);
        });
    }
    
    // サイドパネルを表示
    const panel = document.getElementById('selected-date-todos');
    panel.style.display = 'block';
    setTimeout(() => panel.classList.add('show'), 10);
}

// 選択された日付のTODO要素を作成
function createSelectedTodoElement(todo) {
    const todoDiv = document.createElement('div');
    todoDiv.className = `selected-todo-item ${todo.completed ? 'completed' : ''}`;
    
    todoDiv.innerHTML = `
        <div class="selected-todo-header">
            <div class="selected-todo-checkbox ${todo.completed ? 'completed' : ''}" 
                 onclick="toggleTodo(${todo.id})">
                ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="selected-todo-title ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.title)}</div>
            <div class="selected-todo-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${todo.id})" title="編集">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})" title="削除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        ${todo.description ? `<div class="selected-todo-description">${escapeHtml(todo.description)}</div>` : ''}
    `;
    
    return todoDiv;
}

// 選択された日付のパネルを閉じる
function closeSelectedDate() {
    const panel = document.getElementById('selected-date-todos');
    panel.classList.remove('show');
    setTimeout(() => {
        panel.style.display = 'none';
        selectedDate = null;
        renderCalendar();
    }, 300);
}

// クイックTODO追加
async function addQuickTodo() {
    if (!selectedDate) return;
    
    const titleInput = document.getElementById('quick-todo-title');
    const title = titleInput.value.trim();
    
    if (!title) {
        showNotification('タイトルを入力してください', 'error');
        return;
    }
    
    const dateString = formatDateString(selectedDate);
    
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: '',
                due_date: dateString
            })
        });
        
        if (response.ok) {
            const newTodo = await response.json();
            
            // カレンダーデータを更新
            if (!calendarTodos[dateString]) {
                calendarTodos[dateString] = [];
            }
            calendarTodos[dateString].push(newTodo);
            
            titleInput.value = '';
            renderCalendar();
            showSelectedDateTodos(selectedDate);
            showNotification('TODOを追加しました');
        } else {
            const error = await response.json();
            showNotification(error.error || 'TODOの追加に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showNotification('TODOの追加中にエラーが発生しました', 'error');
    }
}

// TODOの完了状態を切り替え
async function toggleTodo(todoId) {
    try {
        // 現在のTODOを見つける
        let currentTodo = null;
        for (const dateKey in calendarTodos) {
            const todo = calendarTodos[dateKey].find(t => t.id === todoId);
            if (todo) {
                currentTodo = todo;
                break;
            }
        }
        
        if (!currentTodo) return;
        
        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: !currentTodo.completed
            })
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            
            // カレンダーデータを更新
            for (const dateKey in calendarTodos) {
                const index = calendarTodos[dateKey].findIndex(t => t.id === todoId);
                if (index !== -1) {
                    calendarTodos[dateKey][index] = updatedTodo;
                    break;
                }
            }
            
            renderCalendar();
            if (selectedDate) {
                showSelectedDateTodos(selectedDate);
            }
            
            const message = updatedTodo.completed ? 'TODOを完了しました' : 'TODOを未完了にしました';
            showNotification(message);
        } else {
            showNotification('TODOの更新に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        showNotification('TODOの更新中にエラーが発生しました', 'error');
    }
}

// TODOを削除
async function deleteTodo(todoId) {
    // 現在のTODOを見つける
    let currentTodo = null;
    for (const dateKey in calendarTodos) {
        const todo = calendarTodos[dateKey].find(t => t.id === todoId);
        if (todo) {
            currentTodo = todo;
            break;
        }
    }
    
    if (!currentTodo) return;
    
    if (!confirm(`「${currentTodo.title}」を削除しますか？`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // カレンダーデータから削除
            for (const dateKey in calendarTodos) {
                const index = calendarTodos[dateKey].findIndex(t => t.id === todoId);
                if (index !== -1) {
                    calendarTodos[dateKey].splice(index, 1);
                    if (calendarTodos[dateKey].length === 0) {
                        delete calendarTodos[dateKey];
                    }
                    break;
                }
            }
            
            renderCalendar();
            if (selectedDate) {
                showSelectedDateTodos(selectedDate);
            }
            showNotification('TODOを削除しました');
        } else {
            showNotification('TODOの削除に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showNotification('TODOの削除中にエラーが発生しました', 'error');
    }
}

// 編集モーダルを開く
function openEditModal(todoId) {
    // 現在のTODOを見つける
    let currentTodo = null;
    for (const dateKey in calendarTodos) {
        const todo = calendarTodos[dateKey].find(t => t.id === todoId);
        if (todo) {
            currentTodo = todo;
            break;
        }
    }
    
    if (!currentTodo) return;
    
    editingTodoId = todoId;
    document.getElementById('edit-title').value = currentTodo.title;
    document.getElementById('edit-description').value = currentTodo.description || '';
    document.getElementById('edit-due-date').value = currentTodo.due_date || '';
    document.getElementById('edit-modal').style.display = 'block';
    document.getElementById('edit-title').focus();
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingTodoId = null;
}

// 編集を保存
async function saveEdit() {
    if (!editingTodoId) return;
    
    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-description').value.trim();
    const dueDate = document.getElementById('edit-due-date').value.trim() || null;
    
    if (!title) {
        showNotification('タイトルを入力してください', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/todos/${editingTodoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description,
                due_date: dueDate
            })
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            
            // 古い日付から削除
            for (const dateKey in calendarTodos) {
                const index = calendarTodos[dateKey].findIndex(t => t.id === editingTodoId);
                if (index !== -1) {
                    calendarTodos[dateKey].splice(index, 1);
                    if (calendarTodos[dateKey].length === 0) {
                        delete calendarTodos[dateKey];
                    }
                    break;
                }
            }
            
            // 新しい日付に追加
            if (updatedTodo.due_date) {
                if (!calendarTodos[updatedTodo.due_date]) {
                    calendarTodos[updatedTodo.due_date] = [];
                }
                calendarTodos[updatedTodo.due_date].push(updatedTodo);
            }
            
            closeEditModal();
            renderCalendar();
            if (selectedDate) {
                showSelectedDateTodos(selectedDate);
            }
            showNotification('TODOを更新しました');
        } else {
            const error = await response.json();
            showNotification(error.error || 'TODOの更新に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        showNotification('TODOの更新中にエラーが発生しました', 'error');
    }
}

// 前の月へ
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarHeader();
    loadCalendarData();
    closeSelectedDate();
}

// 次の月へ
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarHeader();
    loadCalendarData();
    closeSelectedDate();
}

// 今日に移動
function goToToday() {
    currentDate = new Date();
    updateCalendarHeader();
    loadCalendarData();
    closeSelectedDate();
}

// 日付を文字列にフォーマット
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 通知を表示
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
