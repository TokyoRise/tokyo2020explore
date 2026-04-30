(function () {
  var targets = document.querySelectorAll(
    '.page-header, .page-hero-img, .page-text p, .page-gallery img'
  );

  targets.forEach(function (el) {
    el.classList.add('tour-animate');
  });

  // Stagger gallery images
  var galleryImgs = document.querySelectorAll('.page-gallery img');
  galleryImgs.forEach(function (el, i) {
    el.style.transitionDelay = (i * 55) + 'ms';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
