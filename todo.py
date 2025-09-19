import json
import os
from datetime import datetime
from typing import List, Dict, Optional


class Todo:
    """個別のTODOアイテムを表すクラス"""
    
    def __init__(self, id: int, title: str, description: str = "", completed: bool = False, created_at: str = None, due_date: str = None):
        self.id = id
        self.title = title
        self.description = description
        self.completed = completed
        self.created_at = created_at or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.due_date = due_date
    
    def to_dict(self) -> Dict:
        """TODOオブジェクトを辞書に変換"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at,
            "due_date": self.due_date
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Todo':
        """辞書からTODOオブジェクトを作成"""
        return cls(
            id=data["id"],
            title=data["title"],
            description=data.get("description", ""),
            completed=data.get("completed", False),
            created_at=data.get("created_at"),
            due_date=data.get("due_date")
        )
    
    def __str__(self) -> str:
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.id}: {self.title}"


class TodoManager:
    """TODOアプリのメイン管理クラス"""
    
    def __init__(self, data_file: str = "todos.json"):
        self.data_file = data_file
        self.todos: List[Todo] = []
        self.next_id = 1
        self.load_todos()
    
    def load_todos(self) -> None:
        """JSONファイルからTODOデータを読み込み"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.todos = [Todo.from_dict(todo_data) for todo_data in data.get("todos", [])]
                    self.next_id = data.get("next_id", 1)
            except (json.JSONDecodeError, FileNotFoundError):
                self.todos = []
                self.next_id = 1
    
    def save_todos(self) -> None:
        """TODOデータをJSONファイルに保存"""
        data = {
            "todos": [todo.to_dict() for todo in self.todos],
            "next_id": self.next_id
        }
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def add_todo(self, title: str, description: str = "", due_date: str = None) -> Todo:
        """新しいTODOを追加"""
        todo = Todo(self.next_id, title, description, due_date=due_date)
        self.todos.append(todo)
        self.next_id += 1
        self.save_todos()
        return todo
    
    def get_todos(self, show_completed: bool = True) -> List[Todo]:
        """TODOリストを取得"""
        if show_completed:
            return self.todos
        return [todo for todo in self.todos if not todo.completed]
    
    def get_todos_by_date(self, date: str, show_completed: bool = True) -> List[Todo]:
        """指定された日付のTODOリストを取得"""
        todos = self.get_todos(show_completed)
        return [todo for todo in todos if todo.due_date == date]
    
    def get_todos_by_month(self, year: int, month: int, show_completed: bool = True) -> Dict[str, List[Todo]]:
        """指定された月のTODOを日付ごとにグループ化して取得"""
        todos = self.get_todos(show_completed)
        month_todos = {}
        
        for todo in todos:
            if todo.due_date:
                try:
                    todo_date = datetime.strptime(todo.due_date, "%Y-%m-%d")
                    if todo_date.year == year and todo_date.month == month:
                        date_key = todo.due_date
                        if date_key not in month_todos:
                            month_todos[date_key] = []
                        month_todos[date_key].append(todo)
                except ValueError:
                    continue
        
        return month_todos
    
    def get_todo_by_id(self, todo_id: int) -> Optional[Todo]:
        """IDでTODOを検索"""
        for todo in self.todos:
            if todo.id == todo_id:
                return todo
        return None
    
    def complete_todo(self, todo_id: int) -> bool:
        """TODOを完了状態にする"""
        todo = self.get_todo_by_id(todo_id)
        if todo:
            todo.completed = True
            self.save_todos()
            return True
        return False
    
    def uncomplete_todo(self, todo_id: int) -> bool:
        """TODOを未完了状態にする"""
        todo = self.get_todo_by_id(todo_id)
        if todo:
            todo.completed = False
            self.save_todos()
            return True
        return False
    
    def delete_todo(self, todo_id: int) -> bool:
        """TODOを削除"""
        todo = self.get_todo_by_id(todo_id)
        if todo:
            self.todos.remove(todo)
            self.save_todos()
            return True
        return False
    
    def update_todo(self, todo_id: int, title: str = None, description: str = None, due_date: str = None) -> bool:
        """TODOを更新"""
        todo = self.get_todo_by_id(todo_id)
        if todo:
            if title is not None:
                todo.title = title
            if description is not None:
                todo.description = description
            if due_date is not None:
                todo.due_date = due_date
            self.save_todos()
            return True
        return False
    
    def clear_completed(self) -> int:
        """完了済みのTODOをすべて削除"""
        completed_todos = [todo for todo in self.todos if todo.completed]
        count = len(completed_todos)
        self.todos = [todo for todo in self.todos if not todo.completed]
        self.save_todos()
        return count
