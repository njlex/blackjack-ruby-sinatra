require 'sinatra'
require 'sinatra/json'

require_relative 'deck'
require_relative 'player'

enable :sessions
set :session_secret, 'blackjack'

def check_hand(of = nil)
  puts "hello"
  hand = false

  # Initial first 2 cards have been dealt
  if of == 'player'
    if session['player'].is_blackjack? && session['dealer'].is_blackjack?
        hand = Player::HAND[:push]
    elsif session['player'].is_blackjack?
        hand = Player::HAND[:blackjack]
    elsif session['player'].is_busted?
      hand = Player::HAND[:lose]
    end
  end

  if hand == false && session['dealer'].card_total >= 17
    if session['dealer'].is_blackjack?
      hand = Player::HAND[:lose]
    elsif session['dealer'].is_busted?
      hand = Player::HAND[:win]
    elsif session['dealer'].card_total > session['player'].card_total
      # Showdown
      hand = Player::HAND[:lose]
    elsif session['player'].card_total > session['dealer'].card_total
      # Showdown
      hand = Player::HAND[:win]
    end
  end

  hand
end

get '/' do
  if !session['name'].nil?
    redirect '/game'
  end

  erb :index 
end

post '/' do
  session['name'] = params['name']

  redirect '/place_bet'
end

get '/place_bet' do
  erb :place_bet
end

post '/place_bet' do
  session['bet'] = params['bet']

  redirect '/game'
end

get '/game' do
   #session['dealer'].cards.pop
   #session['dealer'].cards << Card.new('heart', 'ace')
  if session['name'].nil?
    redirect '/'
  end

  if session['deck'].nil?
    session['deck'] = Deck.new
    session['dealer'] = Player.new
    session['player'] = Player.new

    session['deck'].shuffle
    session['deck'].shuffle
    session['deck'].shuffle
  end

  erb :game
end

get '/api/deal/:to' do
  session['deck'].deal session[params[:to]]

  json :success => true, :data => session[params[:to]].to_a, :card_total => session[params[:to]].card_total, :hand => check_hand(params[:to]) 
end

get '/api/cards' do
  if !session['dealer'].nil?
    json :success => true, :data => { 
      :player => { 
        :cards => session['player'].to_a, 
        :card_total => session['player'].card_total 
      }, 
      :dealer => { 
        :cards => session['dealer'].to_a, 
        :card_total => session['dealer'].card_total 
      } 
    }, :hand => check_hand
  else
    json :success => true, :data => []
  end
end

get '/api/cards/:of' do
  if !session[params[:of]].nil?
    json :success => true, :data => session[params[:of]].to_a, :card_total => session[params[:of]].card_total, :hand => check_hand(:of)
  else
    json :success => true, :data => []
  end
end

get '/api/show_down' do
    json :success => true, :data => { 
      :player => { 
        :cards => session['player'].to_a, 
        :card_total => session['player'].card_total 
      }, 
      :dealer => { 
        :cards => session['dealer'].to_a, 
        :card_total => session['dealer'].card_total 
      } 
    }, :hand => check_hand('dealer')
end

get '/new_game' do
  session['deck'] = nil 
  session['dealer'] = nil 
  session['player'] = nil 
  session['bet'] = nil 

  redirect '/place_bet'
end

get '/quit' do
  session.clear

  redirect '/'
end
