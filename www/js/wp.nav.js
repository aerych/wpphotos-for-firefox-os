/*
	wp.Nav
	Manages view navigation.  Inspired by the behavior of the iOS UINavigationController. 
	DOM elements representing a view are pushed onto or popped onto the dispaly stack and animated and on or off screen.
	
	Requires: wp.nav.css
	
	ctor options
		container : The DOM node acting as a container for elements acting as views.
		
	Usage:
		var nav = new wp.Nav(element);
		nav.pushView(element);
		nav.popView();
		nav.popToView(element);
		nav.popToRoot();
		nav.setViews(array);
		
*/

"use strict";

if(typeof(wp) == "undefined") { var wp = {} };

wp.nav = {

  stage:null,
  
  transitions: ["scrollLeft", "coverUp", "none"],

  init: function() {
    this.stage = document.getElementById('stage');
    var self = this;
    this.stage.addEventListener('shuffleend', function(e){
      self._trimDeck();
    });
  },
  
  push: function(page, transition) {
    var card = this._fetchCard(page, transition);
    this.stage.appendChild(card);
    
    var allCards = this.stage.getAllCards();
    this.stage.shuffleTo(allCards.indexOf(card));
  },
  
  pop: function() {
    var currIndex = this.stage.selectedIndex;
    if (currIndex > 0) {
      var card = this.stage.cards[currIndex-1];
      if (card.transitionOverride == "none") {
        card.transitionOverride = "scrollLeft";
      }
    }
    this.stage.historyBack();
  },
  
  setPage: function(page, transition) {
    var card = this._fetchCard(page, transition);
    
    this.stage.insertBefore(card, this.stage.firstChild);
    
    var allCards = this.stage.getAllCards();
    this.stage.shuffleTo(allCards.indexOf(card));
  },
  
  _trimDeck: function() {
    var allCards = this.stage.getAllCards();
    var currentCard = this.stage.getSelectedCard();
    for (var i = allCards.length; i > 0; i--) {
      var card = this.stage.getCardAt(i-1);
      if (card != currentCard) {
        this.stage.removeChild(card);
      } else {
        return;
      };
    };
  },
  
  _fetchCard: function(page, transition) {
    var allCards = this.stage.getAllCards();
    for(var card in allCards) {
      if (card.cardName == page) {
        return card;
      };
    };
  
    var view = this._fetchPage(page);
    if (!page) {
      alert("Page does not exist.");
      return;
    };
    
    var card = document.createElement("x-card");
    card.cardName = page;
    if (this._isValidTransition(transition)) {
      card.transitionOverride = transition;
    };
    card.appendChild(view.el);
    return card;
  },
  
  _isValidTransition: function(transition) {
    if(!transition){
      return false;
    };
    
    for(var t in this.transitions) {
      if (this.transitions[t] == transition) {
        return true;
      };
    };
    
    return false;
  },
  
  _fetchPage: function(page) {
    var view;
    
    switch(page) {
      case 'start':
        view = new wp.views.StartPage();
        break;
      case 'login':
        view = new wp.views.LoginPage();
        break;
      case 'posts':
        view = new wp.views.PostsPage();
        break;
      case 'editor':
        view = new wp.views.EditorPage();
        break;
      case 'settings':
        view = new wp.views.SettingsPage();
        break;
      case 'about':
        view = new wp.views.AboutPage();
        break;
    };
    
    return view;
  }
  
};
