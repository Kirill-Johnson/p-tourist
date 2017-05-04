class Stop < ActiveRecord::Base
  validates :name, :presence=>true
  has_many :stop_images, inverse_of: :stop, dependent: :destroy

  scope :not_linked, ->(image) { where.not(:id=>StopImage.select(:stop_id)
                                                          .where(:image=>image)) }

  has_many :trip_stops, inverse_of: :stop, dependent: :destroy
  has_many :trips, through: :trip_stops

  scope :with_trip, ->(trip) {where(id: TripStop.select(:stop_id).where(trip: trip))}
  scope :without_trip, ->(trip) { where.not(id: TripStop.select(:stop_id).where(trip: trip)) }
  scope :name_only, -> {unscope(:select).select("stops.id, name AS stop_name")}
end
