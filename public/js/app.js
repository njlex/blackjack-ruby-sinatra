var App = {
  tableWidth: $('#blackjack-table').width(),
}

var Card = function(suit, value) {
  this.suit = suit;
  this.value = value;
}

Card.WIDTH = 168;

Card.prototype.getValue = function() {
  if( this.value == 'A' )
    return 11;
  else if( this.value == 0 )
    return 10;
  else
    return parseInt(this.value);
}

Card.flip = function(id) {
  Game.audio.play( Game.audio.flip );

  $('#' + id).removeClass('no-flip').addClass('flipped');
}

var Player = function(elementID, isDealer) {
  this.id = elementID;
  this.cards = 0;
  this.isDealer = !(typeof isDealer === 'undefined');
  this.cardTotal = 0;
}

Player.hand = {
  LOSE: 0,
  PUSH: 1,
  WIN: 2,
  BLACKJACK: 3
};


Player.prototype.showCards = function() {
  var flipInterval = 0;
  var i = 0;

  var me = this
  Game.interval.flip = setInterval(function(){
    Game.audio.play( Game.audio.flip );

    Card.flip( ( me.isDealer ? 'flip-card-dealer-' : 'flip-card-player-'  ) + i );

    if( i == me.cards )
      clearInterval( Game.interval.flip )

    i++;
  }, 500);
}

Player.hit = function() {
  deck.deal( player );
}

Player.stay = function() {
  if( dealer.cardTotal < 17 ) {
    Game.status.dealersTurn = true;

    deck.deal( dealer, function repeat_deal(){
      if( dealer.cardTotal < 17 )
        deck.deal( dealer, repeat_deal );
    });
  } else {
    // Showdown
    $.get('/api/show_down', function(response){
      Game.checkWinner( response.hand );
    });
  }
}

var Deck = function() {
  this.queue = [];
  this.cards = 0;

  var flipCard, card, width;

  for( var i = 0, j = 3; i < 3; i++, j-- ) {
    flipCard = document.createElement( 'div' );
    flipCard.setAttribute( 'class', 'deck-card flip-card no-flip' );

    card = document.createElement( 'div' );
    card.setAttribute( 'class', 'card card-back' );

    flipCard.appendChild( card );

    width = App.tableWidth - ( Card.WIDTH * j ) + (j * 5);
    flipCard.style.transform = 'translate(' + width + 'px, ' + i + 5 + 'px)';
    flipCard.style.left = (Card.WIDTH * (j-1)) + 'px';
    flipCard.style.zIndex = i;
    flipCard.setAttribute( 'id', 'flip-card-0' + j );

    $( '#dealer-cards' ).prepend( flipCard );
  }
};

Deck.prototype.shuffle = function() {
  Game.audio.play( Game.audio.shuffle );
}

Deck.prototype.deal = function(player, callback) {
  Game.status.dealing = true;

  deck = this;
  $.get('/api/deal/' + ( player.isDealer ? 'dealer' : 'player' ), function(response) {
    Game.audio.play( Game.audio.deal );

    deck.cards++;
    player.cards++;
    player.cardTotal = response.card_total;

    var flipCard = document.createElement( 'div' );
    flipCard.setAttribute( 'class', 'flip-card ' + ( player.isDealer ? 'dealer-card' : 'player-card' ) );

    var card = document.createElement( 'div' );
    card.setAttribute( 'class', 'card ' + response.data[player.cards-1][0] + '-' + response.data[player.cards-1][1] );

    flipCard.appendChild( card );

    var card = document.createElement( 'div' );
    card.setAttribute( 'class', 'card card-back' );

    flipCard.appendChild( card );


    if( player.isDealer ) {
      var width = App.tableWidth - ( Card.WIDTH * player.cards ) + 5;
      flipCard.style.transform = 'translate(' + width + 'px, 25px)';
      flipCard.style.left = ( Card.WIDTH * ( player.cards - 1) ) + 'px';
      flipCard.style.zIndex = 4 + ( player.cards - 1);
      flipCard.setAttribute( 'id', 'flip-card-dealer-' + player.cards );
      flipCard.setAttribute( 'class', 'flip-card no-flip' );
    } else {
      var width = ( Card.WIDTH * ( player.cards - 1 ) ) - 10;
      flipCard.style.transform = 'translate(' + width + 'px, -316px)';
      flipCard.style.right = ( Card.WIDTH * ( player.cards - 1 )  ) + 'px';
      flipCard.style.zIndex = 4 + ( player.cards - 1 );
      flipCard.setAttribute( 'id', 'flip-card-player-' + player.cards );
    }

    $( '#' + player.id ).append( flipCard );

    id = player.cards;
    setTimeout( function() {
      $('#flip-card-' + ( player.isDealer ? 'dealer-' : 'player-' ) + id).css('transform', "translate(0, 0)");

      // This is the players card then we can show it to the player
      if( !player.isDealer ) {
        Card.flip( 'flip-card-' + ( player.isDealer ? 'dealer-' : 'player-' ) + id );

        Game.checkWinner( response.hand );
      } else if( Game.status.dealersTurn ) {
        if( typeof callback !== 'undefined' )
          callback();

        Game.checkWinner( response.hand );
      }
    }, 100);

    Game.status.dealing = false;
  });
}

var Game = function() {};

Game.init = function() {
  $.get('/api/cards', function(response){
    var cards = response.data.dealer.cards;

    dealer.cards = cards.length;
    dealer.cardTotal = response.data.dealer.card_total;
    deck.cards += dealer.cards;
    
    for( var i = 0; i < cards.length; i++ ) {
      var flipCard = document.createElement( 'div' );
      flipCard.setAttribute( 'class', 'flip-card no-flip dealer-card' );

      var card = document.createElement( 'div' );
      card.setAttribute( 'class', 'card ' + cards[i][0] + '-' + cards[i][1] );
      flipCard.appendChild( card );

      var card = document.createElement( 'div' );
      card.setAttribute( 'class', 'card card-back' );
      flipCard.appendChild( card );

      flipCard.style.left = (Card.WIDTH * i) + 'px';
      flipCard.style.zIndex = i;
      flipCard.setAttribute( 'id', 'flip-card-dealer-' + i );

      $( '#dealer-cards' ).prepend( flipCard );
    }

    $('#dealer-card-total-value').text( dealer.cardTotal );

    cards = response.data.player.cards
    player.cards = cards.length;
    player.cardTotal = response.data.player.card_total;
    deck.cards += player.cards;

    for( var i = 0; i < cards.length; i++ ) {
      var flipCard = document.createElement( 'div' );
      flipCard.setAttribute( 'class', 'flip-card flipped player-card' );

      var card = document.createElement( 'div' );
      card.setAttribute( 'class', 'card ' + cards[i][0] + '-' + cards[i][1] );
      flipCard.appendChild( card );

      var card = document.createElement( 'div' );
      card.setAttribute( 'class', 'card card-back' );
      flipCard.appendChild( card );

      flipCard.style.right = ( Card.WIDTH * i  ) + 'px';
      flipCard.style.zIndex = i;
      flipCard.setAttribute( 'id', 'flip-card-player-' + i );

      $( '#player-cards' ).prepend( flipCard );
    }

    if( deck.cards > 0 ) {
      $('#player-controls').show();
      $('#start-button').hide();

      Card.flip( 'flip-card-dealer-0' );

      Game.status.started = true;
    } else {
      $('#player-controls').hide();
      $('#start-button').show();

      Game.status.started = false;
    }

    Game.checkWinner( response.hand );
  });
}

Game.audio = {
  shuffle: new Audio('/audio/shuffle.mp3'),
  deal: new Audio('/audio/deal.mp3'),
  flip: new Audio('/audio/flip.mp3'),
  play: function(audio) {
    if( Game.sound )
      audio.play();
  },
  win: new Audio('/audio/game-win.mp3'),
  lost: new Audio('/audio/game-lost2.mp3')
}

Game.sound = true;

Game.soundOn = function() {
  Game.sound = true;
}

Game.soundOff = function() {
  Game.sound = false;
}

Game.interval = {
  queue: 0,
  flip: 0,
  deal: 0
}

Game.status = {
  started: false,
  finished: false,
  dealing: false,
  dealersTurn: false
}

Game.checkWinner = function( hand ) {
  if( hand === Player.hand.WIN || hand === Player.hand.BLACKJACK ) {
    Game.showWinnerDialog();

    Game.status.started = false;
    Game.status.finished = true;
  } else if( hand === Player.hand.LOSE || hand === Player.hand.PUSH ) {
    Game.showLoserDialog();

    Game.status.started = false;
    Game.status.finished = true;
  }

  $('#player-card-total-value').text( player.cardTotal );
  console.log( 'Dealer total: ', dealer.cardTotal );
}

Game.start = function() {
  var queue = [ player, dealer, player, dealer ];
  var i = 0;

  Game.status.started = true;
  Game.status.finished = false;
  Game.status.dealing = true;

  // Animate initial deal
  // Each deal must be executed by interval 
  // since we won't be able to see the deal
  // animation if it is called successively
  Game.interval.queue = setInterval(function(){
    Game.audio.play( Game.audio.deal );

    deck.deal( queue[i++] );

    if( i == queue.length ) {
      clearInterval( Game.interval.queue );

      $('#player-controls').show();
      $('#start-button').hide();

      Game.status.dealing = false;
    }
  }, 1000);
}

Game.showWinnerDialog = function() {
  Game.status.finished = true;
  Game.status.started = false;

  dealer.showCards();

  setTimeout(function(){
    Game.audio.play( Game.audio.win );

    $('.winner-dialog').fadeIn();
  }, (dealer.cards + 1) * 1000);
}

Game.showLoserDialog = function() {
  Game.status.finished = true;
  Game.status.started = false;

  dealer.showCards();

  setTimeout(function(){
    Game.audio.play( Game.audio.lost );

    $('.loser-dialog').fadeIn();
  }, (dealer.cards + 1) * 800);
}


var deck = new Deck();

var dealer = new Player('dealer-cards', true);
var player = new Player('player-cards');

$(function() {
  $('#start-button').click(function(e) {
    deck.shuffle();

    setTimeout(function(){
      Game.start();
    }, 4000);
  });

  $('body').keyup(function(e){
    if( Game.status.started && !Game.status.finished && !Game.status.dealing ) {
      if( e.keyCode == 72 ) {
        // H key

        Player.hit();
      } else if( e.keyCode == 83 ) {
        // S key

        Player.stay();
      }
    }
  });

  $('#toggle-sound').click(function(e){
    e.preventDefault();

    if( Game.sound ) {
      Game.soundOff();
      $(this).text('Sound Off');
    } else {
      Game.soundOn();
      $(this).text('Sound On');
    }
  });

  Game.init();
});
