import { select, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    
    thisBooking.element = element;
    
    thisBooking.render(element); // Etap 1: Renderuj szablon
    thisBooking.initWidgets();   // Etap 2: Inicjalizuj widgety
    thisBooking.getData();
  }
  
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:  settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events +'?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('getData url : ', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
    
      .then(function(allResponse){
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
      });
  }
  render() {
    const thisBooking = this;

    // Generuj HTML z szablonu (bez danych)
    const generatedHTML = templates.bookingWidget();
    
    // Tworzymy pusty obiekt thisBooking.dom
    thisBooking.dom = {};
    
    // Przypisujemy kontener (wrapper) z argumentu
    thisBooking.dom.wrapper = thisBooking.element;

    // Zmieniamy zawartość wrappera na wygenerowany HTML
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    // ETAP 2: Znajdź elementy w nowo utworzonym HTML
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    // Dodanie referencji do DatePicker i HourPicker
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    console.log(thisBooking.dom.datePicker);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    console.log(thisBooking.dom.hourPicker);
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