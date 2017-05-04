# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#  Mayor.create(name: 'Emanuel', city: cities.first)

# Trip logs:

#Stop.destroy_all
#Trip.destroy_all
#StopImage.destroy_all
#TripStop.destroy_all


Trip.create(name: 'Trip 1')
Trip.create(name: 'Trip 2')

Stop.create(name: 'Stop 1', trip_id: "1", description: "Description of the stop 1", notes: "Notes of the stop 1")
Stop.create(name: 'Stop 2', trip_id: "2", description: "Description of the stop 2", notes: "Notes of the stop 2")

StopImage.create(image_id: "1", stop_id: "1", creator_id: "2", priority: "0")
StopImage.create(image_id: "2", stop_id: "2", creator_id: "3", priority: "0")

TripStop.create(stop_id: "1", trip_id: "1")
TripStop.create(stop_id: "2", trip_id: "2")
