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

// profile settings validation
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();