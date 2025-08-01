// Función para animar elementos con clase .fade-in cuando entran en viewport
document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll('.fade-in');
  const productCards = document.querySelectorAll('.product-card');

  const options = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver((entries, appearOnScroll) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        appearOnScroll.unobserve(entry.target);
      }
    });
  }, options);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  productCards.forEach(card => {
    appearOnScroll.observe(card);
  });
});
