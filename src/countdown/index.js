
const countDownDiv = document.getElementById("countDownDiv");
const table = document.getElementById("countDownTable");
const eventForm = document.getElementById("eventForm");
const formButton = document.getElementById("formButton");

let localEvents = [];

formButton.addEventListener("click", toggleForm);

eventForm.addEventListener("submit", formSubmit);

async function fetchJSONData() {
    try {
        const response = await fetch("../countdown/events.json");
        if (!response.ok) {
            throw new Error
                (`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.events;
    } catch (error) {
        console.error("Unable to fetch data:", error);
    }
}

function toggleForm() {
    if (eventForm.style.display === "none") {
        eventForm.style.display = "block";
        formButton.innerHTML = 'Ny nedtelling -';
    } else {
        eventForm.style.display = "none";
        formButton.innerHTML = 'Ny nedtelling +';
    }
} 

function calculateDays(dateFrom, dateTo) {
    
    // Calculating the time difference
    // of two dates
    let difference_In_Time =
        dateTo.getTime() - dateFrom.getTime();
    
    // Calculating the no. of days between
    // two dates
    let difference_In_Days =
        Math.round
            (difference_In_Time / (1000 * 3600 * 24));
  return difference_In_Days;
}

async function populateData() {
    eventForm.style.display = "none";
    let totalEvents = []
    const fileEvents = await fetchJSONData();
    if (localStorage.getItem('events')) {
        localEvents = JSON.parse(localStorage.getItem('events'));
    }
    const today = new Date();

    for (let i = 0; i < localEvents.length; i++) {
        const event = {
            name: localEvents[i].name,
            days: calculateDays(today, new Date(localEvents[i].date))
        }
        totalEvents.push(event);
    }

    for (let i = 0; i < fileEvents.length; i++) {
        const event = {
            name: fileEvents[i].name,
            days: calculateDays(today, new Date(fileEvents[i].date))
        }
        totalEvents.push(event);
    }

    totalEvents.sort((a, b) => a.days - b.days);

    for (let i = 0; i < totalEvents.length; i++) {
        const event = totalEvents[i];
        const eventName = event.name;
        const days = event.days;
        const text = document.createElement('h2');
        text.innerHTML = `${eventName} er om ${days} dager!`;
        countDownDiv.appendChild(text);
    }
}

function formSubmit(event) {
    event.preventDefault();
    const formData = new FormData(eventForm);
    const name = formData.get("eventName");
    const date = formData.get("eventDate");
    const newEvent = {
        name: name,
        date: date
    };
    console.log(newEvent)
    console.log(localEvents);
    localEvents.push(newEvent);
    localStorage.setItem('events', JSON.stringify(localEvents));
    eventForm.reset();
    window.location.reload();
}

populateData();
