const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

// display the path on the UI
document.getElementById("output-path").innerText = path.join(
  os.homedir(),
  "imageshrink"
);

const form = document.getElementById("image-form");
const slider = document.getElementById("slider");
const imageInput = document.getElementById("img-input");

// on submit event
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const imgPath = imageInput.files[0].path;
  const quality = slider.value;

  ipcRenderer.send("image:minimize", { imgPath, quality });
});

// on completion
ipcRenderer.on("image:done", () => {
  M.toast({
    html: `Image resized to ${slider.value}% quality`,
  });
});

ipcRenderer.on("invalidinput", () => {
  M.toast({
    html: `Invalid Filetype Provided: Must be png or jpeg/jpg`,
  });
  document.getElementById("file-upload-input").value = "";
});
