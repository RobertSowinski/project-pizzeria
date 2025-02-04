import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    
    thisBooking.element = element;
    thisBooking.selectedTable = null;
    
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
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate<=maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    
    //console.log('thisBooking.booked' , thisBooking.booked);

    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock]== 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    
    thisBooking.resetSelectedTable();
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
    //console.log(thisBooking.dom.datePicker);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    //console.log(thisBooking.dom.hourPicker);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.tableWrapper=thisBooking.dom.wrapper.querySelector(select.booking.tableWrapper);

    console.log(thisBooking.dom.tables);
  }

  initWidgets() {
    const thisBooking = this;

    
    // Tworzymy instancje AmountWidget dla obu inputów
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('click', function(){});
    thisBooking.dom.hoursAmount.addEventListener('click', function(){});

    // Tworzymy instancje nowych widgetów
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    //console.log('hourPicker: ', thisBooking.dom.hourPicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.tableWrapper.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });
  }

  initTables(event){
    const thisBooking=this;

    const clickedElem=event.target;

    //check if clickedelement is a table
    if (clickedElem.classList.contains('table')){
      const tableId=clickedElem.getAttribute(settings.booking.tableIdAttribute);

      if (clickedElem.classList.contains(classNames.booking.tableBooked)){
        alert('Table is not available')
        return;
      }
      if (clickedElem.classList.contains(classNames.booking.tableSelected)){
        clickedElem.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTable=null;
      } else {
        thisBooking.resetSelectedTable();
        clickedElem.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable = tableId;
      }
      //console.log(thisBooking.selectedTable);
    }
  }

  resetSelectedTable(){
    const thisBooking=this;
    for (let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
    }
    thisBooking.selectedTable=null;
  }
}

export default Booking;