$(function () {
    const schedules = {
        bisque: [
            { rampRate: 80, targetTemp: 250 },
            { rampRate: 200, targetTemp: 1000 },
            { rampRate: 100, targetTemp: 1100 },
            { rampRate: 180, targetTemp: 1695 },
            { rampRate: 80, targetTemp: 1945 }
        ],
        glaze: [
            { rampRate: 150, targetTemp: 1830 },
            { rampRate: 100, targetTemp: 2232 }
        ]
    };

    function updateFormValues(scheduleType) {
        const schedule = schedules[scheduleType];
        $('#segments').empty();
        schedule.forEach((segment, index) => {
            addSegment(segment.rampRate, segment.targetTemp, index);
        });
        calculateTotalTime();
        visualizeSchedule();
    }

    function addSegment(rampRate = 0, targetTemp = 0, id = new Date().getTime()) {
        console.log("Adding segment:", rampRate, targetTemp);
        const segmentHTML = `
            <div class="segment form-row mb-2" data-id="${id}">
                <div class="col-md-5">
                    <label>Ramp Rate (°F/hour):</label>
                    <input type="number" class="form-control rampRate m-0" value="${rampRate}" required>
                </div>
                <div class="col-md-5">
                    <label>Target Temperature (°F):</label>
                    <input type="number" class="form-control targetTemp m-0" value="${targetTemp}" required>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-sm removeSegment mb-1" title="Remove Segment">&minus;</button>
                </div>
            </div>`;
        $('#segments').append(segmentHTML);

        // Remove labels from all but the first segment
        if ($('#segments .segment').length > 1) {
            $('#segments .segment:not(:first)').find('label').remove();
        }
    }

    function removeSegment() {
        $(this).closest('.segment').remove();
        calculateTotalTime();
        visualizeSchedule();
    }

    function calculateTotalTime() {
        console.log("Calculating total time");
        let totalTime = 0;
        let initialTemp = parseFloat($('#initialTemp').val()) || 0;
        $('#segments .segment').each(function () {
            const rampRate = parseFloat($(this).find('.rampRate').val());
            const targetTemp = parseFloat($(this).find('.targetTemp').val());
            if (rampRate > 0) {
                totalTime += Math.abs((targetTemp - initialTemp) / rampRate);
                initialTemp = targetTemp;
            }
        });
        $('#totalTime').text(totalTime.toFixed(2));
    }

    $('#scheduleType').on('change', function () {
        const scheduleType = $(this).val();
        updateFormValues(scheduleType);
    });

    $('#addSegment').off('click').on('click', function () {
        addSegment();
        calculateTotalTime();
        visualizeSchedule();
    });

    $('#segments').on('click', '.removeSegment', removeSegment);

    $('#startTime, #initialTemp').on('input', function () {
        calculateTotalTime();
        visualizeSchedule();
    });

    $('#segments').on('input', '.rampRate, .targetTemp', function () {
        calculateTotalTime();
        visualizeSchedule();
    });

    function visualizeSchedule() {
        console.log("Visualizing schedule");
        const startTime = $('#startTime').val();
        const initialTemp = parseFloat($('#initialTemp').val());
        const data = [];
        let currentTime = new Date(`1970-01-01T${startTime}:00`);
        let currentTemp = initialTemp;

        data.push({ time: new Date(currentTime), temp: currentTemp, isTarget: false });

        $('#segments .segment').each(function () {
            const rampRate = parseFloat($(this).find('.rampRate').val());
            const targetTemp = parseFloat($(this).find('.targetTemp').val());
            if (rampRate > 0 && !isNaN(targetTemp) && !isNaN(rampRate)) {
                const duration = Math.abs((targetTemp - currentTemp) / rampRate);
                const step = (targetTemp > currentTemp ? 1 : -1) * rampRate / 60;
                let totalMinutes = Math.ceil(duration * 60);
                for (let i = 0; i < totalMinutes; i++) {
                    currentTime.setMinutes(currentTime.getMinutes() + 1);
                    currentTemp += step;
                    if (i % 60 === 0) {
                        data.push({ time: new Date(currentTime), temp: currentTemp, isTarget: false });
                    }
                }
                data.push({ time: new Date(currentTime), temp: currentTemp, isTarget: true });
                currentTemp = targetTemp;
            }
        });

        console.log("Data:", data);

        const times = data.map(d => d.time);
        const temps = data.map(d => d.temp);
        const targetIndices = data.map((d, i) => d.isTarget ? i : null).filter(i => i !== null);

        const trace = {
            x: times,
            y: temps,
            mode: 'lines+markers',
            marker: {
                color: data.map(d => d.isTarget ? 'green' : 'red'),
                size: 6
            },
            line: {
                shape: 'linear'
            }
        };

        const layout = {
            xaxis: {
                title: 'Time',
                type: 'date',
                tickformat: '%H:%M',
            },
            yaxis: {
                title: 'Temperature (°F)'
            },
            showlegend: false
        };

        Plotly.newPlot('chart', [trace], layout);
    }

    // Initial form values set to 'bisque' and initialize the chart
    updateFormValues('bisque');
});
