// @ts-check

import limericks from "./limericks.mjs";

/**
 * @typedef {{ name: string, id: string, episode: string, text: string[] }} Limerick
 */

/**
 * @template T
 * @param {string} id the HTML id of the required element
 * @param {{ new (): T }} type the expected class of the element
 * @returns {T}
 */
const getElementById = (id, type) => {
  const element = document.getElementById(id);

  if (element instanceof type) {
    return element;
  }

  throw new Error(`Element with id ${id} not found or not of type ${type}`);
};

const subjectsList = getElementById("subjects", HTMLDataListElement);
const subjectSelector = getElementById("subject", HTMLInputElement);
const subjectTitle = getElementById("subject-title", HTMLElement);
const limerickSection = getElementById("limerick", HTMLElement);
const limerickText = getElementById("limerick-text", HTMLElement);
const backForwardSection = getElementById("back-forward", HTMLElement);
const previousLink = getElementById("previous", HTMLAnchorElement);
const nextLink = getElementById("next", HTMLAnchorElement);
const openGraphTitle = getElementById("og:title", HTMLMetaElement);
const openGraphDescription = getElementById("og:description", HTMLMetaElement);

/**
 * @param {Limerick} limerick
 * @returns {string}
 */
const formatTitle = ({ name, episode }) => `${name} (${episode})`;

for (const limerick of limericks) {
  const subjectListEntry = document.createElement("option");
  subjectListEntry.textContent = formatTitle(limerick);
  subjectsList.appendChild(subjectListEntry);
}

/**
 * @param {Limerick} limerick
 */
const createLink = (limerick) => {
  const searchParams = new URLSearchParams();
  searchParams.set("subject", formatTitle(limerick));
  return `./?${searchParams.toString()}`;
};

/**
 * @param {Limerick} limerick
 */
const updateLimerick = (limerick) => {
  const title = formatTitle(limerick);
  subjectTitle.textContent = title;
  openGraphTitle.content = title;
  openGraphDescription.content = limerick.text.join("\n");

  limerickText.innerHTML = "";
  for (const line of limerick.text) {
    const lineElement = document.createElement("div");
    lineElement.textContent = line;
    limerickText.appendChild(lineElement);
  }

  const currentIndex = limericks.indexOf(limerick);

  if (currentIndex > 0) {
    previousLink.href = createLink(limericks[currentIndex - 1]);
  } else {
    previousLink.parentElement?.replaceChild(
      document.createElement("span"),
      previousLink
    );
  }

  if (currentIndex < limericks.length - 1) {
    nextLink.href = createLink(limericks[currentIndex + 1]);
  } else {
    nextLink.parentElement?.replaceChild(
      document.createElement("span"),
      nextLink
    );
  }

  limerickSection.style.visibility = "visible";
  backForwardSection.style.visibility = "visible";
};

subjectSelector.addEventListener("change", (event) => {
  const selected = subjectSelector.value;

  if (!selected) {
    return;
  }

  const limerick = limericks.find(
    (limerick) => formatTitle(limerick) === selected
  );

  if (!limerick) {
    throw new Error(`Limerick for ${selected} not found!`);
  }

  const searchParams = new URLSearchParams();
  searchParams.set("subject", selected);
  const newHref = `./?${searchParams.toString()}`;

  if (!window.location.href.endsWith(newHref)) {
    window.location.href = newHref;
  } else {
    subjectSelector.blur();
  }
});

subjectSelector.addEventListener("focus", () => {
  subjectSelector.value = "";
});

window.addEventListener("load", () => {
  const searchParams = new URL(window.location.href).searchParams;
  const preselectedSubject = searchParams.get("subject");

  if (preselectedSubject) {
    const limerick = limericks.find(
      (limerick) => formatTitle(limerick) === preselectedSubject
    );

    if (limerick) {
      subjectSelector.value = preselectedSubject;
      updateLimerick(limerick);
    }
  } else {
    const randomIndex = Math.round(Math.random() * (limericks.length - 1));
    const limerick = limericks[randomIndex];
    subjectSelector.value = formatTitle(limerick);
    updateLimerick(limerick);
  }
});
