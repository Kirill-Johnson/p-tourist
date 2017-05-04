class TripStop < ActiveRecord::Base
  belongs_to :stop
  belongs_to :trip

  validates :trip_id, :stop_id, presence: true
  scope :with_name, ->{ joins(:trip).select("trip_stops.*, trips.name AS trip_name")}
end
