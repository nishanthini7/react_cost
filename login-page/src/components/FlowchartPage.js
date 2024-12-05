import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

// Register necessary components for Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const FlowChartPage = () => {
    const [filters, setFilters] = useState({
        account_name: '',
        application_name: '',
        environment: '',
        service: '',
    });
    const [filterOptions, setFilterOptions] = useState({
        accountNames: [],
        applicationNames: [],
        environments: [],
        services: [],
    });
    const [billingData, setBillingData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: 'rgba(75,192,192,0.6)',
            },
        ],
    });
    const [topAppsData, setTopAppsData] = useState({
        labels: [],
        datasets: [
            { 
                data: [],
                backgroundColor: 'rgba(255,99,132,0.6)',
            },
        ],
    });
    const [overallSpend, setOverallSpend] = useState(0);
    const [prodVsNonProdData, setProdVsNonProdData] = useState({
        labels: [],
        datasets: [
            {
                type: "bar",
                label: 'Prod Costs',
                data: [],
                backgroundColor: 'rgba(75,192,192,0.6)',
            },
            {
                type: "bar",
                label: 'Non-Prod Costs',
                data: [],
                backgroundColor: 'rgba(255,99,132,0.6)',
            },
            {
                type: "line",
                label: 'Trend (Prod + Non-Prod)',
                data: [],
                borderColor: 'rgba(153,102,255,1)',
                fill: false,
                tension: 0.4,
            },
        ],
    });

    // Fetch filter options
    const fetchFilterOptions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/filter-options');
            const data = await response.json();
            setFilterOptions(data);
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    // Fetch billing data based on filters
    const fetchBillingData = async () => {
        try {
            const query = Object.keys(filters)
                .map((key) => (filters[key] ? `${key}=${encodeURIComponent(filters[key])}` : ''))
                .filter(Boolean)
                .join('&');

            const response = await fetch(`http://localhost:5000/api/billing?${query}`);
            const data = await response.json();

            const aggregatedData = {};
            data.forEach((item) => {
                const month = dayjs(item.billing_month).format('MMM');  // Shortened month name
                if (!aggregatedData[month]) {
                    aggregatedData[month] = 0;
                }
                aggregatedData[month] += parseFloat(item.total_cost);
            });

            const labels = Object.keys(aggregatedData);
            const costs = Object.values(aggregatedData);

            setBillingData({
                labels,
                datasets: [
                    {
                        label: 'Total Cost',
                        data: costs,
                        backgroundColor: '#00A9E0',
                    },
                ],
            });

            const totalSpend = costs.reduce((sum, cost) => sum + cost, 0);
            setOverallSpend(totalSpend);
        } catch (error) {
            console.error('Error fetching billing data:', error);
        }
    };

    // Fetch top utilized apps
    const fetchTopAppsData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/top-apps');
            const data = await response.json();

            const labels = data.map((item) => item.application_name);
            const costs = data.map((item) => parseFloat(item.total_cost));

            setTopAppsData({
                labels,
                datasets: [
                    {
                        label: 'Total Cost',
                        data: costs,
                        backgroundColor: '#E07B00',
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching top utilized apps:', error);
        }
    };

    // Fetch prod vs non-prod data
    const fetchProdVsNonProdData = async () => {
        try {
            const query = Object.keys(filters)
                .map((key) => (filters[key] ? `${key}=${encodeURIComponent(filters[key])}` : ''))
                .filter(Boolean)
                .join('&');

            const response = await fetch(`http://localhost:5000/api/billing/prod-vs-nonprod?${query}`);
            const data = await response.json();

            const labels = data.map((item) => dayjs(item.month).format('MMM')); // Format month as short name (e.g., 'Jun', 'Jul')
            const prodCosts = data.map((item) => parseFloat(item.prod_cost));
            const nonProdCosts = data.map((item) => parseFloat(item.non_prod_cost));

            setProdVsNonProdData({
                labels,
                datasets: [
                    {
                        type: "bar",
                        label: 'Prod Costs',
                        data: prodCosts,
                        backgroundColor: '#00A9E0',
                    },
                    {
                        type: "bar",
                        label: 'Non-Prod Costs',
                        data: nonProdCosts,
                        backgroundColor: '#E07B00',
                    },
                    {
                        type: "line",
                        label: 'Trend (Prod + Non-Prod)',
                        data: prodCosts.map((cost, idx) => cost + nonProdCosts[idx]),
                        borderColor: '#0069B4',
                        fill: false,
                        tension: 0.4,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching prod vs non-prod data:', error);
        }
    };

    // Fetch all data on filter change or component mount
    useEffect(() => {
        fetchFilterOptions();
        fetchBillingData();
        fetchTopAppsData();
        fetchProdVsNonProdData();
    }, [filters]);

    return (
        <div style={{ display: 'flex', flexDirection: 'row', margin: 0, padding: 0, width: '100%', height: '100vh' }}>
            {/* Main Content Section */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: '20px',
                    flex: 3,
                    padding: '20px',
                    justifyContent: 'flex-start',
                    width: 'calc(100% - 320px)',
                    boxSizing: 'border-box',
                }}
            >
                {/* Overall Spend Widget */}
                <div
                    style={{
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        height: '150px', // Adjusted height for smaller widget
                        marginTop: '80px', // Moved it down a bit
                    }}
                >
                    <div style={{
                        marginTop:'15px'
                    }}>
                    <h4 style={{ fontSize: '16px', color: '#333' }}>Overall Spend</h4>
                    <br></br>
                    <h3 style={{ fontSize: '36px', color: '#FF0000', marginTop: '10px' }}>${overallSpend.toFixed(2)}</h3>
                </div>
                </div>
                {/* AWS Billing Costs Widget */}
                <div
                    style={{
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div style={{
                        marginTop:'35px',
                    }}>
                    <h3>AWS Billing Costs (Last 6 Months)</h3>
                    <br></br>
                    <br></br>
                    <Bar
                        data={billingData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { display: false }, // Hides the legend
                            },
                            scales: {
                                x: { grid: { display: false } },
                                y: { grid: { display: false } },
                            },
                        }}
                    />
                    </div>
                </div>

                {/* Most Utilized Apps Widget */}
                <div
                    style={{
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div style={{
                        marginTop:'35px'
                    }}>
                    <h3>Most Utilized Apps (Top 5)</h3>
                    <br></br>
                    <br></br>
                    <Bar
                        data={topAppsData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { display: false }, // Hides the legend
                            },
                            scales: {
                                x: { grid: { display: false } },
                                y: { grid: { display: false } },
                            },
                        }}
                    />
                    </div>
                </div>

                {/* Production vs Non-Production Costs Widget */}
                <div
                    style={{
                        padding: '20px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div style={{
                        marginTop:'35px'
                    }}>
                    <h3>Production vs Non-Production Costs</h3>
                    <br></br>
                    <br></br>
                    <Line
                        data={prodVsNonProdData}
                        options={{
                            responsive: true,
                            scales: {
                                x: { grid: { display: false } },
                                y: { grid: { display: false } },
                            },
                        }}
                    />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    backgroundColor: '#f4f4f4',
                    width: '320px',
                    height: '100vh',
                    boxSizing: 'border-box',
                }}
            >
                <div style={{ marginBottom: '20px' }}>
                    <h3>Filters</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Account</label>
                        <select
                            value={filters.account_name}
                            onChange={(e) => setFilters({ ...filters, account_name: e.target.value })}
                            style={{
                                width: '100%',
                                height: '40px',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        >
                            <option value="">All</option>
                            {filterOptions.accountNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Application</label>
                        <select
                            value={filters.application_name}
                            onChange={(e) => setFilters({ ...filters, application_name: e.target.value })}
                            style={{
                                width: '100%',
                                height: '40px',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        >
                            <option value="">All</option>
                            {filterOptions.applicationNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Environment</label>
                        <select
                            value={filters.environment}
                            onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
                            style={{
                                width: '100%',
                                height: '40px',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        >
                            <option value="">All</option>
                            {filterOptions.environments.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Service</label>
                        <select
                            value={filters.service}
                            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                            style={{
                                width: '100%',
                                height: '40px',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        >
                            <option value="">All</option>
                            {filterOptions.services.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FlowChartPage;
