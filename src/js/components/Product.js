import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
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

    //const productSummary = thisProduct.prepareCartProduct();
    //app.cart.add(productSummary);

    const event = new CustomEvent('add-to-cart',{
      bubbles:true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;