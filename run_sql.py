import sys
from sqlalchemy import text
from backend.app.main import app
from backend.app.core.database import db

def main():
    print("=" * 60)
    print("  AI TRAFFIC ANALYTICS — INTERACTIVE SQL TERMINAL")
    print("=" * 60)
    print("Type your SQL query and press Enter (or type 'exit' / 'quit'):\n")

    with app.app_context():
        while True:
            try:
                query = input("sql> ").strip()
                if not query:
                    continue
                if query.lower() in ("exit", "quit", "q"):
                    print("Exiting SQL shell.")
                    break
                
                # Execute query
                res = db.session.execute(text(query))
                
                if query.lower().startswith(("select", "show", "describe", "explain")):
                    rows = res.fetchall()
                    if not rows:
                        print("Empty set (0 rows).\n")
                    else:
                        keys = res.keys()
                        print("\n" + " | ".join(keys))
                        print("-" * 60)
                        for row in rows:
                            print(" | ".join(str(val) for val in row))
                        print(f"\n({len(rows)} rows returned)\n")
                else:
                    db.session.commit()
                    print(f"Query OK, {res.rowcount} row(s) affected.\n")
            except KeyboardInterrupt:
                print("\nExiting.")
                break
            except Exception as e:
                print(f"Error: {e}\n")

if __name__ == "__main__":
    main()
