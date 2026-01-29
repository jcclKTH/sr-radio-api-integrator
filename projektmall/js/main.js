// DOM Elements
const searchButtonEl = document.getElementById('searchbutton');
const searchProgramEl = document.getElementById('searchProgram');
const mainnavlistEl = document.getElementById('mainnavlist');
const infoEl = document.getElementById('info');

// Create the audio object once
let audio = new Audio();

// Base URL for the SR API
const baseUrl = 'https://api.sr.se/api/v2/channels?format=json&size=100';

// Function to get the current date in YYYY-MM-DD format
const getDate = () => new Date().toISOString().slice(0,10);

// Asynchronous function to get the channels
const getChannels = async () => {
  const data = await (await fetch(baseUrl)).json();
  data.channels.forEach(channel => {
    // Add option to the select
    searchProgramEl.add(new Option(channel.name, channel.id));

    // Create li element with channel image and name
    const li = document.createElement('li');
    li.innerHTML = `<img src="${channel.image}" alt="${channel.name} logo" style="width:25px;height:25px;">${channel.name}`;

    // Click event to play audio and show channel information
    li.addEventListener('click', async () => {
      audio.pause();
      audio.src = `https://sverigesradio.se/topsy/direkt/srapi/${channel.id}.mp3`;
      audio.play();
      searchProgramEl.value = channel.id;

      // Show the channel description and song details
      infoEl.innerHTML = `
        <h2 style="font-weight:bold;">${channel.name}</h2>
        <p>${channel.tagline}</p>
        <hr>
      `;

      // Fetch the current song and the previous song
      let currentMusicURL = `https://api.sr.se/api/v2/playlists/rightnow?channelid=${channel.id}&format=json`;
      fetch(currentMusicURL, { method: 'GET' })
        .then(response => response.json())
        .then(jsonData => {
          
          try {
            const songElement = document.createElement('p');
            songElement.textContent = "Next song: " + jsonData.playlist.song.description;
            info.appendChild(songElement);

            const previoussongElement = document.createElement('p');
          previoussongElement.textContent = "Prev song: " + jsonData.playlist.previoussong.description;
          info.appendChild(previoussongElement);
          } catch (error) {
            console.error("Error: ", error);
          }
        });
    });
    mainnavlistEl.appendChild(li);
  });
}

// Function to get programs
const getPrograms = async () => {
  const url = `https://api.sr.se/v2/scheduledepisodes?channelid=${searchProgramEl.value}&date=${getDate()}&format=json&size=100`;
  const data = await (await fetch(url)).json();

  // Show program information
  infoEl.innerHTML = data.schedule.map((program, index) => {
    // Extract the start time from starttimeutc
    const startTime = new Date(parseInt(program.starttimeutc.slice(6, -2)));

    return `
      <div>
        <h2 style="font-weight:bold;">${program.title}</h2>
        <p>${program.description}</p>
        <p>${startTime.toString()}</p>
      </div>
      ${index < data.schedule.length - 1 ? '<hr>' : ''}
    `;
  }).join('');
}

// Click event to get programs
searchButtonEl.addEventListener('click', getPrograms);

// Initialization
getChannels();
getPrograms();


