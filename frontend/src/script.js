document.addEventListener("DOMContentLoaded", function () {
  const bookButton = document.querySelector(".book-button");

  bookButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default anchor behavior

    const targetId = this.getAttribute("href"); // Get the target section ID
    const targetSection = document.querySelector(targetId); // Select the target section

    // Scroll to the target section smoothly
    targetSection.scrollIntoView({
      behavior: "smooth",
    });
  });
});
