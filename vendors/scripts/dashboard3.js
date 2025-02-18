var options = {
    series: [
        {
            name: "Nhiệt độ (°C)",
            data: [22, 23, 24, 25, 26, 27, 28, 28, 27, 26, 24, 23]
        },
        {
            name: "Độ ẩm (%)",
            data: [55, 57, 60, 62, 65, 68, 70, 72, 70, 67, 63, 58]
        },
        {
            name: "Ánh sáng (lux)",
            data: [300, 350, 400, 420, 450, 500, 520, 510, 480, 440, 400, 350]
        }
    ],
    chart: {
        height: 300,
        type: 'line',
        zoom: {
            enabled: false,
        },
        dropShadow: {
            enabled: true,
            color: '#000',
            top: 10,
            left: 5,
            blur: 10,
            opacity: 0.2
        },
        toolbar: {
            show: false
        }
    },
    colors: ['#ff5733', '#3498db', '#f1c40f'],
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: [3, 3, 3],
        curve: 'smooth'
    },
    grid: {
        show: false,
    },
    markers: {
        colors: ['#ff5733', '#3498db', '#f1c40f'],
        size: 5,
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: {
            sizeOffset: 2
        }
    },
    xaxis: {
        categories: ['6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h'],
        labels: {
            style: {
                colors: '#8c9094'
            }
        }
    },
    yaxis: {
        labels: {
            style: {
                colors: '#8c9094'
            }
        }
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: 0,
        labels: {
            useSeriesColors: true
        },
        markers: {
            width: 10,
            height: 10,
        }
    }
};


var options2 = {
	series: [{
		name: 'Week',
		data: [{
			x: 'Monday',
			y: 21
		}, {
			x: 'Tuesday',
			y: 22
		}, {
			x: 'Wednesday',
			y: 10
		}, {
			x: 'Thursday',
			y: 28
		}, {
			x: 'Friday',
			y: 16
		}, {
			x: 'Saturday',
			y: 21
		}, {
			x: 'Sunday',
			y: 13
		}],
	}],
	chart: {
		height: 70,
		type: 'bar',
		toolbar: {
			show: false,
		},
		sparkline: {
			enabled: true
		},
	},
	plotOptions: {
		bar: {
			columnWidth: '25px',
			distributed: true,
			endingShape: 'rounded',
		}
	},
	dataLabels: {
		enabled: false
	},
	legend: {
		show: false
	},
	xaxis: {
		type: 'category',
		lines: {
			show: false,
		},
		axisBorder: {
			show: false,
		},
		labels: {
			show: false,
		},
	},
	yaxis: [{
		y: 0,
		offsetX: 0,
		offsetY: 0,
		labels: {
			show: false,
		},
		padding: {
			left: 0,
			right: 0
		},
	}],
};

var options3 = {
	series: [{
		name: 'Week',
		data: [{
			x: 'Monday',
			y: 10
		}, {
			x: 'Tuesday',
			y: 8
		}, {
			x: 'Wednesday',
			y: 15
		}, {
			x: 'Thursday',
			y: 12
		}, {
			x: 'Friday',
			y: 20
		}, {
			x: 'Saturday',
			y: 14
		}, {
			x: 'Sunday',
			y: 7
		}],
	}],
	colors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
	chart: {
		height: 70,
		type: 'bar',
		toolbar: {
			show: false,
		},
		sparkline: {
			enabled: true
		},
	},
	plotOptions: {
		bar: {
			columnWidth: '25px',
			distributed: true,
			endingShape: 'rounded',
		}
	},
	dataLabels: {
		enabled: false
	},
	legend: {
		show: false
	},
	xaxis: {
		type: 'category',
		lines: {
			show: false,
		},
		axisBorder: {
			show: false,
		},
		labels: {
			show: false,
		},
	},
	yaxis: [{
		y: 0,
		offsetX: 0,
		offsetY: 0,
		labels: {
			show: false,
		},
		padding: {
			left: 0,
			right: 0
		},
	}],
};

var options4 = {
	series: [50, 60, 70, 80],
	chart: {
		height: 350,
		type: 'radialBar',
	},
	colors: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#e76f51'],
	plotOptions: {
		radialBar: {
			dataLabels: {
				name: {
					fontSize: '22px',
				},
				value: {
					fontSize: '16px',
				},
				total: {
					show: true,
					label: 'Total',
					formatter: function (w) {
						return 260
					}
				}
			}
		}
	},
	labels: ['Flu', 'Covid-19', 'Pheumoniae', 'Diabeties'],
};

var chart = new ApexCharts(document.querySelector("#activities-chart"), options);
chart.render();

var chart2 = new ApexCharts(document.querySelector("#appointment-chart"), options2);
chart2.render();

var chart3 = new ApexCharts(document.querySelector("#surgery-chart"), options3);
chart3.render();

var chart4 = new ApexCharts(document.querySelector("#diseases-chart"), options4);
chart4.render();

// datatable init
$('document').ready(function(){
	$('.data-table').DataTable({
		scrollCollapse: false,
		autoWidth: false,
		responsive: true,
		searching: false,
		bLengthChange: false,
		bPaginate: true,
		bInfo: false,
		columnDefs: [{
			targets: "datatable-nosort",
			orderable: false,
		}],
		"lengthMenu": [[5, 25, 50, -1], [5, 25, 50, "All"]],
		"language": {
			"info": "_START_-_END_ of _TOTAL_ entries",
			searchPlaceholder: "Search",
			paginate: {
				next: '<i class="ion-chevron-right"></i>',
				previous: '<i class="ion-chevron-left"></i>'
			}
		},
	});
});