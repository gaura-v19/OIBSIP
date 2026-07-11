/* ===========================
   Fade In Animation
=========================== */

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.15
});



document.querySelectorAll(
    ".container, .featured-card, .card, .skills-grid, footer"
).forEach((element) => {

    element.classList.add("fade");

    observer.observe(element);

});



/* ===========================
   Active Button Animation
=========================== */

document.querySelectorAll("a").forEach((button) => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "translateY(-2px)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "translateY(0px)";

    });

});



/* ===========================
   Image Hover Cursor
=========================== */

document.querySelectorAll("img").forEach((img) => {

    img.draggable = false;

});



/* ===========================
   Current Year (optional)
=========================== */

const year = new Date().getFullYear();

const footer = document.querySelector("footer");

footer.insertAdjacentHTML(
    "beforeend",
    `<p>© ${year} Gaurav Tripathi</p>`
);