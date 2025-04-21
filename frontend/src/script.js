document.addEventListener("DOMContentLoaded", function () {
  const bookButton = document.querySelector(".book-button");

  bookButton.addEventListener("click", function (event) {
    event.preventDefault(); 

    const targetId = this.getAttribute("href"); 
    const targetSection = document.querySelector(targetId); 

    targetSection.scrollIntoView({
      behavior: "smooth",
    });
  });
});
