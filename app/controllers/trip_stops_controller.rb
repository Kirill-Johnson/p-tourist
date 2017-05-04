class TripStopsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  before_action :set_trip_stop, only: [:show, :update, :destroy]
  before_action :set_trip, only: [:associated_stops, :linkable_stops]
  before_action :set_stop, only: [:index, :destroy, :update]
  wrap_parameters :trip_stop, include: ["trip_id", "stop_id"]

  after_action :verify_authorized

 # Some authorizations currently doesn't make much sense, but would be needed for extending features (i.e. adding by users, etc.)

  def index
    authorize @stop, :get_trips?
    @trip_stops = TripStop.where(stop_id: params["stop_id"]).with_name
  end

  def show
    authorize @stop, :get_trips?
    render json: @trip_stop
  end

  def create
    link_params = trip_stop_params.merge({stop_id: params[:stop_id], trip_id: params[:trip_id]})
    @trip_stop = TripStop.new(link_params)
    @stop = Stop.where(id: @trip_stop.stop_id).first
    @trip = Trip.where(id: @trip_stop.trip_id).first
    # Check trip and stop exist
    if ! @trip
      render json: {errors: "Cannot find trip #{@trip_stop.trip_id}"}, status: :bad_request
      skip_authorization
    elsif ! @stop
      render json: {errors: "Cannot find stop #{@trip_stop.stop_id}"}, status: :bad_request
      skip_authorization
    else
      authorize @stop, :add_trip?
      if @trip_stop.save
        head :no_content
      else
        pp @trip_stop.errors.messages
        render json: {errors:@trip_stop.errors.messages}, status: :unprocessable_entity
        skip_authorization
      end
    end
  end

  def update
    authorize @stop, :update_trip?
    @trip_stop = TripStop.find(params[:id])

    if @trip_stop.update(trip_stop_params)
      head :no_content
    else
      render json: @trip_stop.errors, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @stop, :remove_trip?
    @trip_stop.destroy
    head :no_content
  end

  def associated_stops
    authorize Stop, :get_trips?
    render json: Stop.with_trip(@trip).name_only
  end

  def linkable_stops
    authorize Stop, :get_linkables?
    render json: StopPolicy::Scope.new(current_user, Stop.all).user_roles(true, false).name_only.without_trip(@trip)
  end

  private

    def set_trip_stop
      @trip_stop = TripStop.find(params[:id])
    end

    def set_trip
      @trip = Trip.find(params[:trip_id])
    end

    def set_stop
      @stop = Stop.find(params[:stop_id])
    end

    def trip_stop_params
      params.require(:trip_stop).tap {|p|
        #_ids only required in payload when not part of URI
        p.require(:trip_id)    if !params[:trip_id]
        p.require(:stop_id)    if !params[:stop_id]
      }.permit(:trip_id, :stop_id)
    end
end
