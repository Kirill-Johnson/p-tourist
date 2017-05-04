class StopImage < ActiveRecord::Base
  belongs_to :image
  belongs_to :stop
  acts_as_mappable :through => :image

  validates :image, :stop, presence: true

  scope :prioritized,-> { order(:priority=>:asc) }
  scope :stops,     -> { where(:priority=>0) }
  scope :primary,    -> { where(:priority=>0).first }

  scope :with_stop, ->{ joins("left outer join stops on stops.id = stop_images.stop_id")
                         .select("stop_images.*")}
  scope :with_image, ->{ joins("right outer join images on images.id = stop_images.image_id")
                         .select("stop_images.*","images.id as image_id")}
  scope :with_trip, ->(id) { joins("join trip_stops on stop_images.stop_id = trip_stops.stop_id")
                             .select("stop_images.*", "trip_stops.trip_id")
                             .where("trip_stops.trip_id" => id)}

  scope :with_name,    ->{ with_stop.select("stops.name as stop_name")}
  scope :with_caption, ->{ with_image.select("images.caption as image_caption")}
  scope :with_position,->{ with_image.select("images.lng, images.lat")}
  scope :within_range, ->(origin, limit=nil, reverse=nil) {
    scope=with_position
    scope=scope.within(limit,:origin=>origin)                   if limit
    scope=scope.by_distance(:origin=>origin, :reverse=>reverse) unless reverse.nil?
    return scope
  }

  def self.with_distance(origin, scope)
    scope.select("-1.0 as distance").with_position
         .each {|si| si.distance = si.distance_from(origin) }
  end

  def self.last_modified
=begin
    m1=Stop.maximum(:updated_at)
    m2=Image.maximum(:updated_at)
    m3=StopImage.maximum(:updated_at)
    [m1,m2,m3].max
=end
    unions=[Stop,Image,StopImage].map {|s| 
              "select max(updated_at) as modified from #{s.table_name}\n" 
            }.join(" union\n")
    sql   ="select max(modified) as last_modified from (\n#{unions}) as x"
    value=connection.select_value(sql)
    Time.parse(value + "UTC") if value
  end
end
