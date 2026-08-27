const cards = [...document.querySelectorAll(".card")];
const floatingLink = document.querySelector(".floating-link");
const footer = document.querySelector(".site-footer");
const desktop = window.matchMedia("(min-width: 801px)");

// These two numbers control the rhythm of the animation.
const firstCardDepth = 1400;
const spaceBetweenCards = 1100;

function updateCards() {
  if (!desktop.matches) return;

  let nearestCard = cards[0];
  let nearestDistance = Infinity;

  cards.forEach((card, index) => {
    // Scroll down = move this card toward the viewer along the Z axis.
    const z = window.scrollY - firstCardDepth - index * spaceBetweenCards;
    card.style.transform = `translateZ(${z}px)`;

    // Hide a card once it passes the camera or is extremely far away.
    const visible = z < 610 && z > -2600;
    card.style.opacity = visible ? "1" : "0";
    card.style.pointerEvents = Math.abs(z) < 650 ? "auto" : "none";

    if (Math.abs(z) < nearestDistance && visible) {
      nearestDistance = Math.abs(z);
      nearestCard = card;
    }
  });

  floatingLink.textContent = `${nearestCard.querySelector(".card-title").textContent} →`;

  const atEnd = window.scrollY > firstCardDepth + cards.length * spaceBetweenCards;
  footer.classList.toggle("is-visible", atEnd);
  floatingLink.hidden = atEnd || window.scrollY < 500;
}

function setPageHeight() {
  if (desktop.matches) {
    // The fixed stage does not create scroll space, so the body supplies it.
    document.body.style.height = `${firstCardDepth + (cards.length + 1) * spaceBetweenCards}px`;
  } else {
    document.body.style.height = "auto";
  }
  updateCards();
}

window.addEventListener("scroll", updateCards, { passive: true });
window.addEventListener("resize", setPageHeight);
desktop.addEventListener("change", setPageHeight);
setPageHeight();
