class Card
  attr_accessor :suit, :value

  def initialize(suit, value)
    @suit = suit
    @value = value
  end

  def to_i 
    if @value == 'ace'
      11
    elsif @value.to_i == 0
      10
    else
      @value.to_i
    end
  end

  def to_s
    "#{@suit} #{@value}"
  end

  def to_a
    [@suit, @value]
  end
end
