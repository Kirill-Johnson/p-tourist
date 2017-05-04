json.extract! trip_stop, :id, :stop_id, :trip_id, :created_at, :updated_at
json.url trip_stop_url(trip_stop, format: :json)
