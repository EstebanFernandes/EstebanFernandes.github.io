let channels = [];
let visibleChannels = new Set();
const maxVisibleStreams = 16; // Max number of visible streams (can adjust this value)

const input = document.getElementById("addChannelInput");
const list = document.getElementById("channel-list");
const channelWrapper = document.getElementById("channel-wrapper");
const channelTemplate = document.getElementById("channel-template");
const listItemTemplate = document.getElementById("list-item-template");


const colInput = document.getElementById('col-input');

// Set default value for columns
colInput.value = 2; // Default to 2 columns
colInput.addEventListener('input', setGridColumns);


function setGridColumns() {
  const columns = parseInt(colInput.value, 10) || 1; // Ensure at least 1 column
  channelWrapper.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

// Limit the number of streams displayed based on the selected channels
function updateVisibility() {
  let visibleStreams = Array.from(visibleChannels).slice(0, maxVisibleStreams); // Limit the number of streams
  const allCards = document.querySelectorAll('.channel-card');

  const visibleCount = visibleStreams.length; // Calculate the number of visible cards
  if (visibleCount > Math.pow(colInput.value, 2)) {
    colInput.value++;
  }
  else if (visibleCount <= Math.pow(colInput.value - 1, 2)) {
    colInput.value--;
  }
  setGridColumns(); // Update the grid columns based on the new value



  allCards.forEach((card) => {
    const channelName = card.querySelector('.channel-name').textContent;
    if (visibleStreams.includes(channelName)) {
      card.style.display = "block"; // Show the card
      const index = visibleStreams.indexOf(channelName);
      /* if (index === 0) {
         // The first channel, let's make it bigger (can modify the logic)
         card.classList.add('large-stream');
       } else {
         card.classList.remove('large-stream');
       }*/
    } else {
      card.style.display = "none"; // Hide the card
    }
  });
}

// Function to render channels
function renderChannels() {
  list.innerHTML = "";

  const parentDomain = window.location.hostname;
  channels.forEach((channel) => {
    const listItem = listItemTemplate.content.cloneNode(true);
    const li = listItem.querySelector("li");

    // Set the channel name
    li.querySelector(".channel-name").textContent = channel;

    // Checkbox (toggle visibility)
    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.checked = visibleChannels.has(channel);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        visibleChannels.add(channel);
      } else {
        visibleChannels.delete(channel);
      }
      updateVisibility();
    });

    // Remove button
    const removeButton = li.querySelector(".remove-button");
    removeButton.addEventListener("click", () => {
      removeChannel(channel);
    });

    list.appendChild(li);

    // Create the iframe card only once
    if (!document.getElementById(`card-${channel}`)) {
      const card = channelTemplate.content.cloneNode(true);
      const cardElem = card.querySelector(".channel-card");
      cardElem.id = `card-${channel}`;
      cardElem.querySelector(".channel-info").querySelector(".channel-name").textContent = channel;
      cardElem.querySelector(".channel-iframe").src =
        `https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&autoplay=true&muted=true`;

      channelWrapper.appendChild(cardElem);
    }
  });

  updateVisibility();
}


function removeChannel(channel) {
  channels = channels.filter(c => c !== channel);
  visibleChannels.delete(channel);
  const card = document.getElementById(`card-${channel}`);
  if (card) card.remove();
  renderChannels();
}

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const newChannel = input.value.trim();
    if (newChannel && !channels.includes(newChannel)) {
      channels.push(newChannel);
      visibleChannels.add(newChannel); // default to shown
      renderChannels();
      input.value = "";
    }
  }
});


let currentlyExpandedCard = null;

// Event delegation for expand icons
channelWrapper.addEventListener('click', (e) => {
  const isExpandIcon = e.target.tagName === 'IMG' && e.target.closest('.channel-info');

  if (isExpandIcon) {
    const card = e.target.closest('.channel-card');

    if (currentlyExpandedCard && currentlyExpandedCard === card) {
      // Collapse the card
      collapseStream(card);
    } else {
      if (currentlyExpandedCard) collapseStream(currentlyExpandedCard); // Collapse previously expanded
      expandStream(card);
    }
  }
});

function expandStream(card) {
  currentlyExpandedCard = card;
  document.body.classList.add('expanded-mode');
  card.classList.add('expanded-overlay');

  // Optional: bring card to top
  card.style.zIndex = '1001';
}

function collapseStream(card) {
  currentlyExpandedCard = null;
  document.body.classList.remove('expanded-mode');
  card.classList.remove('expanded-overlay');
  card.style.zIndex = '';
}

// Optional: Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentlyExpandedCard) {
    collapseStream(currentlyExpandedCard);
  }
});





//SAVE STATE
function saveState() {
  localStorage.setItem('channels', JSON.stringify(channels));
  localStorage.setItem('visibleChannels', JSON.stringify(Array.from(visibleChannels)));
}

function loadState() {
  const savedChannels = JSON.parse(localStorage.getItem('channels'));
  const savedVisibleChannels = JSON.parse(localStorage.getItem('visibleChannels'));
  if (savedChannels) channels = savedChannels;
  if (savedVisibleChannels) visibleChannels = new Set(savedVisibleChannels);
  renderChannels();
}



window.addEventListener('load', loadState);
window.addEventListener('beforeunload', saveState); // Save state before the page is closed or refreshed
window.addEventListener('storage', loadState); // Load state when the page is opened in another tab


/*  // Fullscreen API support */

/* DOESN'T WORK YET
document.addEventListener("fullscreenchange", handler);
document.addEventListener("webkitfullscreenchange", handler); // Safari
document.addEventListener("mozfullscreenchange", handler);    // Firefox
document.addEventListener("MSFullscreenChange", handler);     // IE/Edge (old)
function handler() {
  const fsElement = document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (fsElement) {
    console.log("Entered fullscreen");
  } else {
    console.log("Exited fullscreen");
  }
}*/

