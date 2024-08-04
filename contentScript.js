(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, time, videoId } = message;
    console.info(message);

    switch (type) {
      case "NEW":
        currentVideo = videoId;
        newVideoLoaded();
        break;
      case "PLAY":
        youtubePlayer.currentTime = time;
        break;
      case "DELETE":
        currentVideoBookmarks = currentVideoBookmarks.filter(
          (b) => b.time != Number(time)
        );
        chrome.storage.sync.set({
          [currentVideo]: JSON.stringify(currentVideoBookmarks),
        });
        sendResponse(currentVideoBookmarks);
        break;
      default:
        break;
    }
  });

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const newVideoLoaded = async () => {
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];
    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      youtubeLeftControls.appendChild(bookmarkBtn);

      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: `Bookmark at ${getTime(currentTime)}`,
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  newVideoLoaded();
})();

const getTime = (t) => {
  let date = new Date(0);
  date.setSeconds(t);
  console.info(date);
  console.info(date.toISOString());
  return date.toISOString().substring(11, 19);
};
