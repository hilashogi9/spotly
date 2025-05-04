// פונקציה לשנות את שקיפות התמונה בזמן הגלילה
window.onscroll = function () {
  var introImage = document.getElementById("introImage");
  var scrollPosition = window.scrollY; // כמה גללת למטה
  var opacity = 1 - (scrollPosition / (window.innerHeight / 2.5)); // שינוי מהירות שקיפות

  // אם השקיפות קטנה מ-0, נכניס את התמונה למצב בלתי נראה
  introImage.style.opacity = opacity;
};


const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');

      if (entry.target.classList.contains('form-title')) {
        entry.target.style.animation = 'none';
        entry.target.offsetHeight; // Trigger reflow
        entry.target.style.animation = null;
      }

      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.5
});

const elementsToAnimate = 
document.querySelectorAll('.title, .carousel-inner, .carousel-control-prev, .carousel-control-next-icon, .form-title');

elementsToAnimate.forEach(element => {
  observer.observe(element);
});










