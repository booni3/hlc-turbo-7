
/***********
We are going to overwite the selectCallback function to add:
-

*********/
window.selectCallback = function (variant, selector) {
  const evt = document.createEvent('HTMLEvents');
  const $product = $(`.product-${selector.product.id}`);
  const $notifyForm = $(`.notify-form-${selector.product.id}`);
  const $productForm = $('.product_form, .shopify-product-form', $product);
  const variantInventory = $productForm.data('variant-inventory');

  const $notifyFormInputs = $('.notify_form__inputs', $product);
  const notifyEmail = window.Shopify.translation.notify_email;
  const notifyEmailValue = '{{ contact.fields.email }}';
  const notifySend = window.Shopify.translation.notify_email_send;
  const notifyUrl = $notifyFormInputs.data('url');

  // Manually trigger change event so
  // pure JS listeners can receive it
  evt.initEvent('change', false, true);
  selector.variantIdField.dispatchEvent(evt);

  if (variant) {
    if (variant.title != null) {
      // Escape variant titles
      window.variantTitle = variant.title.replace(/"/g, '&quot;');
      window.notifyMessage = window.Shopify.translation.notify_message_first + window.variantTitle + window.Shopify.translation.notify_message_last + notifyUrl;
    }
  } else {
    window.notifyMessage = window.Shopify.translation.notify_message_first + window.Shopify.translation.notify_message_last + notifyUrl;
  }

  if ($notifyFormInputs.hasClass('customer--true')) {
    const notifyCustomerEmail = '{{ customer.email }}';
    window.notifyEmailInput = `<input type="hidden" class="notify_email" name="contact[email]" id="contact[email]" value="${notifyCustomerEmail}" />`;
  } else {
    window.notifyEmailInput = `<input required type="email" class="notify_email" name="contact[email]" id="contact[email]" placeholder="${notifyEmail}" value="${notifyEmailValue}" />`;
  }
  window.notifyFormHTML = `${window.notifyEmailInput}<input type="hidden" name="challenge" value="false" /><input type="hidden" name="contact[body]" class="notify_form_message" data-body="${window.notifyMessage}" value="${window.notifyMessage}" /><input class="global-button global-button--primary" type="submit" value="${notifySend}" style="margin-bottom:0px" />`;

  // Image Variant feature
  if (variant && variant.featured_image && $product.is(':visible')) {
    const $sliders = $('.js-product-gallery', $product);
    $sliders.each((_, slider) => {
      const $slider = $(slider);
      const $sliderInstance = window.Flickity.data($slider[0]);
      if ($slider && $sliderInstance !== undefined) {
        const index = $(`[data-image-id="${variant.featured_media.id}"]`).data('index');
        $sliderInstance.select(index, false, true);
      }
    });
  }

  // Toggles images in product slider when inline quickshop and layout set to slider
  if (variant && variant.featured_image && $product.is(':visible')) {
    if (window.Shopify.theme_settings.product_form_style === 'select' && window.Shopify.theme_settings.quick_shop_style === 'inline') {
      const $selectedVariants = $('.products-slider').find('select option:not(.selector-wrapper select option)').filter(':selected');
      $selectedVariants.each(function toggleImage() {
        if ($(this).data('featured-image')) {
          const swatchImage = $(this).data('image');
          const $quickShopElement = $(this).parents('.thumbnail').find('.image__container img');

          $quickShopElement.attr('src', swatchImage);
          $quickShopElement.attr('srcset', swatchImage);
        }
      });
    }
  }

  if (variant) {
    if (variantInventory) {
      variantInventory.forEach(v => {
        if (v.id === variant.id) {
          const currentVariant = variant;
          currentVariant.inventory_quantity = v.inventory_quantity;
          currentVariant.inventory_management = v.inventory_management;
          currentVariant.inventory_policy = v.inventory_policy;
        }
      });
    }

    $('.sku span', $product).text(variant.sku);

    if (window.Shopify.theme_settings.product_form_style === 'radio') {
      const { length } = variant.options;
      for (let i = 0; i < length; i++) {
        const radioButton = $productForm.find(`.swatch[data-option-index="${escape(i)}"] :radio[value="${variant.options[i].replace(/"/g, '\\"')}"]`);
        if (radioButton.length) {
          radioButton.get(0).checked = true;
        }
      }
    } else {
      $('.notify_form_message', $product).attr('value', `${$('.notify_form_message', $product).data('body')} - ${window.variantTitle}`);
    }
  }

  // HLC - reset stock helper field
  $("#quantity").val(1);
  $('.items_left', $product).text('');

  // HLC dispatch event
  document.dispatchEvent(new CustomEvent('hlc-variant-selected', {
    bubbles: true,
    cancelable: true,
    detail: { variant: variant }
  }));

  // HLC - add qty to form and , for cart oversell
  if(variant){
    $("#hlciq").val(variant.inventory_quantity);
    $("#hlcvid").val(variant.id);
  } else {
    $("#hlciq").val('');
    $("#hlcvid").val('');
  }

  // HLC - get preorder date if exists
  //var preOrderAtEpoch = variant ? preOrderEpochForVariant(variant.id) : null;
  var preOrderAtEpoch = null;

  if (
      variant &&
      variant.available &&
      (
          // HLC - allow backorders
          variant.inventory_quantity === undefined || // not tracked
          (variant.inventory_quantity > 0) ||// tracked and available
          (variant.inventory_quantity === 0 && window.customerCanBackorder) || // tracked and available for back order
          (variant.inventory_quantity === 0 && preOrderAtEpoch) // product is available for preorder
      )
  ) {
    console.log('HLC: SelectCallback: Can Purchase');
    //////////////////////////////////////////
    //       Product can be purchased       //
    // normal sale, pre-order or back-order //
    //////////////////////////////////////////
    if (variant.inventory_management && variant.inventory_quantity > 0) {
      if (window.Shopify.theme_settings.display_inventory_left) {
        if (variant.inventory_quantity === 1) {
          window.itemsLeftText = window.Shopify.translation.one_item_left;
        } else {
          window.itemsLeftText = window.Shopify.translation.items_left_text;
        }

        // HLC - custom threshold
        var inventoryThreshold = 0;
        var displayInventoryHtml = '';
        if(window.customerCanBackorder){
          inventoryThreshold = 1000;
          displayInventoryHtml = (variant.inventory_quantity > 50 ? '50+' : variant.inventory_quantity)
              + ' items in stock for dispatch ' + (moment().isAfter(moment().hour(14)) ? 'tomorrow' : 'today')
              + "<br>"
              + "Any back-order units will dispatch separately"
        } else {
          inventoryThreshold = parseInt(Shopify.theme_settings.inventory_threshold);
          displayInventoryHtml = variant.inventory_quantity + " " + items_left_text;
        }

        //const inventoryThreshold = parseInt(window.Shopify.theme_settings.inventory_threshold, 10);
        // if (variant.inventory_quantity <= inventoryThreshold) {
        //   $('.items_left', $product).html(`${variant.inventory_quantity} ${window.itemsLeftText}`);
        // } else {
        //   $('.items_left', $product).html('');
        // }

        if (variant.inventory_quantity <= inventoryThreshold) {
          $('.items_left', $product).html(displayInventoryHtml);
        } else {
          $('.items_left', $product).html('');
        }
      }
      if (window.Shopify.theme_settings.limit_quantity) {
        if (variant.inventory_policy === 'deny') {
          $('.quantity', $product).attr('max', variant.inventory_quantity);
        }
      }

      // HLC - limit qty box unless customer can back order
      if(! (window.customerCanBackorder && window.customerCanBackorder === true)) {
        $('.quantity', $product).attr('max', variant.inventory_quantity);
      }

      // HLC - set inventory qty into form
      $('#hlciq').text(variant.inventory_quantity);

    } else {
      $('.items_left', $product).text('');
      $('.quantity', $product).removeAttr('max');
    }

    // Price
    $('.sold_out', $product).text('');
    $('.add_to_cart', $product).removeClass('disabled').removeAttr('disabled').find('span')
        .text($('.add_to_cart', $product).data('label'));

    // HLC - Add to cart
    if (variant.inventory_quantity === undefined || variant.inventory_quantity > 0) {
      $('.add_to_cart', $product).removeClass('disabled').removeAttr('disabled').find('span').text(Shopify.translation.add_to_cart);
      $("#preorder_date").val(null);
    } else {
      if(preOrderAtEpoch !== null) {
        var preOrderDate = window.moment.unix(preOrderAtEpoch);
        $('.items_left', $product).html(
            'Estimated delivery on or before '
            + preOrderDate.format("Do MMMM")
        );
        $("#preorder_date").val(preOrderDate.format('YYYY-MM-DD'));
      }
      $('.add_to_cart', $product).removeClass('disabled').removeAttr('disabled').find('span').text(Shopify.translation.pre_order_text);
    }

    // Misc
    $('.shopify-payment-button', $product).removeClass('disabled');
    $('.purchase-details__buttons', $product).removeClass('product-is-unavailable');
    $('.modal_price', $product).removeClass('variant-unavailable');
    $product.find($notifyForm).hide();
    $product.find($notifyFormInputs).empty();

  } else {
    ///////////////////////////////////////////
    //      Product cannot be purchased      //
    // Sold out, no pre-order, no back-order //
    ///////////////////////////////////////////
    console.log('HLC: SelectCallback: Cannot Purchase');
    const message = variant ? window.Shopify.theme_settings.sold_out_text : window.Shopify.translation.unavailable_text;

    if (variant) {
      $('.modal_price', $product).removeClass('variant-unavailable');
    } else {
      // Add class to quickshop so we know variant is unavailable
      $('.modal_price', $product).addClass('variant-unavailable');
    }

    $('.items_left', $product).text('');
    $('.quantity', $product).removeAttr('max');
    $('.sold_out', $product).text(message);
    $('.purchase-details__buttons', $product).addClass('product-is-unavailable');
    $('.add_to_cart', $product).addClass('disabled').attr('disabled', 'disabled').find('span')
        .text(message);
    $('.shopify-payment-button', $product).addClass('disabled');
    $notifyForm.hide();
    $notifyFormInputs.empty();

    // HLC - replace variant.available with inventory qty and backorder check
    if (variant && variant.inventory_quantity === 0 && window.customerCanBackorder === false) {
      $notifyForm.fadeIn();
      $notifyFormInputs.empty();
      $notifyFormInputs.append(notifyFormHTML);
    }
  }

  if (window.Currency.show_multiple_currencies) {
    window.currencyConverter.convertCurrencies();
  }
};

