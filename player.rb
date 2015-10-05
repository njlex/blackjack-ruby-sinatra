class Player
  attr_accessor :cards, :total_value, :turn

  HAND = { lose: 0, push: 1, win: 2, blackjack: 3 }

  def initialize
    @cards = []

    @turn = false
  end

  def is_blackjack?
    self.card_total == 21
  end

  def is_busted?
    self.card_total > 21
  end

  def card_total
    @total_value = 0

    @cards.each do |card| 
      value = card.to_i

      if card.value == 'ace' && ((@total_value + value) > 21)
        @total_value += 1
      else
        @total_value += value
      end
    end

    @total_value
  end

  def to_s
    @cards.join(", ")
  end

  def to_a
    @cards.map { |card| card.to_a }
  end

  def to_i
    card_total
  end
end
