var path = require("path");

var fs = require("fs");

module.exports = {
  copyFile: copyFile,
  ensureDirectory: ensureDirectory
}

function copyFile(filepath) {
  var source = path.resolve(__dirname, "..", "lib", "elm", filepath);
  var destination = path.resolve(".", filepath);
  if (fs.existsSync(destination)) {
    console.warn("File already exists, skipping: " + destination);
  } else {
    copySync(source, destination);
    console.log("Created file: " + destination);
  }
};

function ensureDirectory(dirName) {
  var destination = path.resolve(".", dirName);
  if (fs.existsSync(destination)) {
    console.log("Directory already exists: " + destination);
  } else {
    fs.mkdirSync(destination);
    console.log("Created directory: " + destination);
  }
};

function copySync(source, destination) {
  var contents = fs.readFileSync(source);
  fs.writeFileSync(destination, contents);
}
