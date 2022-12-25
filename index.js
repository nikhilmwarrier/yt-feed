import fetch from "node-fetch";
import xmljs from "xml-js";
import { exec } from "child_process";

const RSS_URL = process.env.YT_XML_FEED_URL;
const APPNAME = "YouTube Feed";

let feed = "";
const response = await fetch(RSS_URL);
const feedText = await response.text();

const feedObj = xmljs.xml2js(feedText, { compact: true, spaces: 4 });

let entriesObj = {};

feedObj.feed.entry.forEach(entry => {
  entriesObj[
    entry["yt:videoId"]._text.trim()
  ] = `[${entry.author.name._text}] ${entry.title._text}`;
});

const entries = Object.values(entriesObj);

function playVideo(id) {
  let cmd = "";
  console.log(id);
  if (/^([a-z0-9]|-|_)+$/i.test(id) && id.length === 11) {
    cmd = `notify-send "Starting YouTube video..." -a "${APPNAME}" && /home/nikhil/Scripts/yt "https://youtube.com/watch?v=${id}"`;
  } else {
    cmd = `notify-send "Invalid URL"`;
  }

  exec(cmd, (err, stdOut, stdErr) => {
    if (err) console.error(`SERVER ERROR: ${err}`);
    if (stdErr) console.error(`STD ERROR: ${stdErr}`);
  });
}

exec(
  `echo -e "${entries.join(
    "\\n"
  )}" | fuzzel --dmenu -p "Select a video to watch: "`,
  (error, stdout, stderr) => {
    if (stdout.trim() !== "") {
      const index = entries.indexOf(stdout.trim());
      if (index !== -1) {
        const vid_id = Object.keys(entriesObj)[index];
        playVideo(vid_id);
      } else exec(`notify-send "Video not found" -a ${APPNAME}`);
    }
  }
);
