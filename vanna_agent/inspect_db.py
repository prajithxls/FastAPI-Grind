import sqlite3

conn = sqlite3.connect("../backend/warehouse.db")
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
print("Tables:", tables)

for t in tables:
    c.execute(f"PRAGMA table_info({t})")
    cols = [(col[1], col[2]) for col in c.fetchall()]
    c.execute(f"SELECT COUNT(*) FROM {t}")
    count = c.fetchone()[0]
    c.execute(f"SELECT * FROM {t} LIMIT 3")
    rows = c.fetchall()
    print(f"\n=== {t} ({count} rows) ===")
    print("Columns:", cols)
    print("Sample:", rows)

conn.close()
