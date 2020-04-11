// loading animation
document.addEventListener("DOMContentLoaded", function (event) {
  $(".body").fadeOut('slow');
});

  // navbar 
  $(function () {
    $(document).scroll(function () {
      const $nav = $("nav");
      $nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
    });
  });

  // landing page form animation
  var FormStuff = {

    init: function () {
      this.applyConditionalRequired();
      this.bindUIActions();
    },

    bindUIActions: function () {
      $("input[type='radio'], input[type='checkbox']").on("change", this.applyConditionalRequired);
    },

    applyConditionalRequired: function () {

      $(".require-if-active").each(function () {
        var el = $(this);
        if ($(el.data("require-pair")).is(":checked")) {
          el.prop("required", true);
        } else {
          el.prop("required", false);
        }
      });

    }

  };

  FormStuff.init();

  // lazy load
  document.addEventListener("DOMContentLoaded", function() {
  var lazyBackgrounds = [].slice.call(document.querySelectorAll(".lazy-background"));

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    let lazyBackgroundObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          lazyBackgroundObserver.unobserve(entry.target);
        }
      });
    });

    lazyBackgrounds.forEach(function(lazyBackground) {
      lazyBackgroundObserver.observe(lazyBackground);
    });
  }
});