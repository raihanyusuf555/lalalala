import sqlite3

def create_database():
    conn = sqlite3.connect('sales.db')
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT,
        category TEXT,
        price REAL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY,
        customer_name TEXT,
        email TEXT,
        city TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sales (
        sale_id INTEGER PRIMARY KEY,
        product_id INTEGER,
        customer_id INTEGER,
        sale_date DATE,
        quantity INTEGER,
        total_amount REAL,
        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
    ''')
    
    # Insert sample data
    products_data = [
        (1, 'Laptop Gaming', 'Electronics', 15000000),
        (2, 'Mouse Wireless', 'Electronics', 200000),
        (3, 'Keyboard Mechanical', 'Electronics', 800000),
        (4, 'Monitor 24 inch', 'Electronics', 2500000),
        (5, 'Headset Gaming', 'Electronics', 500000)
    ]
    
    customers_data = [
        (1, 'Ahmad Fauzi', 'ahmad@email.com', 'Jakarta'),
        (2, 'Sari Dewi', 'sari@email.com', 'Surabaya'),
        (3, 'Budi Santoso', 'budi@email.com', 'Bandung'),
        (4, 'Lisa Permata', 'lisa@email.com', 'Jakarta'),
        (5, 'Rudi Wijaya', 'rudi@email.com', 'Medan')
    ]
    
    sales_data = [
        (1, 1, 1, '2024-01-15', 1, 15000000),
        (2, 2, 2, '2024-01-16', 2, 400000),
        (3, 3, 3, '2024-01-17', 1, 800000),
        (4, 4, 4, '2024-01-18', 1, 2500000),
        (5, 5, 5, '2024-01-19', 3, 1500000),
        (6, 1, 2, '2024-02-01', 1, 15000000),
        (7, 2, 1, '2024-02-05', 1, 200000),
        (8, 3, 3, '2024-02-10', 2, 1600000)
    ]
    
    cursor.executemany('INSERT OR REPLACE INTO products VALUES (?, ?, ?, ?)', products_data)
    cursor.executemany('INSERT OR REPLACE INTO customers VALUES (?, ?, ?, ?)', customers_data)
    cursor.executemany('INSERT OR REPLACE INTO sales VALUES (?, ?, ?, ?, ?, ?)', sales_data)
    
    conn.commit()
    conn.close()
    print("✅ Database created successfully!")

if __name__ == '__main__':
    create_database()