class CreateTrips < ActiveRecord::Migration
  def change

    create_table :trips do |t|
      t.string :name, {null: false}
      t.integer :creator_id

      t.timestamps null: false
  end

    create_table :stops do |t|
      t.string :name, {null: false}
      t.text :description
      t.text :notes
      #t.float :lng
      #t.float :lat
      t.integer :creator_id
      t.references :trip, {index: true, foreign_key: true, null:false}

      t.timestamps null: false
    end

  #add_index :stops, [:lng, :lat]

  end
end
