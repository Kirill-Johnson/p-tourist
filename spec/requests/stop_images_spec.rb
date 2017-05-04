require 'rails_helper'

RSpec.describe "StopImages", type: :request do
  describe "GET /stop_images" do
    it "works! (now write some real specs)" do
      get stop_images_path
      expect(response).to have_http_status(200)
    end
  end
end
