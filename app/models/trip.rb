class Trip < ActiveRecord::Base
  validates :name, :presence=>true
  has_many :stops
  has_many :images, through: :stops

  has_many :trip_stops, inverse_of: :trip, dependent: :destroy
  has_many :stops, through: :trip_stops
end
