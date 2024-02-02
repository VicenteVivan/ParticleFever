document.addEventListener("DOMContentLoaded", (event) => {
    plotEnergyChart();
});

let energyChart;

function plotEnergyChart() {
    let ctx = document.getElementById("energyChart").getContext("2d");
    energyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Average KE G1",
                    data: [],
                    borderColor: "#F55A3C", // Red
                    tension: 0.1,
                },
                {
                    label: "Average KE G2",
                    data: [],
                    borderColor: "#F5D259", // Yellow
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Average KE",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Time (Seconds)",
                    },
                },
            },
        },
    });

    document.addEventListener("update-kinetic-energy-chart", function (e) {
        const { averageKEG1, averageKEG2 } = e.detail;
        updateChart(energyChart, averageKEG1, averageKEG2);
    });

    function updateChart(chart, averageKEG1, averageKEG2) {
        const label = chart.data.labels.length + 1; // Assuming updates every second
        chart.data.labels.push(label.toString());

        chart.data.datasets[0].data.push(averageKEG1);
        chart.data.datasets[1].data.push(averageKEG2);

        chart.update();
    }
}

function resetChartData(chart) {
    chart.data.labels = []; // Reset time labels
    chart.data.datasets.forEach((dataset) => {
        dataset.data = []; // Reset data points
    });
    chart.update();
}

document
    .getElementById("reloadSimulation")
    .addEventListener("click", function () {
        createBalls();
        resetChartData(energyChart);
        plotEnergyChart();
    });
