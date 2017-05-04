json.array!(@trip_stops) do |ts|
  json.extract! ts, :id, :stop_id, :trip_id, :created_at, :updated_at
  json.trip_name ts.trip_name  if ts.respond_to?(:trip_name)
end
