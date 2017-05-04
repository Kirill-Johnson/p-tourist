class CreateTripStops < ActiveRecord::Migration
  def change
    create_table :trip_stops do |t|
      t.references :stop, index: true, foreign_key: true
      t.references :trip, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
