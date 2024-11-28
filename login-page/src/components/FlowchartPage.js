import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
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
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Total Cost',
                data: [],
                backgroundColor: 'rgba(75,192,192,0.6)',
            },
        ],
    });

    const fetchBillingData = async () => {
        try {
            // Correct query string construction with proper encoding
            const query = Object.keys(filters)
                .map(key => filters[key] ? `${key}=${encodeURIComponent(filters[key])}` : '')
                .filter(Boolean)
                .join('&');

            // Fetch data with filters applied
            const response = await fetch(`http://localhost:5000/api/billing?${query}`);
            const data = await response.json();

            // Update the chart data
            setChartData({
                labels: data.map(item => item.billing_month),
                datasets: [
                    {
                        label: 'Total Cost',
                        data: data.map(item => item.total_cost),
                        backgroundColor: 'rgba(75,192,192,0.6)',
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchBillingData();  // Fetch billing data whenever filters change
    }, [filters]);

    return (
        <div>
            <h1>AWS Billing Dashboard</h1>
            <div>
                <input
                    type="text"
                    placeholder="Account Name"
                    value={filters.account_name}
                    onChange={(e) => setFilters({ ...filters, account_name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Application Name"
                    value={filters.application_name}
                    onChange={(e) => setFilters({ ...filters, application_name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Environment"
                    value={filters.environment}
                    onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Service"
                    value={filters.service}
                    onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                />
            </div>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'AWS Billing Costs (Last 6 Months)',
                        },
                        legend: {
                            display: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default FlowChartPage;
