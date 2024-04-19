function submitCity() {
    // Get the value of the input field
    const city = document.getElementById("cityInput").value;

    // Call a function to get the country based on the city
    const country = getCountryFromCity(city);

    // Check the value of the country variable
    console.log("Country:", country);

    // If country is not found, prompt the user to enter a valid city
    if (!country) {
        alert("Please enter a valid city.");
        return;
    }

    // Call a function to fetch data from the API for the entered city
    fetchDataFromApi(city, country);
}

function getCountryFromCity(city) {
    var headers = new Headers();
    headers.append("X-CSCAPI-KEY", "API_KEY");

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return fetch(`https://api.countrystatecity.in/v1/countries/${city}`, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(data => {
            if (data && data.length > 0) {
                return data[0].country;
            } else {
                throw new Error("Country not found for the provided city");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function fetchDataFromApi(city, country) {
    const baseUrl = "http://api.aladhan.com/v1/timingsByCity";
    const url = `${baseUrl}?city=${city}&country=${country}&method=2`; // Use method 2 for calculation

    // Fetch data from the API
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(data => {
            if (data.status === "OK") {
                const currentTime = new Date();
                const prayerTimes = data.data.timings;

                // Get the next prayer time
                const nextPrayer = getNextPrayer(prayerTimes, currentTime);

                // Calculate countdown till the next prayer
                const countdown = calculateCountdown(currentTime, nextPrayer);

                // Display the data on the HTML page
                displayDataOnPage(data.data.date.readable, prayerTimes, countdown);
            } else {
                throw new Error("Invalid response format or missing data");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getNextPrayer(prayerTimes, currentTime) {
    const currentFormattedTime = currentTime.getHours() * 60 + currentTime.getMinutes();
    let nextPrayerTime = null;

    // Iterate through prayer times to find the next prayer
    for (const prayer in prayerTimes) {
        const prayerTime = prayerTimes[prayer].split(':');
        const prayerFormattedTime = parseInt(prayerTime[0]) * 60 + parseInt(prayerTime[1]);

        if (prayerFormattedTime > currentFormattedTime) {
            nextPrayerTime = new Date();
            nextPrayerTime.setHours(prayerTime[0]);
            nextPrayerTime.setMinutes(prayerTime[1]);
            break;
        }
    }

    return nextPrayerTime;
}

function displayDataOnPage(currentDate, prayerTimes) {
    // Create elements to display the data
    const container = document.getElementById("dataContainer");
    container.innerHTML = ""; // Clear previous data

    // Create and append elements for current date
    const currentDateElement = document.createElement("p");
    currentDateElement.textContent = "Current Date: " + currentDate;
    container.appendChild(currentDateElement);

    // Create and append elements for prayer times
    const prayerTimesElement = document.createElement("div");
    prayerTimesElement.id = "prayerTimesContainer";
    prayerTimesElement.innerHTML = "<h3>Prayer Times:</h3>";
    const prayerTimesList = document.createElement("ul");
    let nextPrayerTime = null; // Initialize next prayer time
    for (const prayer in prayerTimes) {
        // Display only the five compulsory prayers
        if (prayer === "Fajr" || prayer === "Dhuhr" || prayer === "Asr" || prayer === "Maghrib" || prayer === "Isha") {
            const prayerTimeItem = document.createElement("li");
            prayerTimeItem.textContent = `${prayer}: ${prayerTimes[prayer]}`;
            prayerTimesList.appendChild(prayerTimeItem);
            // Check if the current prayer is the next one
            const prayerTime = new Date(currentDate + ' ' + prayerTimes[prayer]);
            if (prayerTime > new Date() && !nextPrayerTime) {
                nextPrayerTime = prayerTime;
            }
        }
    }
    prayerTimesElement.appendChild(prayerTimesList);
    container.appendChild(prayerTimesElement);

    // Calculate countdown till the next prayer
    const countdown = calculateCountdown(new Date(), nextPrayerTime);

    // Create and append element for countdown
    const countdownContainer = document.getElementById("countdownContainer");
    countdownContainer.innerHTML = ""; // Clear previous countdown
    const countdownElement = document.createElement("div");
    countdownElement.innerHTML = `<h3>Countdown till next prayer:</h3><p>${countdown} minutes</p>`;
    countdownContainer.appendChild(countdownElement);
}

function calculateCountdown(currentTime, nextPrayerTime) {
    if (!nextPrayerTime) {
        return "No upcoming prayers today";
    }
    const diff = nextPrayerTime - currentTime;
    const minutes = Math.floor((diff / 1000) / 60);
    return minutes;
}
