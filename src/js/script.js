/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  
  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      CartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart:{
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: 'cart__total-number',
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price',
      subtotalPrice: 'cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: 'cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    CartProduct:{
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    }
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart:{
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.CartProduct).innerHTML),
  };
  
  class Product {
    constructor(id, data) {
      const thisProduct = this;
  
      thisProduct.id = id;
      thisProduct.data = data;
  
      thisProduct.renderInMenu();
      thisProduct.getElements();
  
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
  
      //console.log('new Product: ', thisProduct);
    }
  
    renderInMenu() {
      const thisProduct = this;
  
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
  
    getElements() {
      const thisProduct = this;
  
      // Inicjalizacja obiektu thisProduct.dom
      thisProduct.dom = {};
  
      /* Przypisujemy referencje do elementów DOM do obiektu thisProduct.dom */
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
  
    initAccordion() {
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
  
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
  
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
  
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
  
    initOrderForm() {
      const thisProduct = this;
  
      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
  
      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
  
      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
  
    processOrder() {
      const thisProduct = this;
  
      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
  
      // set price to default price
      let price = thisProduct.data.price;
  
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
  
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
  
          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (!option.default) {
              price += option.price;
            }
  
            // add 'active' class to the corresponding image
            const imageClass = `${paramId}-${optionId}`;
            const imageElement = thisProduct.dom.imageWrapper.querySelector(`.${imageClass}`);
            if (imageElement) {
              imageElement.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            if (option.default) {
              price -= option.price;
            }
  
            // remove 'active' class from the corresponding image
            const imageClass = `${paramId}-${optionId}`;
            const imageElement = thisProduct.dom.imageWrapper.querySelector(`.${imageClass}`);
            if (imageElement) {
              imageElement.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      
      // Add priceSingle to thisProduct
      thisProduct.priceSingle = price;

      // Mnożenie ceny przez wartość widgetu
      price *= thisProduct.amountWidget.value;
  
      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }
  
    initAmountWidget() {
      const thisProduct = this;
  
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
  
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      const productSummary = thisProduct.prepareCartProduct();
      app.cart.add(productSummary);
    }

    prepareCartProduct(){
      const thisProduct = this;

        const productSummary = {
          id: thisProduct.id,
          name: thisProduct.data.name,
          amount: thisProduct.amountWidget.value,
          priceSingle: thisProduct.priceSingle,
          price: thisProduct.priceSingle * thisProduct.amountWidget.value,
          params: thisProduct.prepareCartProductParams(),
        };

      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};
    
      // Iterate over all categories (param)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        const paramSummary = {
          label: param.label,
          options: {},
        };
    
        // Iterate over all options in the category
        for (let optionId in param.options) {
          const option = param.options[optionId];
    
          // Check if the option is selected
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            paramSummary.options[optionId] = option.label;
          }
        }
    
        // Add paramSummary to params only if it has selected options
        if (Object.keys(paramSummary.options).length > 0) {
          params[paramId] = paramSummary;
        }
      }
    
      return params;
    }
  }
  
  
  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      //console.log('AmountWidget: ', thisWidget);
      //console.log('Constructor arguments: ', element);

      thisWidget.getElements(element);

      // Sprawdzenie, czy input ma wartość, jeśli nie, ustawiamy wartość domyślną
      const initialValue = thisWidget.input.value || settings.amountWidget.defaultValue;
      thisWidget.setValue(initialValue);

      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
    
      const newValue = parseInt(value);
    
      /* Add validation */
      if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        thisWidget.value = newValue;
      }

      thisWidget.announce();

      thisWidget.input.value = thisWidget.value;

    }

    initActions() {
      const thisWidget = this;
  
      // Listener dla zmiany wartości inputa
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
  
      // Listener dla kliknięcia w "decrease"
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
  
      // Listener dla kliknięcia w "increase"
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles:true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      
      thisCart.getElements(element);
      thisCart.initActions();
      thisCart.update();

      //console.log('new Cart: ', thisCart);
    }

    getElements(element){
      const thisCart = this;
    
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(`.${select.cart.totalNumber}`);
    }

    initActions() {
      const thisCart = this;
    
      // Nasłuchiwacz na kliknięcie toggleTrigger
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        // Przełączanie klasy wrapperActive na koszyku
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    
      // Nasłuchiwacz na event 'updated' w produkcie
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
    
      // Nasłuchiwacz na event 'remove' w produkcie
      thisCart.dom.productList.addEventListener('remove', function (event) {
        // Przekazanie do metody thisCart.remove produktu, który ma zostać usunięty
        thisCart.remove(event.detail.cartProduct);
      });
    }

    remove(cartProduct) {
      const thisCart = this;
    
      // 1. Usuwamy reprezentację produktu z HTML-a
      cartProduct.dom.wrapper.remove();
    
      // 2. Usuwamy produkt z tablicy thisCart.products
      const index = thisCart.products.indexOf(cartProduct);
      if (index !== -1) {
        thisCart.products.splice(index, 1);
      }
    
      // 3. Wywołujemy metodę update w celu przeliczenia sum
      thisCart.update();
    }
    
    add(menuProduct){
      const thisCart = this;
    
      // Wygenerowanie kodu HTML na podstawie szablonu
      const generatedHTML = templates.cartProduct(menuProduct);
    
      // Stworzenie elementu DOM
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    
      // Dodanie elementu DOM do listy produktów w koszyku
      thisCart.dom.productList.appendChild(generatedDOM);
    
      // Dodanie produktu do tablicy thisCart.products
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    
      //console.log('Added to cart:', thisCart.products);

      // Zaktualizowanie sum koszyka
      thisCart.update();
    }

    update() {
      const thisCart = this;
    
      let deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
    
      // Przejście po wszystkich produktach w koszyku
      for (const product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
    
      // Obliczanie całkowitej ceny
      if (totalNumber > 0) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
        //zmiana z getelementbyId bo nie mam pojęcia 
        document.getElementById('delivery').innerHTML = deliveryFee;
      } else {
        thisCart.totalPrice = 0; // Jeśli koszyk jest pusty, cena całkowita to 0
        document.getElementById('delivery').innerHTML = 0;
      }
    
      // Zaktualizowanie danych w HTML
      thisCart.dom.totalNumber.innerHTML = totalNumber;
    
      // Zaktualizowanie subtotala nie działa
      //thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

    
      // Zaktualizowanie kosztu dostawy nie działa
      //  thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    
      // Zaktualizowanie całkowitej ceny (TOTAL U GÓRY A NIE NA DOLE)
      for (const totalPriceElem of thisCart.dom.totalPrice) {
        totalPriceElem.innerHTML = thisCart.totalPrice;
      }
      
      // zmiany z getelementbyId bo nie mam pojęcia 
      document.getElementById('subtotal').innerHTML = subtotalPrice;
      
      document.getElementById('total').innerHTML = thisCart.totalPrice;
      console.log("Total number of products: " + totalNumber);
      console.log("Subtotal price: " + subtotalPrice);
      console.log("Total price: " + thisCart.totalPrice);
    }
    
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
  
      // Przypisanie obiektu menuProduct do instancji thisCartProduct
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
  
      // Wywołanie metody getElements
      thisCartProduct.getElements(element);

      // Inicjalizacja widgetu ilości
      thisCartProduct.initAmountWidget();
      
      thisCartProduct.initActions();

      // Wyświetlenie instancji w konsoli
      //console.log('New CartProduct:', thisCartProduct);
    }
  
    getElements(element) {
      const thisCartProduct = this;
  
      // Tworzenie pustego obiektu dom
      thisCartProduct.dom = {};
  
      // Przypisanie elementu DOM
      thisCartProduct.dom.wrapper = element;
  
      // Wyszukanie elementów we wrapperze
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.CartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.CartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.CartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.CartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;
  
      // Tworzenie instancji AmountWidget
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
  
      // Nasłuchiwacz zmiany wartości widgetu
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        // Aktualizacja wartości ilości
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
  
        // Aktualizacja ceny
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
  
        // Aktualizacja widoku ceny w interfejsie
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;
    
      // Nasłuchiwacz na kliknięcie przycisku "edit" - na razie nic nie robi
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('Edit button clicked');
        // Tu możemy później dodać logikę edytowania produktu w koszyku
      });
    
      // Nasłuchiwacz na kliknięcie przycisku "remove"
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('Remove button clicked');
        // Wywołanie metody remove(), aby wyemitować zdarzenie i usunąć produkt
        thisCartProduct.remove();
      });
    }
  }
  const app = {
      
    initMenu: function(){
      const thisApp =this;
      //console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new cart(cartElem);
    },
    init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    
          thisApp.initData();
          thisApp.initMenu();
          thisApp.initCart();
    },
    
  };
  
  app.init();
  }