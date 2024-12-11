import fs from "fs/promises";

const lines = (await fs.readFile("./limericks.txt", "utf-8"))
  .trim()
  .split("\n")
  .map((entry) => entry.substring(0, entry.length - 1));

const results = lines.reverse().map((entry) => {
  const [episode] = entry.split(" ");
  const [, nameAndText] = entry.split("#consortlimericks ");
  const [name, text] = nameAndText.split("\\\\");
  const lines = text.split("\\");

  if (lines.length !== 5) {
    console.error(name, lines);
  }
  return {
    id: name
      .replaceAll(" ", "-")
      .replaceAll("æ", "ae")
      .replaceAll("Æ", "ae")
      .toLowerCase(),
    name: name,
    episode: episode,
    text: lines,
  };
});

console.log(`
export default ${JSON.stringify(results)}
  `);
