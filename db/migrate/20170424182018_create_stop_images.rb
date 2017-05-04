class CreateStopImages < ActiveRecord::Migration
  def change
    create_table :stop_images do |t|

      t.references :image, {index: true, foreign_key: true, null:false}
      t.references :stop, {index: true, foreign_key: true, null:false}
      t.integer :creator_id
      t.integer :priority, {null:false, default:5}

      t.timestamps null: false
    end
  end
end
