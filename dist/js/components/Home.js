import {templates,select} from '../settings.js';
class Home {
  constructor(element){
    const thisHome=this;
    thisHome.element=element;
    //console.log(thisHome.element);
    thisHome.render();
    thisHome.initCarousel();
  }
  render(){
    const thisHome=this;
    const generateHTML=templates.homePage();
    thisHome.dom={};
    thisHome.dom.wrapper=thisHome.element;
    thisHome.dom.wrapper.innerHTML=generateHTML;
    thisHome.dom.carousel=thisHome.dom.wrapper.querySelector(select.home.carousel);
  }
  initCarousel(){
    const thisHome=this;
    thisHome.carousel= new Flickity (thisHome.dom.carousel,{
      cellAlign: 'left',
      contain: true,
      autoPlay: 5000,
      prevNextButtons: false,
      pageDots: true,
      wrapAround: true,
    });
  }
}
export default Home;