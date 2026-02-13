// Main application JavaScript
// 메인 애플리케이션 JavaScript

class ApartmentRankingApp {
    constructor() {
        this.tables = [];
        this.tableCounter = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Add first ranking table by default
        this.addRankingTable();
    }

    setupEventListeners() {
        document.getElementById('addRankingTable').addEventListener('click', () => {
            this.addRankingTable();
        });
    }

    addRankingTable() {
        this.tableCounter++;
        const template = document.getElementById('rankingTableTemplate');
        const clone = template.content.cloneNode(true);
        
        // Set table number
        clone.querySelector('.table-number').textContent = this.tableCounter;
        
        // Get the container
        const container = document.getElementById('rankingTablesContainer');
        container.appendChild(clone);
        
        // Get the newly added table element
        const tableElement = container.lastElementChild;
        
        // Create table instance
        const table = new RankingTable(tableElement, this.tableCounter);
        this.tables.push(table);
        
        // Setup close button
        tableElement.querySelector('.btn-close').addEventListener('click', () => {
            this.removeTable(tableElement, table);
        });
    }

    removeTable(element, table) {
        const index = this.tables.indexOf(table);
        if (index > -1) {
            this.tables.splice(index, 1);
        }
        element.remove();
    }
}

class RankingTable {
    constructor(element, id) {
        this.element = element;
        this.id = id;
        this.selectedItems = new Set();
        this.currentData = [];
        this.chart = null;
        
        this.setupFilters();
        this.setupEventListeners();
        this.setDefaultDates();
    }

    setupFilters() {
        // Setup region filters
        const nationwide = this.element.querySelector('.region-nationwide');
        const city = this.element.querySelector('.region-city');
        const district = this.element.querySelector('.region-district');
        const dong = this.element.querySelector('.region-dong');
        
        nationwide.addEventListener('change', (e) => {
            const selected = e.target.value;
            city.innerHTML = '<option value="">시/구 선택 (Select City/District)</option>';
            district.innerHTML = '<option value="">구 선택 (Select District)</option>';
            dong.innerHTML = '<option value="">동 선택 (Select Dong)</option>';
            
            if (selected && regionData[selected]) {
                city.disabled = false;
                regionData[selected].cities.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c;
                    option.textContent = c;
                    city.appendChild(option);
                });
            } else {
                city.disabled = true;
                district.disabled = true;
                dong.disabled = true;
            }
        });
        
        city.addEventListener('change', (e) => {
            const nationwide = this.element.querySelector('.region-nationwide').value;
            const selected = e.target.value;
            district.innerHTML = '<option value="">구 선택 (Select District)</option>';
            dong.innerHTML = '<option value="">동 선택 (Select Dong)</option>';
            
            if (selected && regionData[nationwide] && regionData[nationwide].districts[selected]) {
                district.disabled = false;
                regionData[nationwide].districts[selected].forEach(d => {
                    const option = document.createElement('option');
                    option.value = d;
                    option.textContent = d;
                    district.appendChild(option);
                });
            } else {
                district.disabled = true;
                dong.disabled = true;
            }
        });
    }

    setDefaultDates() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        
        this.element.querySelector('.date-start').value = startDate.toISOString().split('T')[0];
        this.element.querySelector('.date-end').value = endDate.toISOString().split('T')[0];
    }

    setupEventListeners() {
        // Search button
        this.element.querySelector('.btn-search').addEventListener('click', () => {
            this.performSearch();
        });
        
        // Reset button
        this.element.querySelector('.btn-reset').addEventListener('click', () => {
            this.resetFilters();
        });
        
        // View toggle
        this.element.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.dataset.view);
            });
        });
        
        // Select all checkbox
        this.element.querySelector('.checkbox-all').addEventListener('change', (e) => {
            this.toggleAllCheckboxes(e.target.checked);
        });
    }

    resetFilters() {
        this.element.querySelector('.region-nationwide').value = '';
        this.element.querySelector('.region-city').innerHTML = '<option value="">시/구 선택</option>';
        this.element.querySelector('.region-district').innerHTML = '<option value="">구 선택</option>';
        this.element.querySelector('.region-dong').innerHTML = '<option value="">동 선택</option>';
        this.element.querySelector('.region-city').disabled = true;
        this.element.querySelector('.region-district').disabled = true;
        this.element.querySelector('.region-dong').disabled = true;
        
        this.element.querySelector('.pyeong-min').value = '20';
        this.element.querySelector('.pyeong-max').value = '30';
        
        this.setDefaultDates();
        
        this.element.querySelector('.ranking-count').value = '30';
        
        // Clear results
        const tbody = this.element.querySelector('.ranking-tbody');
        tbody.innerHTML = '<tr class="no-data"><td colspan="8">검색 버튼을 눌러 데이터를 조회하세요. (Click search to load data)</td></tr>';
    }

    performSearch() {
        // Show loading
        const loading = this.element.querySelector('.loading-indicator');
        loading.style.display = 'block';
        
        // Simulate API call delay
        setTimeout(() => {
            this.executeSearch();
            loading.style.display = 'none';
        }, 800);
    }

    executeSearch() {
        // Get filter values
        const filters = {
            nationwide: this.element.querySelector('.region-nationwide').value,
            city: this.element.querySelector('.region-city').value,
            district: this.element.querySelector('.region-district').value,
            dong: this.element.querySelector('.region-dong').value,
            pyeongMin: parseFloat(this.element.querySelector('.pyeong-min').value) || 0,
            pyeongMax: parseFloat(this.element.querySelector('.pyeong-max').value) || 999,
            dateStart: this.element.querySelector('.date-start').value,
            dateEnd: this.element.querySelector('.date-end').value,
            rankingCount: parseInt(this.element.querySelector('.ranking-count').value)
        };
        
        // Filter data
        let filteredData = allApartmentData.filter(apt => {
            // Region filter
            if (filters.nationwide && !apt.region.includes(filters.nationwide)) return false;
            if (filters.city && !apt.region.includes(filters.city)) return false;
            if (filters.district && !apt.region.includes(filters.district)) return false;
            if (filters.dong && !apt.region.includes(filters.dong)) return false;
            
            // Pyeong filter
            if (apt.pyeong < filters.pyeongMin || apt.pyeong > filters.pyeongMax) return false;
            
            // Date filter
            if (filters.dateStart && apt.date < filters.dateStart) return false;
            if (filters.dateEnd && apt.date > filters.dateEnd) return false;
            
            return true;
        });
        
        // Sort by price (descending)
        filteredData.sort((a, b) => b.price - a.price);
        
        // Limit to ranking count
        filteredData = filteredData.slice(0, filters.rankingCount);
        
        // Store current data
        this.currentData = filteredData;
        this.selectedItems = new Set(filteredData.map(apt => apt.id));
        
        // Display results
        this.displayResults(filteredData);
    }

    displayResults(data) {
        const tbody = this.element.querySelector('.ranking-tbody');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr class="no-data"><td colspan="8">검색 결과가 없습니다. (No results found)</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        data.forEach((apt, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = apt.id;
            
            const changeClass = apt.change > 0 ? 'price-up' : apt.change < 0 ? 'price-down' : 'price-same';
            
            tr.innerHTML = `
                <td><input type="checkbox" class="checkbox-row" data-id="${apt.id}" checked></td>
                <td>${index + 1}</td>
                <td>${apt.name}</td>
                <td>${apt.region}</td>
                <td>${apt.pyeong}평</td>
                <td>${apt.price.toLocaleString()}만원</td>
                <td>${apt.date}</td>
                <td class="${changeClass}">${Math.abs(apt.change).toFixed(1)}%</td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Setup checkbox listeners
        this.element.querySelectorAll('.checkbox-row').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                const row = e.target.closest('tr');
                
                if (e.target.checked) {
                    this.selectedItems.add(id);
                    row.classList.remove('disabled');
                } else {
                    this.selectedItems.delete(id);
                    row.classList.add('disabled');
                }
                
                this.updateChart();
            });
        });
        
        // Update chart if in chart view
        if (this.element.querySelector('.btn-view-chart').classList.contains('active')) {
            this.updateChart();
        }
    }

    toggleAllCheckboxes(checked) {
        this.element.querySelectorAll('.checkbox-row').forEach(cb => {
            cb.checked = checked;
            const id = parseInt(cb.dataset.id);
            const row = cb.closest('tr');
            
            if (checked) {
                this.selectedItems.add(id);
                row.classList.remove('disabled');
            } else {
                this.selectedItems.delete(id);
                row.classList.add('disabled');
            }
        });
        
        this.updateChart();
    }

    toggleView(view) {
        // Update button states
        this.element.querySelectorAll('.btn-view').forEach(btn => {
            btn.classList.remove('active');
        });
        this.element.querySelector(`.btn-view-${view}`).classList.add('active');
        
        // Toggle views
        if (view === 'table') {
            this.element.querySelector('.table-view').style.display = 'block';
            this.element.querySelector('.chart-view').style.display = 'none';
        } else {
            this.element.querySelector('.table-view').style.display = 'none';
            this.element.querySelector('.chart-view').style.display = 'block';
            this.updateChart();
        }
    }

    updateChart() {
        const canvas = this.element.querySelector('.ranking-chart');
        
        // Filter data by selected items
        const selectedData = this.currentData.filter(apt => this.selectedItems.has(apt.id));
        
        if (selectedData.length === 0) {
            // Destroy existing chart if no data
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
            return;
        }
        
        // Prepare chart data
        const labels = selectedData.map(apt => apt.name.length > 15 ? apt.name.substring(0, 15) + '...' : apt.name);
        const prices = selectedData.map(apt => apt.price);
        const changes = selectedData.map(apt => apt.change);
        
        // Generate colors based on change
        const colors = changes.map(change => {
            if (change > 0) return 'rgba(231, 76, 60, 0.7)'; // Red for increase
            if (change < 0) return 'rgba(52, 152, 219, 0.7)'; // Blue for decrease
            return 'rgba(149, 165, 166, 0.7)'; // Gray for no change
        });
        
        const borderColors = changes.map(change => {
            if (change > 0) return 'rgba(231, 76, 60, 1)';
            if (change < 0) return 'rgba(52, 152, 219, 1)';
            return 'rgba(149, 165, 166, 1)';
        });
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Create new chart
        this.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '거래가격 (Transaction Price, 만원)',
                    data: prices,
                    backgroundColor: colors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const price = prices[index].toLocaleString();
                                const change = changes[index];
                                const changeText = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
                                return [
                                    `가격: ${price}만원`,
                                    `전월대비: ${changeText}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '만원';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ApartmentRankingApp();
});
