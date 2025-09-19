#!/usr/bin/env python3
"""
TODOアプリ - Webアプリケーション版
Flask を使用したWebインターフェース
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
from datetime import datetime, timedelta
from todo import TodoManager

app = Flask(__name__)
app.secret_key = 'todo_app_secret_key_2025'

# TodoManagerのインスタンスを作成
todo_manager = TodoManager()


@app.route('/')
def index():
    """メインページ"""
    todos = todo_manager.get_todos()
    return render_template('index.html', todos=todos)


@app.route('/api/todos', methods=['GET'])
def get_todos():
    """TODOリストをJSON形式で取得"""
    show_completed = request.args.get('show_completed', 'true').lower() == 'true'
    date = request.args.get('date')
    
    if date:
        todos = todo_manager.get_todos_by_date(date, show_completed)
    else:
        todos = todo_manager.get_todos(show_completed)
    
    return jsonify([todo.to_dict() for todo in todos])


@app.route('/api/todos', methods=['POST'])
def add_todo():
    """新しいTODOを追加"""
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({'error': 'タイトルは必須です'}), 400
    
    title = data['title'].strip()
    description = data.get('description', '').strip()
    due_date = data.get('due_date', '').strip() or None
    
    if not title:
        return jsonify({'error': 'タイトルは必須です'}), 400
    
    todo = todo_manager.add_todo(title, description, due_date)
    return jsonify(todo.to_dict()), 201


@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """TODOを更新"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': '更新データが必要です'}), 400
    
    # 完了状態の更新
    if 'completed' in data:
        if data['completed']:
            success = todo_manager.complete_todo(todo_id)
        else:
            success = todo_manager.uncomplete_todo(todo_id)
        
        if not success:
            return jsonify({'error': 'TODOが見つかりません'}), 404
    
    # タイトルや説明、期限日の更新
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')
    
    if title is not None or description is not None or due_date is not None:
        success = todo_manager.update_todo(todo_id, title, description, due_date)
        if not success:
            return jsonify({'error': 'TODOが見つかりません'}), 404
    
    updated_todo = todo_manager.get_todo_by_id(todo_id)
    if updated_todo:
        return jsonify(updated_todo.to_dict())
    else:
        return jsonify({'error': 'TODOが見つかりません'}), 404


@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """TODOを削除"""
    success = todo_manager.delete_todo(todo_id)
    
    if success:
        return jsonify({'message': 'TODOを削除しました'}), 200
    else:
        return jsonify({'error': 'TODOが見つかりません'}), 404


@app.route('/api/todos/clear-completed', methods=['DELETE'])
def clear_completed():
    """完了済みTODOを全削除"""
    count = todo_manager.clear_completed()
    return jsonify({'message': f'{count}件の完了済みTODOを削除しました', 'count': count})


@app.route('/api/stats')
def get_stats():
    """統計情報を取得"""
    todos = todo_manager.get_todos()
    total = len(todos)
    completed = len([todo for todo in todos if todo.completed])
    pending = total - completed
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending
    })


@app.route('/api/calendar/<int:year>/<int:month>')
def get_calendar_data(year, month):
    """指定された月のカレンダーデータを取得"""
    show_completed = request.args.get('show_completed', 'true').lower() == 'true'
    month_todos = todo_manager.get_todos_by_month(year, month, show_completed)
    
    # TodoオブジェクトをJSON形式に変換
    serialized_todos = {}
    for date_key, todos_list in month_todos.items():
        serialized_todos[date_key] = [todo.to_dict() for todo in todos_list]
    
    return jsonify(serialized_todos)


@app.route('/calendar')
def calendar_view():
    """カレンダービュー"""
    return render_template('calendar.html')


@app.errorhandler(404)
def not_found(error):
    """404エラーハンドラ"""
    return jsonify({'error': 'ページが見つかりません'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500エラーハンドラ"""
    return jsonify({'error': 'サーバーエラーが発生しました'}), 500


if __name__ == '__main__':
    print("🌐 TODOアプリ（Web版）を起動しています...")
    print("📱 ブラウザで http://localhost:8082 にアクセスしてください")
    print("🛑 終了するには Ctrl+C を押してください")
    
    app.run(debug=True, host='0.0.0.0', port=8082)
