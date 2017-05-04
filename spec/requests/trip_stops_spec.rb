require 'rails_helper'

RSpec.describe "TripStops", type: :request do
  describe "GET /trip_stops" do
    it "works! (now write some real specs)" do
      get trip_stops_path
      expect(response).to have_http_status(200)
    end
  end
end
