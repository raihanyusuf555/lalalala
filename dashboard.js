class SalesDashboard {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.init();
    }
    
    async init() {
        try {
            await this.loadSummary();
            await this.loadMonthlySales();
            await this.loadTopProducts();
            await this.loadSalesByCity();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to load dashboard data. Please check if the API server is running.');
        }
    }
    
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${endpoint}:`, error);
            throw error;
        }
    }
    
    formatCurrency(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }
    
    showError(message) {
        document.getElementById('summaryCards').innerHTML = `
            <div class="card" style="grid-column: 1 / -1; background: rgba(245, 101, 101, 0.1); border-left: 4px solid #f56565;">
                <div class="label" style="color: #f56565;">⚠️ Error</div>
                <div style="color: #666; margin-top: 10px;">${message}</div>
            </div>
        `;
    }
    
    showLoading() {
        document.getElementById('summaryCards').innerHTML = `
            <div class="card" style="grid-column: 1 / -1;">
                <div class="label">🔄 Loading dashboard data...</div>
            </div>
        `;
    }
    
    async loadSummary() {
        this.showLoading();
        const data = await this.fetchData('/summary');
        document.getElementById('summaryCards').innerHTML = `
            <div class="card">
                <div class="label">💰 Total Sales</div>
                <div class="value">${this.formatCurrency(data.total_sales)}</div>
            </div>
            <div class="card">
                <div class="label">📦 Transactions</div>
                <div class="value">${data.total_transactions.toLocaleString()}</div>
            </div>
            <div class="card">
                <div class="label">👥 Customers</div>
                <div class="value">${data.total_customers.toLocaleString()}</div>
            </div>
            <div class="card">
                <div class="label">💳 Avg Order</div>
                <div class="value">${this.formatCurrency(data.avg_order_value)}</div>
            </div>
        `;
    }
    
    async loadMonthlySales() {
        const data = await this.fetchData('/monthly-sales');
        const ctx = document.getElementById('monthlySalesChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.month),
                datasets: [{
                    label: 'Monthly Sales',
                    data: data.map(item => item.total_sales),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    async loadTopProducts() {
        const data = await this.fetchData('/top-products');
        const ctx = document.getElementById('topProductsChart').getContext('2d');
        
        const colors = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565', '#38b2ac', '#805ad5'];
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.product_name),
                datasets: [{
                    data: data.map(item => item.revenue),
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.raw);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async loadSalesByCity() {
        const data = await this.fetchData('/sales-by-city');
        const ctx = document.getElementById('salesByCityChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.city),
                datasets: [{
                    label: 'Revenue by City',
                    data: data.map(item => item.total_revenue),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(102, 126, 234, 1)',
                    hoverBorderColor: '#5a67d8'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SalesDashboard();
});