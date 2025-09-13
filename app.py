import sqlite3
import pandas as pd
from flask import Flask, jsonify, render_template
from flask_cors import CORS

class SalesAnalyzer:
    def __init__(self, db_path='sales.db'):
        self.db_path = db_path
        
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def get_monthly_sales(self):
        query = """
        SELECT 
            strftime('%Y-%m', sale_date) as month,
            SUM(total_amount) as total_sales,
            COUNT(*) as total_transactions
        FROM sales 
        GROUP BY strftime('%Y-%m', sale_date)
        ORDER BY month
        """
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
            return df.to_dict('records')
    
    def get_top_products(self, limit=5):
        query = f"""
        SELECT 
            p.product_name,
            SUM(s.quantity) as total_sold,
            SUM(s.total_amount) as revenue
        FROM sales s
        JOIN products p ON s.product_id = p.product_id
        GROUP BY s.product_id, p.product_name
        ORDER BY revenue DESC
        LIMIT {limit}
        """
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
            return df.to_dict('records')
    
    def get_sales_by_city(self):
        query = """
        SELECT 
            c.city,
            COUNT(s.sale_id) as total_orders,
            SUM(s.total_amount) as total_revenue
        FROM sales s
        JOIN customers c ON s.customer_id = c.customer_id
        GROUP BY c.city
        ORDER BY total_revenue DESC
        """
        with self.get_connection() as conn:
            df = pd.read_sql_query(query, conn)
            return df.to_dict('records')
    
    def get_dashboard_summary(self):
        with self.get_connection() as conn:
            total_sales = pd.read_sql_query(
                "SELECT SUM(total_amount) as total FROM sales", conn
            ).iloc[0]['total']
            
            total_transactions = pd.read_sql_query(
                "SELECT COUNT(*) as total FROM sales", conn
            ).iloc[0]['total']
            
            total_customers = pd.read_sql_query(
                "SELECT COUNT(DISTINCT customer_id) as total FROM sales", conn
            ).iloc[0]['total']
            
            avg_order = total_sales / total_transactions if total_transactions > 0 else 0
            
            return {
                'total_sales': int(total_sales),
                'total_transactions': int(total_transactions),
                'total_customers': int(total_customers),
                'avg_order_value': int(avg_order)
            }

app = Flask(__name__)
CORS(app)
analyzer = SalesAnalyzer()

@app.route('/api/summary')
def get_summary():
    return jsonify(analyzer.get_dashboard_summary())

@app.route('/api/monthly-sales')
def get_monthly_sales():
    return jsonify(analyzer.get_monthly_sales())

@app.route('/api/top-products')
def get_top_products():
    return jsonify(analyzer.get_top_products())

@app.route('/api/sales-by-city')
def get_sales_by_city():
    return jsonify(analyzer.get_sales_by_city())

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    print("🚀 Starting Sales Dashboard on http://localhost:5000")
    app.run(debug=True)