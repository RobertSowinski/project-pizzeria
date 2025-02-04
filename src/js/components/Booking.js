import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
  constructor(element) {
    const thisBooking = this;
    
    thisBooking.render(element); // Etap 1: Renderuj szablon
    thisBooking.initWidgets();   // Etap 2: Inicjalizuj widgety
  }

  render(element) {
    const thisBooking = this;

    // Generuj HTML z szablonu (bez danych)
    const generatedHTML = templates.bookingWidget();
    
    // Tworzymy pusty obiekt thisBooking.dom
    thisBooking.dom = {};
    
    // Przypisujemy kontener (wrapper) z argumentu
    thisBooking.dom.wrapper = element;

    // Zmieniamy zawartość wrappera na wygenerowany HTML
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    // ETAP 2: Znajdź elementy w nowo utworzonym HTML
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    // Dodanie referencji do DatePicker i HourPicker
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

  }

  initWidgets() {
    const thisBooking = this;

    
    // Tworzymy instancje AmountWidget dla obu inputów
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    
    // Tworzymy instancje nowych widgetów
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    //console.log('hourPicker: ', thisBooking.dom.hourPicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;