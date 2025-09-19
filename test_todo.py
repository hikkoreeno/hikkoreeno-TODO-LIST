#!/usr/bin/env python3
"""
TODOアプリのテストスクリプト
基本機能の動作確認を行います
"""

import os
import json
from todo import TodoManager, Todo


def test_todo_manager():
    """TodoManagerクラスの基本機能をテスト"""
    print("🧪 TODOアプリのテストを開始します...\n")
    
    # テスト用のデータファイル
    test_file = "test_todos.json"
    
    # 既存のテストファイルを削除
    if os.path.exists(test_file):
        os.remove(test_file)
    
    # TodoManagerのインスタンスを作成
    manager = TodoManager(test_file)
    
    print("1. TODOの追加テスト")
    print("-" * 30)
    
    # TODOを追加
    todo1 = manager.add_todo("買い物に行く", "牛乳、パン、卵を買う")
    todo2 = manager.add_todo("宿題をする")
    todo3 = manager.add_todo("運動する", "30分ジョギング")
    
    print(f"✅ TODO追加: {todo1}")
    print(f"✅ TODO追加: {todo2}")
    print(f"✅ TODO追加: {todo3}")
    print(f"📊 合計TODOs: {len(manager.get_todos())}")
    
    print("\n2. TODOリスト表示テスト")
    print("-" * 30)
    
    todos = manager.get_todos()
    for todo in todos:
        print(f"📝 {todo}")
        if todo.description:
            print(f"   📄 {todo.description}")
    
    print("\n3. TODO完了テスト")
    print("-" * 30)
    
    # TODOを完了にする
    success = manager.complete_todo(1)
    print(f"✅ TODO完了（ID:1）: {'成功' if success else '失敗'}")
    
    # 完了状態を確認
    todo = manager.get_todo_by_id(1)
    print(f"📊 TODO（ID:1）完了状態: {todo.completed}")
    
    print("\n4. TODO更新テスト")
    print("-" * 30)
    
    # TODOを更新
    success = manager.update_todo(2, "数学の宿題をする", "第3章の問題を解く")
    print(f"✏️ TODO更新（ID:2）: {'成功' if success else '失敗'}")
    
    updated_todo = manager.get_todo_by_id(2)
    print(f"📝 更新後: {updated_todo}")
    print(f"   📄 {updated_todo.description}")
    
    print("\n5. 未完了TODOのみ表示テスト")
    print("-" * 30)
    
    incomplete_todos = manager.get_todos(show_completed=False)
    print(f"📊 未完了TODO数: {len(incomplete_todos)}")
    for todo in incomplete_todos:
        print(f"⭕ {todo}")
    
    print("\n6. データ永続化テスト")
    print("-" * 30)
    
    # 新しいマネージャーインスタンスでデータを読み込み
    manager2 = TodoManager(test_file)
    loaded_todos = manager2.get_todos()
    print(f"💾 読み込み成功: {len(loaded_todos)}件のTODO")
    
    for todo in loaded_todos:
        status = "完了" if todo.completed else "未完了"
        print(f"📝 ID:{todo.id} - {todo.title} ({status})")
    
    print("\n7. TODO削除テスト")
    print("-" * 30)
    
    # TODOを削除
    success = manager2.delete_todo(3)
    print(f"🗑️ TODO削除（ID:3）: {'成功' if success else '失敗'}")
    print(f"📊 削除後のTODO数: {len(manager2.get_todos())}")
    
    print("\n8. 完了済みTODO一括削除テスト")
    print("-" * 30)
    
    # もう一つTODOを追加して完了にする
    todo4 = manager2.add_todo("テストTODO", "削除テスト用")
    manager2.complete_todo(todo4.id)
    
    print(f"📊 削除前の完了済みTODO数: {len([t for t in manager2.get_todos() if t.completed])}")
    cleared_count = manager2.clear_completed()
    print(f"🧹 削除した完了済みTODO数: {cleared_count}")
    print(f"📊 削除後の総TODO数: {len(manager2.get_todos())}")
    
    print("\n✅ すべてのテストが完了しました！")
    
    # テストファイルを削除
    if os.path.exists(test_file):
        os.remove(test_file)
        print(f"🧹 テストファイル（{test_file}）を削除しました")


def test_todo_class():
    """Todoクラスの基本機能をテスト"""
    print("\n🧪 Todoクラスのテスト")
    print("-" * 30)
    
    # Todoインスタンスを作成
    todo = Todo(1, "テストTODO", "これはテスト用のTODOです")
    print(f"📝 作成: {todo}")
    print(f"📄 説明: {todo.description}")
    print(f"📅 作成日時: {todo.created_at}")
    
    # 辞書変換テスト
    todo_dict = todo.to_dict()
    print(f"📊 辞書変換: {todo_dict}")
    
    # 辞書からTODO作成テスト
    todo2 = Todo.from_dict(todo_dict)
    print(f"📝 辞書から復元: {todo2}")
    
    print("✅ Todoクラステスト完了")


if __name__ == "__main__":
    test_todo_class()
    test_todo_manager()
