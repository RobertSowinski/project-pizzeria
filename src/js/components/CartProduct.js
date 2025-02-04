import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';


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
    console.log('New CartProduct:', thisCartProduct);
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

    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);

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

  getData(){
    const thisCartProduct = this;
    return {
      id: thisCartProduct.id, // id produktu
      amount: thisCartProduct.amount, // ilość
      price: thisCartProduct.price, // cena za produkt
      priceSingle: thisCartProduct.priceSingle, // cena jednostkowa
      name: thisCartProduct.name, // nazwa produktu
      params: thisCartProduct.params // parametry, np. kolory, rozmiary
    };
  }
}
export default CartProduct;