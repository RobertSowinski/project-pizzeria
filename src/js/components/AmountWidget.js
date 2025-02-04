import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    //console.log('AmountWidget: ', thisWidget);
    //console.log('Constructor arguments: ', element);

    thisWidget.getElements(element);
    thisWidget.rendervalue();

    thisWidget.initActions();
  }

  getElements(){
    const thisWidget = this;
  

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value)
     && value >= settings.amountWidget.defaultMin
     && value <= settings.amountWidget.defaultMax;
  }

  rendervalue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;

    // Listener dla zmiany wartości inputa
    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    // Listener dla kliknięcia w "decrease"
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    // Listener dla kliknięcia w "increase"
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  
}
export default AmountWidget;