require_relative 'card'

class Deck
  SUITS = ['heart', 'club', 'diamond', 'spade']
  CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']

  attr_accessor :cards

  def initialize
    @cards = []

    SUITS.product(CARDS).each do |card|
      @cards << Card.new(card[0], card[1])
    end
  end

  def shuffle
    @cards.shuffle!
  end

  def deal(player)
    player.cards << @cards.pop
  end
end
