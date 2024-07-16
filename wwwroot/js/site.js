$(document).ready(function () {
    // Initial values for bisque and glaze schedules
    const schedules = {
        bisque: {
            startTime: "07:00",
            initialTemp: 200,
            finalTemp: 1830,
            rampRate: 150
        },
        glaze: {
            startTime: "07:00",
            initialTemp: 200,
            finalTemp: 2232,
            rampRate: 100
        }
    };

    // Function to update form values based on schedule type
    function updateFormValues(scheduleType) {
        const schedule = schedules[scheduleType];
        $('#startTime').val(schedule.startTime);
        $('#initialTemp').val(schedule.initialTemp);
        $('#finalTemp').val(schedule.finalTemp);
        $('#rampRate').val(schedule.rampRate);
    }

    // Initial form values set to bisque schedule
    updateFormValues('bisque');

    // Update form values when schedule type changes
    $('#scheduleType').change(function () {
        const scheduleType = $(this).val();
        updateFormValues(scheduleType);
        visualizeSchedule();
    });

    // Event listener for form submission
    $('#scheduleForm').on('submit', function (event) {
        event.preventDefault();
        visualizeSchedule();
    });

    // Function to visualize the firing schedule
    function visualizeSchedule() {
        const startTime = $('#startTime').val();
        const initialTemp = parseFloat($('#initialTemp').val());
        const finalTemp = parseFloat($('#finalTemp').val());
        const rampRate = parseFloat($('#rampRate').val());

        const times = [];
        const temps = [];

        let currentTime = new Date(`1970-01-01T${startTime}:00`);
        let currentTemp = initialTemp;
        const totalTime = (finalTemp - initialTemp) / rampRate;

        for (let i = 0; i <= totalTime; i++) {
            times.push(currentTime.toTimeString().slice(0, 5));
            temps.push(currentTemp);

            currentTime.setHours(currentTime.getHours() + 1);
            currentTemp += rampRate;
        }
        //dfgsd
        const ctx = $('#tempChart');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: times,
                datasets: [{
                    label: 'Temperature (°F)',
                    data: temps,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°F)'
                        }
                    }
                }
            }
        });
    }

    // Initial visualization on page load
    visualizeSchedule();
});
