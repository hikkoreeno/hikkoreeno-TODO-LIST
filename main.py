#!/usr/bin/env python3
"""
TODOアプリ - コマンドラインインターフェース
使用方法: python main.py
"""

import sys
from todo import TodoManager


class TodoCLI:
    """TODOアプリのコマンドラインインターフェース"""
    
    def __init__(self):
        self.manager = TodoManager()
        self.commands = {
            '1': self.add_todo,
            '2': self.list_todos,
            '3': self.complete_todo,
            '4': self.uncomplete_todo,
            '5': self.delete_todo,
            '6': self.update_todo,
            '7': self.clear_completed,
            '8': self.show_help,
            '9': self.quit_app
        }
    
    def show_menu(self):
        """メニューを表示"""
        print("\n" + "="*50)
        print("           TODOアプリ")
        print("="*50)
        print("1. TODOを追加")
        print("2. TODOリストを表示")
        print("3. TODOを完了にする")
        print("4. TODOを未完了にする")
        print("5. TODOを削除")
        print("6. TODOを編集")
        print("7. 完了済みTODOを全削除")
        print("8. ヘルプ")
        print("9. 終了")
        print("="*50)
    
    def add_todo(self):
        """TODOを追加"""
        print("\n--- TODOを追加 ---")
        title = input("タイトル: ").strip()
        if not title:
            print("❌ タイトルは必須です。")
            return
        
        description = input("説明（オプション）: ").strip()
        todo = self.manager.add_todo(title, description)
        print(f"✅ TODO「{todo.title}」を追加しました。（ID: {todo.id}）")
    
    def list_todos(self):
        """TODOリストを表示"""
        print("\n--- TODOリスト ---")
        show_completed = input("完了済みも表示しますか？ (y/n): ").lower().startswith('y')
        
        todos = self.manager.get_todos(show_completed)
        
        if not todos:
            print("📝 TODOはありません。")
            return
        
        print(f"\n📋 TODOリスト（{len(todos)}件）:")
        print("-" * 60)
        
        for todo in todos:
            status_icon = "✅" if todo.completed else "⭕"
            print(f"{status_icon} ID:{todo.id:2d} | {todo.title}")
            if todo.description:
                print(f"     📄 {todo.description}")
            print(f"     📅 作成日時: {todo.created_at}")
            print("-" * 60)
    
    def complete_todo(self):
        """TODOを完了にする"""
        print("\n--- TODOを完了にする ---")
        try:
            todo_id = int(input("完了にするTODOのID: "))
            if self.manager.complete_todo(todo_id):
                print(f"✅ TODO（ID: {todo_id}）を完了にしました。")
            else:
                print(f"❌ ID {todo_id} のTODOが見つかりません。")
        except ValueError:
            print("❌ 有効なIDを入力してください。")
    
    def uncomplete_todo(self):
        """TODOを未完了にする"""
        print("\n--- TODOを未完了にする ---")
        try:
            todo_id = int(input("未完了にするTODOのID: "))
            if self.manager.uncomplete_todo(todo_id):
                print(f"⭕ TODO（ID: {todo_id}）を未完了にしました。")
            else:
                print(f"❌ ID {todo_id} のTODOが見つかりません。")
        except ValueError:
            print("❌ 有効なIDを入力してください。")
    
    def delete_todo(self):
        """TODOを削除"""
        print("\n--- TODOを削除 ---")
        try:
            todo_id = int(input("削除するTODOのID: "))
            todo = self.manager.get_todo_by_id(todo_id)
            if todo:
                confirm = input(f"「{todo.title}」を削除しますか？ (y/n): ")
                if confirm.lower().startswith('y'):
                    self.manager.delete_todo(todo_id)
                    print(f"🗑️ TODO（ID: {todo_id}）を削除しました。")
                else:
                    print("❌ 削除をキャンセルしました。")
            else:
                print(f"❌ ID {todo_id} のTODOが見つかりません。")
        except ValueError:
            print("❌ 有効なIDを入力してください。")
    
    def update_todo(self):
        """TODOを編集"""
        print("\n--- TODOを編集 ---")
        try:
            todo_id = int(input("編集するTODOのID: "))
            todo = self.manager.get_todo_by_id(todo_id)
            if not todo:
                print(f"❌ ID {todo_id} のTODOが見つかりません。")
                return
            
            print(f"現在のタイトル: {todo.title}")
            new_title = input("新しいタイトル（空白で変更なし）: ").strip()
            
            print(f"現在の説明: {todo.description}")
            new_description = input("新しい説明（空白で変更なし）: ").strip()
            
            title = new_title if new_title else None
            description = new_description if new_description else None
            
            if title or description:
                self.manager.update_todo(todo_id, title, description)
                print(f"✏️ TODO（ID: {todo_id}）を更新しました。")
            else:
                print("❌ 変更はありませんでした。")
                
        except ValueError:
            print("❌ 有効なIDを入力してください。")
    
    def clear_completed(self):
        """完了済みTODOを全削除"""
        print("\n--- 完了済みTODOを全削除 ---")
        completed_todos = [todo for todo in self.manager.get_todos() if todo.completed]
        
        if not completed_todos:
            print("📝 完了済みのTODOはありません。")
            return
        
        print(f"完了済みのTODO（{len(completed_todos)}件）:")
        for todo in completed_todos:
            print(f"  ✅ {todo.title}")
        
        confirm = input(f"\n{len(completed_todos)}件の完了済みTODOを削除しますか？ (y/n): ")
        if confirm.lower().startswith('y'):
            count = self.manager.clear_completed()
            print(f"🗑️ {count}件の完了済みTODOを削除しました。")
        else:
            print("❌ 削除をキャンセルしました。")
    
    def show_help(self):
        """ヘルプを表示"""
        print("\n--- ヘルプ ---")
        print("📖 TODOアプリの使い方:")
        print("1. メニューから番号を選択してEnterキーを押してください")
        print("2. TODOにはIDが自動的に割り当てられます")
        print("3. データは自動的にtodos.jsonファイルに保存されます")
        print("4. 完了済みのTODOは✅、未完了のTODOは⭕で表示されます")
        print("\n💡 ヒント:")
        print("- タイトルは必須ですが、説明はオプションです")
        print("- IDを使ってTODOの操作を行います")
        print("- 完了済みTODOを一括削除できます")
    
    def quit_app(self):
        """アプリを終了"""
        print("\n👋 TODOアプリを終了します。お疲れ様でした！")
        sys.exit(0)
    
    def run(self):
        """メインループ"""
        print("🎉 TODOアプリへようこそ！")
        
        while True:
            try:
                self.show_menu()
                choice = input("\n選択してください (1-9): ").strip()
                
                if choice in self.commands:
                    self.commands[choice]()
                else:
                    print("❌ 無効な選択です。1-9の数字を入力してください。")
                
                input("\nEnterキーを押して続行...")
                
            except KeyboardInterrupt:
                print("\n\n👋 TODOアプリを終了します。")
                break
            except Exception as e:
                print(f"❌ エラーが発生しました: {e}")
                input("Enterキーを押して続行...")


def main():
    """メイン関数"""
    app = TodoCLI()
    app.run()


if __name__ == "__main__":
    main()
