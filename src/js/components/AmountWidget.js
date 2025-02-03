import {settings, select} from '../settings.js';
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
export default AmountWidget;