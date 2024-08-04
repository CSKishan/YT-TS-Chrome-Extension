import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");
  const controlsElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";

  controlsElement.className = "bookmark-controls";

  newBookmarkElement.id = `bookmark-${bookmark.time}`;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.append(bookmarkTitleElement, controlsElement);
  bookmarksElement.append(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    currentBookmarks.forEach((bookmark) => {
      addNewBookmark(bookmarksElement, bookmark);
    });
  } else {
    bookmarksElement.innerHTML = `<i class="row">No bookmarks to show</i>`;
  }
};

const onPlay = async (e) => {
  const bookmarkControlElement = e.target.parentNode.parentNode;
  const bookmarkTime = bookmarkControlElement.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    time: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkControlElement = e.target.parentNode.parentNode;
  const bookmarkTime = bookmarkControlElement.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    `bookmark-${bookmarkTime}`
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      time: bookmarkTime,
    },
    viewBookmarks
  );
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = `assets/${src}.png`;
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);

  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
  console.info("Document loaded");
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      console.info("In here");
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    let container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a YouTube page</div>';
  }
});
