import './modules/product/product-counter'
import './modules/product/notify-form'

window.setupSticky = function () {
  var n = $("#product-images").offset().top;
  $(".image-container").css("height", $(".product-form-container").height() + 20), $(window).scroll(function () {
    var t = $("#product-images"), e = $(window).scrollTop();
    n <= e ? t.addClass("fixed") : t.removeClass("fixed")
  })
}