const swatches = document.querySelector("#swatches");
const addButton = document.querySelector("#add");
const removeButton = document.querySelector("#remove");
const countLabel = document.querySelector("#count");

/* Each name now has a permanent color */
const colors = [
  { name: "SCARLET",   color: "#ed4b50" },
  { name: "VERMILION", color: "#e7875a" },
  { name: "APRICOT",   color: "#e7cd5a" },
  { name: "CITRON",    color: "#bae75a" },
  { name: "ACID",      color: "#64e75a" },
  { name: "MINT",      color: "#5ae7a5" },
  { name: "LAGOON",    color: "#5ad3e7" },
  { name: "IRIS",      color: "#ae5ae7" },
  { name: "ORCHID",    color: "#d76cda" },
  { name: "ROSE",      color: "#e77ca5" },
  { name: "DUSK",      color: "#a18bbd" },
  { name: "PLUM",      color: "#ad6b9f" }
];

let colorCount = 8;

const foldObserver = new ResizeObserver((entries) => {
  for (const { target } of entries) {
    const direction = Number(target.dataset.num) % 2 ? 1 : -1;

    const angle =
      direction *
      Math.atan2(
        target.offsetHeight * 0.05,
        Math.max(1, target.offsetWidth)
      ) *
      (180 / Math.PI);

    target.style.setProperty("--fold-angle", `${angle}deg`);
  }
});

function createSwatch({ name, color }) {
  const swatch = document.createElement("button");
  const label = document.createElement("span");

  swatch.type = "button";
  swatch.className = "swatch";
  swatch.style.setProperty("--color", color);
  swatch.setAttribute("aria-label", `Expand ${name}`);
  swatch.setAttribute("aria-pressed", "false");

  label.textContent = name;
  swatch.append(label);

  swatch.addEventListener("click", () => {
    const wasSelected = swatch.classList.contains("chosen");

    swatches.querySelectorAll(".swatch").forEach((item) => {
      item.classList.remove("chosen");
      item.setAttribute("aria-pressed", "false");
    });

    if (!wasSelected) {
      swatch.classList.add("chosen");
      swatch.setAttribute("aria-pressed", "true");
    }
  });

  return swatch;
}

function updateSwatches() {
  /* Remove only the last swatches */
  while (swatches.children.length > colorCount) {
    const lastSwatch = swatches.lastElementChild;
    foldObserver.unobserve(lastSwatch);
    lastSwatch.remove();
  }

  /* Add new swatches without rebuilding existing ones */
  while (swatches.children.length < colorCount) {
    const index = swatches.children.length;
    const swatch = createSwatch(colors[index]);

    swatches.append(swatch);
    foldObserver.observe(swatch);
  }

  Array.from(swatches.children).forEach((swatch, index) => {
    swatch.dataset.num = String(index + 1).padStart(2, "0");
    swatch.style.setProperty("--fallback-i", index + 1);
    swatch.style.setProperty("--fallback-n", colorCount);
  });

  countLabel.textContent = `${colorCount} colors`;
  addButton.disabled = colorCount >= colors.length;
  removeButton.disabled = colorCount <= 3;
}

addButton.addEventListener("click", () => {
  if (colorCount < colors.length) {
    colorCount++;
    updateSwatches();
  }
});

removeButton.addEventListener("click", () => {
  if (colorCount > 3) {
    colorCount--;
    updateSwatches();
  }
});

updateSwatches();