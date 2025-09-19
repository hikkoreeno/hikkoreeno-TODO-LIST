// TODOアプリ - Web版 JavaScript

let todos = [];
let currentFilter = 'all';
let editingTodoId = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // Enterキーでの追加
    document.getElementById('todo-title').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    document.getElementById('todo-description').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    document.getElementById('todo-due-date').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // モーダルの外側クリックで閉じる
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
}

// TODOリストを読み込み
async function loadTodos() {
    try {
        const response = await fetch('/api/todos');
        if (response.ok) {
            todos = await response.json();
            renderTodos();
            updateStats();
        } else {
            showNotification('TODOの読み込みに失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showNotification('TODOの読み込み中にエラーが発生しました', 'error');
    }
}

// TODOを追加
async function addTodo() {
    const titleInput = document.getElementById('todo-title');
    const descriptionInput = document.getElementById('todo-description');
    const dueDateInput = document.getElementById('todo-due-date');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const dueDate = dueDateInput.value.trim() || null;
    
    if (!title) {
        showNotification('タイトルを入力してください', 'error');
        titleInput.focus();
        return;
    }
    
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
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
            const newTodo = await response.json();
            todos.push(newTodo);
            
            // フォームをクリア
            titleInput.value = '';
            descriptionInput.value = '';
            dueDateInput.value = '';
            
            renderTodos();
            updateStats();
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
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    try {
        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: !todo.completed
            })
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === todoId);
            todos[index] = updatedTodo;
            
            renderTodos();
            updateStats();
            
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
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    if (!confirm(`「${todo.title}」を削除しますか？`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            todos = todos.filter(t => t.id !== todoId);
            renderTodos();
            updateStats();
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
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    editingTodoId = todoId;
    document.getElementById('edit-title').value = todo.title;
    document.getElementById('edit-description').value = todo.description || '';
    document.getElementById('edit-due-date').value = todo.due_date || '';
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
            const index = todos.findIndex(t => t.id === editingTodoId);
            todos[index] = updatedTodo;
            
            closeEditModal();
            renderTodos();
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

// 完了済みTODOを全削除
async function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
        showNotification('完了済みのTODOはありません', 'error');
        return;
    }
    
    if (!confirm(`${completedTodos.length}件の完了済みTODOを削除しますか？`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/todos/clear-completed', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            todos = todos.filter(t => !t.completed);
            renderTodos();
            updateStats();
            showNotification(result.message);
        } else {
            showNotification('完了済みTODOの削除に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error clearing completed todos:', error);
        showNotification('完了済みTODOの削除中にエラーが発生しました', 'error');
    }
}

// フィルターを適用
function filterTodos(filter) {
    currentFilter = filter;
    
    // フィルターボタンのアクティブ状態を更新
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTodos();
}

// TODOリストを描画
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    
    // フィルターを適用
    let filteredTodos = todos;
    switch (currentFilter) {
        case 'pending':
            filteredTodos = todos.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(t => t.completed);
            break;
        default:
            filteredTodos = todos;
    }
    
    if (filteredTodos.length === 0) {
        todoList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    todoList.style.display = 'block';
    emptyState.style.display = 'none';
    
    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-header">
                <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" 
                     onclick="toggleTodo(${todo.id})">
                    ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" onclick="openEditModal(${todo.id})" 
                            title="編集">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})" 
                            title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
            <div class="todo-meta">
                <i class="fas fa-calendar-alt"></i> 作成: ${formatDate(todo.created_at)}
                ${todo.due_date ? `<span style="margin-left: 15px;"><i class="fas fa-clock"></i> 期限: </span>${formatDueDate(todo.due_date)}` : ''}
            </div>
        </div>
    `).join('');
}

// 統計情報を更新
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('total-count').textContent = total;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('pending-count').textContent = pending;
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

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今日 ' + date.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else if (diffDays === 1) {
        return '昨日';
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else {
        return date.toLocaleDateString('ja-JP');
    }
}

// 期限日フォーマット
function formatDueDate(dateString) {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '<span style="color: #ff6b6b; font-weight: bold;">今日</span>';
    } else if (diffDays === 1) {
        return '<span style="color: #ffa500; font-weight: bold;">明日</span>';
    } else if (diffDays === -1) {
        return '<span style="color: #dc3545; font-weight: bold;">昨日（期限切れ）</span>';
    } else if (diffDays < 0) {
        return `<span style="color: #dc3545; font-weight: bold;">${Math.abs(diffDays)}日前（期限切れ）</span>`;
    } else if (diffDays <= 7) {
        return `<span style="color: #28a745;">${diffDays}日後</span>`;
    } else {
        return dueDate.toLocaleDateString('ja-JP');
    }
}
