import {select, classNames, settings, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);

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

    // Nasłuchiwacz na event 'submit' w produkcie
    thisCart.dom.form.addEventListener('submit', function (event) {
      // Przekazanie do metody thisCart.remove produktu, który ma zostać usunięty
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    // Pobieranie wartości z koszyka
    const payload = {
      address: thisCart.dom.address.value, // Adres z formularza
      phone: thisCart.dom.phone.value, // Telefon z formularza
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [] // Tymczasowo pusta tablica
    };
    // Zapełnianie payload.products przy użyciu metody getData
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData()); // Dodanie podsumowania produktu
    }

    console.log('Payload:', payload);

    // Wysłanie zamówienia do API
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
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

    // Zapisanie nowych wartości do obiektu thisCart
    thisCart.totalNumber = totalNumber; // Zapisanie totalNumber
    thisCart.subtotalPrice = subtotalPrice; // Zapisanie subtotalPrice
    thisCart.deliveryFee = totalNumber > 0 ? deliveryFee : 0; // Zapisanie deliveryFee, jeśli są produkty
    
    // Obliczanie całkowitej ceny
    if (totalNumber > 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    } else {
      thisCart.totalPrice = 0; // Jeśli koszyk jest pusty, cena całkowita to 0
    }

    // Zaktualizowanie danych w HTML
    thisCart.dom.totalNumber.innerHTML = totalNumber; // Aktualizacja liczby produktów

    // Używamy getElementById, bo przy pomocy getElementsByClassName / querySelector były błędy
    document.getElementById('subtotal').innerHTML = thisCart.subtotalPrice; // Subtotal price
    document.getElementById('total').innerHTML = thisCart.totalPrice; // Total price
    document.getElementById('delivery').innerHTML = thisCart.deliveryFee; // Delivery fee

    // Zaktualizowanie całkowitej ceny (TOTAL U GÓRY A NIE NA DOLE)
    for (const totalPriceElem of thisCart.dom.totalPrice) {
      totalPriceElem.innerHTML = thisCart.totalPrice; // Aktualizacja ceny w innych miejscach
    }

    console.log('Total number of products: ' + totalNumber);
    console.log('Subtotal price: ' + thisCart.subtotalPrice);
    console.log('Total price: ' + thisCart.totalPrice);
  }
}

export default cart;