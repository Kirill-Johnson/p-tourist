json.array!(@stop_images) do |si|
  json.extract! si, :id, :stop_id, :image_id, :priority, :creator_id, :created_at, :updated_at
  json.stop_name si.stop_name        if si.respond_to?(:stop_name)
  json.image_caption si.image_caption  if si.respond_to?(:image_caption)
  json.image_content_url image_content_url(si.image_id)    if si.image_id

  if si.respond_to?(:lng) && si.lng
    json.position do
      json.lng si.lng
      json.lat si.lat
    end
  end
  if si.respond_to?(:distance) && si.distance && si.distance >= 0
    json.distance si.distance.to_f
  end
end
